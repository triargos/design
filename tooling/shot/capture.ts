import type { Locator, Page } from 'playwright';
import { PNG } from 'pngjs';

import { collapse, consoleFindings, renderFinding, runCaptureChecks } from './checks.ts';
import {
  type Capture,
  describeSource,
  describeTarget,
  extension,
  type Rect,
  type Finding,
  groupKey,
  key,
  type Plan,
  type Result,
  slug,
} from './model.ts';
import { errorMessage, fail, progress, ShotError } from './output.ts';
import { fitContent, type Opened, openSource, type PageEnv, resolveTarget, runStep, settle } from './page.ts';
import { crop, padRect } from './png.ts';
import { composeSheet, loupe } from './sheet.ts';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';

/** Runs a plan: one page load per group, then every capture of the group; writes files and the manifest. */

export interface RunEnv extends PageEnv {
  readonly outDir: string;
  /** Run the capture checks on still captures. */
  readonly checks: boolean;
  /** Extra settle time after each step, ms. */
  readonly wait: number;
}

const concurrency = 4;

/** Bump when a change here alters pixels: cached baseline captures from an older version are rendered again. */
export const RENDER_VERSION = 3;
const tallWarning = 2000;

const pngSize = (png: Buffer) => ({ width: png.readUInt32BE(16), height: png.readUInt32BE(20) });

const writeOutput = (env: RunEnv, capture: Capture, content: Buffer | string, measurements: unknown): string => {
  const file = path.join(env.outDir, `${key(capture)}.${extension(capture.output)}`);
  writeFileSync(file, content);
  if (measurements !== undefined && capture.output.kind !== 'measure') {
    writeFileSync(path.join(env.outDir, `${key(capture)}.json`), JSON.stringify(measurements, null, 2));
  }
  if (Buffer.isBuffer(content) && extension(capture.output) === 'png') {
    const { width, height } = pngSize(content);
    if (height > tallWarning) {
      progress(
        `warning: ${path.basename(file)} is ${width}×${height}px; reads downscale it. Shoot a --section or --select.`,
      );
    }
  }
  return file;
};

interface Produced {
  readonly file: string;
  readonly measurements: unknown;
  readonly findings: ReadonlyArray<Finding>;
}

const still = async (env: RunEnv, page: Page, capture: Capture): Promise<Produced> => {
  if (capture.output.kind !== 'still') throw new Error('still expects a still output');
  const resolved = await resolveTarget(page, capture.target, capture.variant.mode === 'side');
  const findings = env.checks ? await runCaptureChecks({ page, capture, roots: resolved.roots }) : [];
  const overlays = capture.output.overlays;
  const measurements =
    overlays.length === 0
      ? undefined
      : await Promise.all(
          resolved.roots.map((root) =>
            root.evaluate((element, kinds) => window.__shot.overlay(kinds, element), overlays),
          ),
        );
  // Infinite animations (spinners, shimmer) cancel to their start: the same capture gives the same pixels. CSS and
  // WAAPI through Playwright; SVG SMIL (`<animate>`, the `Loader`) paused at 0 here.
  await page.evaluate(() => {
    for (const svg of document.querySelectorAll('svg')) {
      svg.pauseAnimations();
      svg.setCurrentTime(0);
    }
  });
  let png = await page.screenshot({
    animations: 'disabled',
    ...(resolved.clip === undefined
      ? { fullPage: capture.target.kind === 'page' }
      : { fullPage: true, clip: resolved.clip }),
  });
  if (overlays.length > 0) await page.evaluate(() => window.__shot.clearOverlay());
  if (capture.output.loupe !== undefined) png = await loupe(env.browser, png, capture.output.loupe);
  const data = measurements === undefined ? undefined : measurements.length === 1 ? measurements[0] : measurements;
  return { file: writeOutput(env, capture, png, data), measurements: data, findings };
};

const measure = async (env: RunEnv, page: Page, capture: Capture): Promise<Produced> => {
  if (capture.output.kind !== 'measure') throw new Error('measure expects a measure output');
  const { styles, all } = capture.output;
  const resolved = await resolveTarget(page, capture.target, false, all);
  const data = (
    await Promise.all(
      resolved.roots.map((root) =>
        root.evaluateAll((elements, styles) => window.__shot.measure(elements.slice(0, 50), styles), styles),
      ),
    )
  ).flat();
  return { file: writeOutput(env, capture, JSON.stringify(data, null, 2), data), measurements: data, findings: [] };
};

