import pixelmatch from 'pixelmatch';
import type { Browser } from 'playwright';
import { PNG } from 'pngjs';

import type { RunEnv } from './capture.ts';
import { RENDER_VERSION, runPlan } from './capture.ts';
import { type Diff, type Finding, hash, key, type Plan, type Rect, type Result, slug, sourceId } from './model.ts';
import { fail, progress } from './output.ts';
import { crop, padRect } from './png.ts';
import { composeSheet, type Cell } from './sheet.ts';
import { fetchStories } from './story-index.ts';
import {
  baselineCheckout,
  baselineShas,
  findStorybook,
  logTail,
  mainCheckout,
  shotsDir,
  sleep,
  stop,
} from './storybook.ts';
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  renameSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

/** Baselines (the same captures rendered at a ref, in a git worktree with its own Storybook) and pixel diffs. */

const git = (...args: ReadonlyArray<string>) =>
  execFileSync('git', args, { cwd: mainCheckout.root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

/** Per ref, render version and runtime: a change to how pixels or findings are made invalidates the cache. */
const cacheDir = (sha: string, runtime: string) =>
  path.join(shotsDir, 'baseline-cache', sha, hash(`${RENDER_VERSION}:${runtime}`, 8));

/** Caches and other per-checkout state that must not be shared with the main checkout. */
const unshared = new Set(['.vite', '.cache', '.vite-storybook', '.tmp']);

/**
 * Recreates `source`'s node_modules entries in `target`: pnpm's relative symlinks then resolve inside the worktree, so
 * workspace packages come from the ref while npm packages share the main checkout's store.
 */
const linkModules = (source: string, target: string) => {
  mkdirSync(target, { recursive: true });
  for (const entry of readdirSync(source)) {
    if (unshared.has(entry)) continue;
    const from = path.join(source, entry);
    const to = path.join(target, entry);
    const stat = lstatSync(from);
    if (stat.isSymbolicLink()) symlinkSync(readlinkSync(from), to);
    else if (entry.startsWith('@') && stat.isDirectory()) linkModules(from, to);
    else symlinkSync(from, to);
  }
};

const workspacePackages = (root: string): ReadonlyArray<string> =>
  ['apps', 'packages'].flatMap((group) =>
    existsSync(path.join(root, group))
      ? readdirSync(path.join(root, group))
          .map((name) => path.join(group, name))
          .filter((dir) => statSync(path.join(root, dir)).isDirectory())
      : [],
  );

const prepareWorktree = (sha: string, dir: string) => {
  progress(`baseline: worktree for ${sha.slice(0, 8)} at ${path.relative(mainCheckout.root, dir)}`);
  git('worktree', 'add', '--detach', '--force', dir, sha);
  const lockfile = (root: string) => readFileSync(path.join(root, 'pnpm-lock.yaml'), 'utf8');
  if (lockfile(dir) !== lockfile(mainCheckout.root)) {
    progress('baseline: lockfile differs; pnpm install --offline');
    execFileSync('pnpm', ['install', '--frozen-lockfile', '--offline'], {
      cwd: dir,
      stdio: ['ignore', 'ignore', 'inherit'],
    });
    return;
  }
  symlinkSync(path.join(mainCheckout.root, 'node_modules'), path.join(dir, 'node_modules'));
  for (const workspace of workspacePackages(mainCheckout.root)) {
    const modules = path.join(mainCheckout.root, workspace, 'node_modules');
    if (existsSync(modules) && existsSync(path.join(dir, workspace)))
      linkModules(modules, path.join(dir, workspace, 'node_modules'));
  }
};

/** The worktree at `sha`, created once; concurrent runs wait on a lock directory. */
const ensureWorktree = async (sha: string) => {
  const dir = baselineCheckout(sha).root;
  const ready = path.join(dir, '.shot-ready');
  const lock = `${dir}.lock`;
  const deadline = Date.now() + 5 * 60_000;
  while (!existsSync(ready)) {
    try {
      mkdirSync(path.dirname(lock), { recursive: true });
      mkdirSync(lock);
    } catch {
      if (Date.now() > deadline) fail(`baseline: ${lock} is held for over 5 minutes; remove it if no shot is running.`);
      await sleep(500);
      continue;
    }
    try {
      if (!existsSync(ready)) {
        rmSync(dir, { recursive: true, force: true });
        git('worktree', 'prune');
        prepareWorktree(sha, dir);
        writeFileSync(ready, '');
      }
    } finally {
      rmSync(lock, { recursive: true, force: true });
    }
  }
};

/** A cached baseline result (`checked`: with findings), or `absent`: the story did not exist or render at the ref. */
type Cached = (Result & { readonly checked: boolean }) | { readonly key: string; readonly absent: true };

const readCache = (dir: string): Map<string, Cached> => {
  const file = path.join(dir, 'results.json');
  if (!existsSync(file)) return new Map();
  return new Map(Object.entries(JSON.parse(readFileSync(file, 'utf8')) as Record<string, Cached>));
};

const writeCache = (dir: string, cache: ReadonlyMap<string, Cached>) => {
  const file = path.join(dir, 'results.json');
  const temporary = `${file}.${process.pid}.tmp`;
  writeFileSync(temporary, JSON.stringify(Object.fromEntries(cache)));
  renameSync(temporary, file);
};

export interface Baseline {
  readonly sha: string;
  /** Baseline results by key, rendering only the captures missing from the cache. */
  readonly results: (plan: Plan, checks: boolean) => Promise<ReadonlyMap<string, Result>>;
}

export const baselineFor = (ref: string, makeEnv: (outDir: string) => Promise<RunEnv>): Baseline => {
  let sha: string;
  try {
    sha = git('rev-parse', '--verify', `${ref}^{commit}`);
  } catch {
    return fail(`--ref ${ref} is not a commit.`);
  }
  return {
    sha,
    results: async (plan, checks) => {
      const env = await makeEnv('');
      const dir = cacheDir(sha, env.runtime);
      mkdirSync(dir, { recursive: true });
      const cache = readCache(dir);
      const missing = plan.filter((capture) => {
        const cached = cache.get(key(capture));
        return cached === undefined || (checks && !('absent' in cached) && !cached.checked);
      });
      if (missing.length > 0) {
        progress(`baseline: ${missing.length} of ${plan.length} captures at ${ref} (${sha.slice(0, 8)})`);
        await ensureWorktree(sha);
        const checkout = baselineCheckout(sha);
        const url = await findStorybook(checkout);
        const known = new Set((await fetchStories(url)).map((story) => story.id));
        const baselineEnv = { ...env, outDir: dir, url, logTail: () => logTail(checkout), checks };
        const present = missing.filter((capture) => known.has(sourceId(capture.source)));
        for (const capture of missing) {
          if (!known.has(sourceId(capture.source))) cache.set(key(capture), { key: key(capture), absent: true });
        }
        for (const result of await runPlan(baselineEnv, present)) {
          const broken = result.file === undefined;
          cache.set(result.key, broken ? { key: result.key, absent: true } : { ...result, checked: checks });
        }
        writeCache(dir, cache);
      }
      const results = new Map<string, Result>();
      for (const capture of plan) {
        const cached = cache.get(key(capture));
        if (cached !== undefined && !('absent' in cached)) results.set(cached.key, cached);
      }
      return results;
    },
  };
};

const decode = (file: string) => PNG.sync.read(readFileSync(file));

interface Compared {
  readonly diff: Diff;
  readonly before: PNG | undefined;
  readonly after: PNG | undefined;
  readonly highlight: PNG | undefined;
}

const changedColor = [255, 0, 0] as const;
const darkerColor = [0, 128, 255] as const;
const regionCell = 8;

/** Changed pixels grouped on an 8px grid; touching cells merge, so regions closer than 8px join. */
const regionsOf = (highlight: PNG): ReadonlyArray<Rect> => {
  const columns = Math.ceil(highlight.width / regionCell);
  const rows = Math.ceil(highlight.height / regionCell);
  const marked = new Uint8Array(columns * rows);
  const { data, width, height } = highlight;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const red = data[index]!;
      const green = data[index + 1]!;
      const blue = data[index + 2]!;
      const isChanged =
        (red === changedColor[0] && green === changedColor[1] && blue === changedColor[2]) ||
        (red === darkerColor[0] && green === darkerColor[1] && blue === darkerColor[2]);
      if (isChanged) marked[Math.floor(y / regionCell) * columns + Math.floor(x / regionCell)] = 1;
    }
  }
  const seen = new Uint8Array(columns * rows);
  const regions: Array<Rect> = [];
  for (let start = 0; start < marked.length; start++) {
    if (marked[start] === 0 || seen[start] === 1) continue;
    let minX = columns;
    let minY = rows;
    let maxX = 0;
    let maxY = 0;
    const stack = [start];
    seen[start] = 1;
    while (stack.length > 0) {
      const cell = stack.pop()!;
      const cx = cell % columns;
      const cy = Math.floor(cell / columns);
      minX = Math.min(minX, cx);
      minY = Math.min(minY, cy);
      maxX = Math.max(maxX, cx);
      maxY = Math.max(maxY, cy);
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= columns || ny >= rows) continue;
          const next = ny * columns + nx;
          if (marked[next] === 1 && seen[next] === 0) {
            seen[next] = 1;
            stack.push(next);
          }
        }
      }
    }
    const x = minX * regionCell;
    const y = minY * regionCell;
    regions.push({
      x,
      y,
      width: Math.min(width, (maxX + 1) * regionCell) - x,
      height: Math.min(height, (maxY + 1) * regionCell) - y,
    });
  }
  return regions.sort((a, b) => b.width * b.height - a.width * a.height);
};

