import { fail } from './output.ts';
import { dashboardDir, mainCheckout, repoRoot } from './storybook.ts';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

/** Which stories exist, what they import, and which of them a change affects. */

export interface Story {
  readonly id: string;
  readonly title: string;
  readonly name: string;
  /** Absolute path of the story file. */
  readonly file: string;
}

interface IndexEntry {
  readonly id: string;
  readonly title: string;
  readonly name: string;
  readonly type: string;
  readonly importPath: string;
}

export const fetchStories = async (url: string): Promise<ReadonlyArray<Story>> => {
  const response = await fetch(`${url}/index.json`, { signal: AbortSignal.timeout(10_000) }).catch(() => undefined);
  if (response === undefined || !response.ok) return fail(`Storybook at ${url} did not return its story index.`);
  const body = (await response.json()) as { entries: Record<string, IndexEntry> };
  return Object.values(body.entries)
    .filter((entry) => entry.type === 'story')
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      name: entry.name,
      file: path.resolve(dashboardDir(mainCheckout), entry.importPath),
    }));
};

export const storyIdFrom = (input: string): string => {
  const fromPath = /path=\/(?:story|docs)\/([^&#]+)/.exec(input) ?? /[?&]id=([^&#]+)/.exec(input);
  return decodeURIComponent(fromPath?.[1] ?? input);
};

const editDistance = (a: string, b: string): number => {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(previous[j]! + 1, current[j - 1]! + 1, previous[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    previous = current;
  }
  return previous[b.length]!;
};

export const closest = (needle: string, candidates: ReadonlyArray<string>, count = 5): ReadonlyArray<string> =>
  candidates
    .map((candidate) => ({ candidate, distance: editDistance(needle.toLowerCase(), candidate.toLowerCase()) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count)
    .map(({ candidate }) => candidate);

export const requireStory = (stories: ReadonlyArray<Story>, id: string): Story =>
  stories.find((story) => story.id === id) ??
  fail(
    `No story "${id}". Did you mean:\n${closest(
      id,
      stories.map((story) => story.id),
    )
      .map((candidate) => `  ${candidate}`)
      .join('\n')}`,
  );

const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];
const appDir = path.join(dashboardDir(mainCheckout), 'app');
const testDir = path.join(dashboardDir(mainCheckout), 'test');

const fileAt = (candidate: string): string | undefined => {
  for (const suffix of ['', ...sourceExtensions, ...sourceExtensions.map((extension) => `/index${extension}`)]) {
    const file = candidate + suffix;
    if (existsSync(file) && statSync(file).isFile()) return file;
  }
  return undefined;
};

const packageExports = new Map<string, Record<string, unknown> | undefined>();

const exportTarget = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (typeof value !== 'object' || value === null) return undefined;
  const conditions = value as Record<string, unknown>;
  return exportTarget(conditions['types'] ?? conditions['import'] ?? conditions['default']);
};

const resolveWorkspacePackage = (specifier: string): string | undefined => {
  const match = /^@elternportal\/([^/]+)(\/.*)?$/.exec(specifier);
  if (match === null) return undefined;
  const packageDir = path.join(repoRoot, 'packages', match[1]!);
  if (!packageExports.has(packageDir)) {
    const manifest = path.join(packageDir, 'package.json');
    packageExports.set(
      packageDir,
      existsSync(manifest)
        ? ((JSON.parse(readFileSync(manifest, 'utf8')) as { exports?: Record<string, unknown> }).exports ?? undefined)
        : undefined,
    );
  }
  const exports = packageExports.get(packageDir);
  const subpath = `.${match[2] ?? ''}`;
  if (exports === undefined) return fileAt(path.join(packageDir, subpath));
  const exact = exportTarget(exports[subpath]);
  if (exact !== undefined) return fileAt(path.join(packageDir, exact));
  for (const [pattern, value] of Object.entries(exports)) {
    const star = pattern.indexOf('*');
    if (star < 0 || !subpath.startsWith(pattern.slice(0, star)) || !subpath.endsWith(pattern.slice(star + 1))) {
      continue;
    }
    const filled = subpath.slice(star, subpath.length - (pattern.length - star - 1));
    const target = exportTarget(value);
    if (target !== undefined) return fileAt(path.join(packageDir, target.replace('*', filled)));
  }
  return undefined;
};

/** A local file the specifier names, or undefined for an npm package. */
const resolveImport = (from: string, specifier: string): string | undefined => {
  const bare = specifier.replace(/\?.*$/, '');
  if (bare.startsWith('~/')) return fileAt(path.join(appDir, bare.slice(2)));
  if (bare.startsWith('#/')) return fileAt(path.join(testDir, bare.slice(2)));
  if (bare.startsWith('.')) return fileAt(path.resolve(path.dirname(from), bare));
  return resolveWorkspacePackage(bare);
};

const importPattern =
  /(?:import|export)\s[^'"`;]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;

interface ModuleInfo {
  readonly imports: ReadonlyArray<string>;
  /** Names imported from `~/components/**`, lowercased, and those modules' paths. */
  readonly componentNames: ReadonlyArray<string>;
}

const modules = new Map<string, ModuleInfo>();

const moduleInfo = (file: string): ModuleInfo => {
  const cached = modules.get(file);
  if (cached !== undefined) return cached;
  const source = /\.(tsx?|jsx?|mjs)$/.test(file) ? readFileSync(file, 'utf8') : '';
  const imports: Array<string> = [];
  const componentNames: Array<string> = [];
  for (const match of source.matchAll(importPattern)) {
    const specifier = match[1] ?? match[2] ?? match[3]!;
    const resolved = resolveImport(file, specifier);
    if (resolved !== undefined) imports.push(resolved);
    if (specifier.startsWith('~/components/')) {
      componentNames.push(specifier.slice('~/components/'.length).toLowerCase());
      const names = /\{([^}]*)\}/.exec(match[0])?.[1] ?? '';
      for (const name of names.split(',')) {
        const trimmed = name
          .replace(/^\s*type\s+/, '')
          .split(/\s+as\s+/)[0]!
          .trim();
        if (trimmed !== '') componentNames.push(trimmed.toLowerCase());
      }
    }
  }
  const info = { imports, componentNames };
  modules.set(file, info);
  return info;
};

/** Every local file `file` imports, transitively, itself included. */
export const closure = (file: string): ReadonlySet<string> => {
  const seen = new Set<string>();
  const pending = [file];
  while (pending.length > 0) {
    const next = pending.pop()!;
    if (seen.has(next)) continue;
    seen.add(next);
    pending.push(...moduleInfo(next).imports);
  }
  return seen;
};

/**
 * `direct`: the filter is in the id, title, name or story file path; `imports`: only in a name or module the story file
 * imports from `~/components` (`switch` finds every story that uses `Switch`).
 */
export const matchKind = (story: Story, filter: string): 'direct' | 'imports' | undefined => {
  const needle = filter.toLowerCase();
  const direct = [
    story.id,
    `${story.title} ${story.name}`.toLowerCase(),
    path.relative(dashboardDir(mainCheckout), story.file).toLowerCase(),
  ];
  if (direct.some((entry) => entry.includes(needle))) return 'direct';
  return moduleInfo(story.file).componentNames.some((entry) => entry.includes(needle)) ? 'imports' : undefined;
};

/** Files whose change can restyle anything; they affect every `Foundations/*` story. */
const isGlobal = (file: string): boolean => {
  const relative = path.relative(dashboardDir(mainCheckout), file);
  return (
    relative === 'app/tailwind.css' ||
    relative === 'storybook/kit/tokens.ts' ||
    relative.startsWith('app/lib/theme/') ||
    relative.startsWith('.storybook/')
  );
};

/** Tracked files changed since `ref`, plus untracked ones; absolute paths. */
export const changedFiles = (ref: string): ReadonlyArray<string> => {
  const git = (...args: ReadonlyArray<string>) =>
    execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8' })
      .split('\n')
      .filter((line) => line !== '');
  return [...new Set([...git('diff', '--name-only', ref), ...git('ls-files', '--others', '--exclude-standard')])].map(
    (file) => path.join(repoRoot, file),
  );
};

export const affected = (stories: ReadonlyArray<Story>, changed: ReadonlyArray<string>): ReadonlyArray<Story> => {
  const changedSet = new Set(changed);
  const global = changed.some(isGlobal);
  return stories.filter(
    (story) =>
      (global && story.title.startsWith('Foundations/')) ||
      [...closure(story.file)].some((file) => changedSet.has(file)),
  );
};

/** Per title, the `Board` story when there is one: its sections show the title's examples, which are also stories. */
export const representatives = (stories: ReadonlyArray<Story>): ReadonlyArray<Story> => {
  const boards = new Set(stories.filter((story) => story.id.endsWith('--board')).map((story) => story.title));
  return stories.filter((story) => !boards.has(story.title) || story.id.endsWith('--board'));
};