const aria = async (env: RunEnv, page: Page, capture: Capture): Promise<Produced> => {
  const resolved = await resolveTarget(page, capture.target, false);
  const snapshots = await Promise.all(resolved.roots.map((root) => root.ariaSnapshot()));
  const text = `${snapshots.join('\n\n')}\n`;
  return { file: writeOutput(env, capture, text, undefined), measurements: undefined, findings: [] };
};

const scaleRect = (rect: Rect, factor: number): Rect => ({
  x: rect.x * factor,
  y: rect.y * factor,
  width: rect.width * factor,
  height: rect.height * factor,
});

/**
 * The scene's last step starts the clock; frames are viewport screenshots every `everyMs` of animation time, slowed
 * by `slow`. A section or select target is located in every frame, so one that appears or grows during the animation
 * is followed; all frames are cropped to the union of where it was.
 */
const frames = async (env: RunEnv, opened: Extract<Opened, { kind: 'ready' }>, capture: Capture): Promise<Produced> => {
  if (capture.output.kind !== 'frames') throw new Error('frames expects a frames output');
  const { count, everyMs, slow } = capture.output;
  const { page, context } = opened;
  const target = capture.target;
  const last = capture.scene.at(-1);
  const locator: Locator | undefined =
    target.kind === 'section'
      ? (await resolveTarget(page, target, false)).roots[0]
      : target.kind === 'select'
        ? page.locator(target.selector).filter({ visible: true }).first()
        : undefined;
  await locator?.scrollIntoViewIfNeeded({ timeout: 1000 }).catch(() => undefined);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Animation.enable');
  await cdp.send('Animation.setPlaybackRate', { playbackRate: slow });
  await page.evaluate(
    (rate) => (window as unknown as { __shotSetSlow: (rate: number) => void }).__shotSetSlow(rate),
    slow,
  );
  if (last !== undefined) await runStep(page, last);
  const start = Date.now();
  const shots: Array<{ png: Buffer; ms: number }> = [];
  const rects: Array<Rect> = [];
  for (let index = 0; index < count; index++) {
    const due = start + (index * everyMs) / slow;
    if (due > Date.now()) await new Promise((resolve) => setTimeout(resolve, due - Date.now()));
    const ms = Math.round((Date.now() - start) * slow);
    const [png, box] = await Promise.all([
      page.screenshot({ fullPage: false }),
      // No waiting: a target that is not there yet is simply not in this frame.
      locator === undefined
        ? undefined
        : locator
            .count()
            .then((found) => (found === 0 ? null : locator.boundingBox({ timeout: 200 }).catch(() => null))),
    ]);
    shots.push({ png, ms });
    if (box !== null && box !== undefined && box.width > 0) rects.push(box);
  }
  await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 });
  if (locator !== undefined && rects.length === 0) {
    fail(`${describeTarget(target)} never appeared during the ${count} frames.`);
  }
  const viewport = page.viewportSize() ?? { width: 1280, height: 900 };
  const area =
    rects.length === 0
      ? undefined
      : padRect(
          {
            x: Math.min(...rects.map((rect) => rect.x)),
            y: Math.min(...rects.map((rect) => rect.y)),
            width: Math.max(...rects.map((rect) => rect.x + rect.width)) - Math.min(...rects.map((rect) => rect.x)),
            height: Math.max(...rects.map((rect) => rect.y + rect.height)) - Math.min(...rects.map((rect) => rect.y)),
          },
          viewport,
        );
  const cells = shots.map(({ png, ms }, index) => ({
    png: area === undefined ? png : crop(PNG.sync.read(png), scaleRect(area, capture.variant.scale)),
    label: `${index + 1} · ${ms}ms`,
  }));
  const sheet = await composeSheet(env.browser, cells, {
    title: `${describeSource(capture.source)} ${slug(capture)} (every ${everyMs}ms, slow ${slow})`,
  });
  const measurements = { area, frames: shots.map(({ ms }, index) => ({ index: index + 1, ms })) };
  return { file: writeOutput(env, capture, sheet, measurements), measurements, findings: [] };
};