const compare = (beforeFile: string, afterFile: string): Compared => {
  const before = decode(beforeFile);
  const after = decode(afterFile);
  if (before.width !== after.width || before.height !== after.height) {
    return {
      diff: {
        kind: 'resized',
        from: { width: before.width, height: before.height },
        to: { width: after.width, height: after.height },
      },
      before,
      after,
      highlight: undefined,
    };
  }
  const highlight = new PNG({ width: after.width, height: after.height });
  // Both sides render in the same Chromium, so equal input gives equal pixels: every changed pixel counts, anti-aliased
  // ones too (a 1px radius change only moves anti-aliasing).
  const pixels = pixelmatch(before.data, after.data, highlight.data, after.width, after.height, {
    threshold: 0,
    includeAA: true,
    diffColor: [...changedColor],
    diffColorAlt: [...darkerColor],
  });
  if (pixels === 0) return { diff: { kind: 'same' }, before, after, highlight: undefined };
  return { diff: { kind: 'changed', regions: regionsOf(highlight), pixels }, before, after, highlight };
};

/** Findings also present at the baseline (same check, message and selector) are known. */
const findingId = (finding: Finding) =>
  `${finding.check}|${finding.message.replace(/ \(×\d+\)$/, '')}|${finding.selector}`;

const compared = new Map<string, Compared>();