const produce = async (
  env: RunEnv,
  opened: Extract<Opened, { kind: 'ready' }>,
  capture: Capture,
): Promise<Produced> => {
  // Routes scroll inside the app shell: grow the viewport to the content, except for a viewport shot or frames.
  if (capture.source.kind === 'route') {
    await fitContent(opened.page, capture.target.kind !== 'viewport' && capture.output.kind !== 'frames');
  }
  switch (capture.output.kind) {
    case 'still':
      return still(env, opened.page, capture);
    case 'measure':
      return measure(env, opened.page, capture);
    case 'aria':
      return aria(env, opened.page, capture);
    case 'frames':
      return frames(env, opened, capture);
  }
};

const failed = (capture: Capture, findings: ReadonlyArray<Finding>): Result => ({
  capture,
  key: key(capture),
  file: undefined,
  measurements: undefined,
  findings,
  diff: undefined,
});

const runGroup = async (env: RunEnv, captures: ReadonlyArray<Capture>): Promise<ReadonlyArray<Result>> => {
  const first = captures[0]!;
  const isFrames = first.output.kind === 'frames';
  const opened = await openSource(env, first.source, first.variant, {
    settle: !isFrames || first.scene.length > 1,
    slowClock: isFrames,
  });
  if (opened.kind !== 'ready') return captures.map((capture) => failed(capture, [renderFinding(opened.message)]));
  const { page } = opened;
  try {
    const scene = isFrames ? first.scene.slice(0, -1) : first.scene;
    try {
      for (const step of scene) {
        await runStep(page, step);
        await settle(page, env.wait);
      }
      if (scene.length === 0 && env.wait > 0) await settle(page, env.wait);
    } catch (error) {
      return captures.map((capture) => failed(capture, [renderFinding(errorMessage(error))]));
    }
    const results: Array<Result> = [];
    for (const [index, capture] of captures.entries()) {
      try {
        const produced = await produce(env, opened, capture);
        results.push({
          capture,
          key: key(capture),
          file: produced.file,
          measurements: produced.measurements,
          findings:
            index === 0
              ? collapse([...consoleFindings(opened.consoleErrors), ...produced.findings])
              : produced.findings,
          diff: undefined,
        });
      } catch (error) {
        if (!(error instanceof ShotError) && process.env['SHOT_DEBUG'] === '1') throw error;
        results.push(failed(capture, [renderFinding(errorMessage(error))]));
      }
    }
    return results;
  } finally {
    if (first.scene.some((step) => step.kind === 'press')) await page.mouse.up().catch(() => undefined);
    await opened.close();
  }
};

/** Runs the plan's groups, four at a time; results in plan order. */
export const runPlan = async (env: RunEnv, plan: Plan): Promise<ReadonlyArray<Result>> => {
  mkdirSync(env.outDir, { recursive: true });
  const groups = new Map<string, Array<Capture>>();
  for (const capture of plan) {
    const id = groupKey(capture);
    groups.set(id, [...(groups.get(id) ?? []), capture]);
  }
  const pending = [...groups.values()];
  const byKey = new Map<string, Result>();
  let done = 0;
  const worker = async () => {
    for (let group = pending.shift(); group !== undefined; group = pending.shift()) {
      for (const result of await runGroup(env, group)) byKey.set(result.key, result);
      done++;
      if (groups.size > 1)
        progress(`[${done}/${groups.size}] ${describeSource(group[0]!.source)} ${group[0]!.variant.mode}`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, pending.length) }, worker));
  return plan.map((capture) => byKey.get(key(capture))!);
};

/** `manifest.json` in the session dir: key → the latest `Result`. Written by rename, so a reader never sees half. */
export const writeManifest = (outDir: string, results: ReadonlyArray<Result>) => {
  const file = path.join(outDir, 'manifest.json');
  const manifest = existsSync(file)
    ? (JSON.parse(readFileSync(file, 'utf8')) as Record<string, Result>)
    : ({} as Record<string, Result>);
  for (const result of results) manifest[result.key] = result;
  const temporary = `${file}.${process.pid}.tmp`;
  writeFileSync(temporary, JSON.stringify(manifest, null, 2));
  renameSync(temporary, file);
};