export const diffResults = (
  current: ReadonlyArray<Result>,
  baseline: ReadonlyMap<string, Result>,
): ReadonlyArray<Result> =>
  current.map((result) => {
    const before = baseline.get(result.key);
    const knownIds = new Set((before?.findings ?? []).map((value) => findingId(value)));
    const findings = result.findings.map((finding) =>
      knownIds.has(findingId(finding)) ? { ...finding, known: true } : finding,
    );
    if (result.file === undefined || !result.file.endsWith('.png') || result.capture.output.kind !== 'still') {
      return { ...result, findings };
    }
    if (before?.file === undefined || !existsSync(before.file)) return { ...result, findings, diff: { kind: 'new' } };
    const comparison = compare(before.file, result.file);
    compared.set(result.key, comparison);
    return { ...result, findings, diff: comparison.diff };
  });

const maxRegions = 6;

/** One PNG per story with changes: each changed region as before | after | diff, small regions at 2×. */
export const regionSheets = async (
  browser: Browser,
  outDir: string,
  results: ReadonlyArray<Result>,
): Promise<ReadonlyArray<string>> => {
  const byStory = new Map<string, Array<Result>>();
  for (const result of results) {
    if (result.diff?.kind === 'changed' || result.diff?.kind === 'resized') {
      byStory.set(sourceId(result.capture.source), [...(byStory.get(sourceId(result.capture.source)) ?? []), result]);
    }
  }
  const files: Array<string> = [];
  for (const [story, changed] of byStory) {
    const cells: Array<Cell> = [];
    for (const result of changed) {
      const comparison = compared.get(result.key)!;
      const label = slug(result.capture);
      if (result.diff?.kind === 'resized') {
        const { from, to } = result.diff;
        cells.push(
          { png: PNG.sync.write(comparison.before!), label: `${label} · before ${from.width}×${from.height}` },
          { png: PNG.sync.write(comparison.after!), label: `after ${to.width}×${to.height}` },
          { png: PNG.sync.write(new PNG({ width: 1, height: 1 })), label: 'resized' },
        );
        continue;
      }
      if (result.diff?.kind !== 'changed') continue;
      const regions = result.diff.regions.slice(0, maxRegions);
      for (const [index, region] of regions.entries()) {
        const area = padRect(region, comparison.after!);
        const factor = Math.max(area.width, area.height) < 200 ? 2 : 1;
        const where = `${region.x},${region.y} ${region.width}×${region.height}`;
        cells.push(
          {
            png: crop(comparison.before!, area, factor),
            label: `${label} · ${index + 1}/${result.diff.regions.length} ${where} · before`,
          },
          { png: crop(comparison.after!, area, factor), label: 'after' },
          { png: crop(comparison.highlight!, area, factor), label: `diff${factor > 1 ? ' ×2' : ''}` },
        );
      }
    }
    const sheet = await composeSheet(browser, cells, { columns: 3, title: `${story}: changed since the baseline` });
    const file = path.join(outDir, `diff-${story}-${hash(changed.map((result) => result.key).join(','))}.png`);
    writeFileSync(file, sheet);
    files.push(file);
  }
  return files;
};

/** Stops baseline Storybooks and removes their worktrees and caches. */
export const removeBaselines = () => {
  for (const sha of baselineShas()) {
    stop(baselineCheckout(sha));
    try {
      git('worktree', 'remove', '--force', baselineCheckout(sha).root);
    } catch {
      rmSync(baselineCheckout(sha).root, { recursive: true, force: true });
    }
  }
  git('worktree', 'prune');
};
