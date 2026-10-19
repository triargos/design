import { type Browser, chromium } from 'playwright';

import { type RunEnv, runPlan, writeManifest } from './capture.ts';
import { baselineFor, diffResults, regionSheets, removeBaselines } from './diff.ts';
import {
  describeTarget,
  type Finding,
  OVERLAYS,
  type Overlay,
  type Plan,
  type Result,
  slug,
  type Step,
} from './model.ts';
import { errorMessage, fail, print, progress } from './output.ts';
import { formatOutline, openStory, readStory } from './page.ts';
import { DEFAULT_FLAGS, declaredPlan, defaultPlan, type Flags, isExplicit, modesFor, planFromFlags } from './plan.ts';
import { bundleRuntime } from './runtime.ts';
import { composeSheet, closeSheets } from './sheet.ts';
import {
  affected,
  changedFiles,
  fetchStories,
  matchKind,
  representatives,
  requireStory,
  type Story,
  storyIdFrom,
} from './story-index.ts';
import {
  baselineCheckout,
  baselineShas,
  findStorybook,
  logTail,
  mainCheckout,
  runningUrl,
  shotsDir,
  stop,
} from './storybook.ts';
import { execFileSync } from 'node:child_process';
import { readFileSync, rmSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

const usage = `Render Storybook stories and verify them: screenshots, overlays, measurements, checks, diffs.

Usage:
  pnpm -s shot verify [--ref r] [--story id …]   Shoot the stories your change affects, diff them against r
                                                 (default HEAD), run the checks. Prints PNGs of what changed,
                                                 one line per finding, a summary. Exits 1 on any error.
  pnpm -s shot <story> [flags]                   Shoot one story: the flags' plan, or with no target, scene or
                                                 output flags the story's plan (one shot per FoundationSection,
                                                 plus parameters.shots). Prints one path per file.
  pnpm -s shot outline <story>                   Section and preview titles, for --section.
  pnpm -s shot list [filter]                     Stories by id, title, file, or component imported.
  pnpm -s shot affected [--ref r]                Stories that import a file changed since r (default HEAD).
  pnpm -s shot url | stop | clean [--all]        Storybook's URL; stop every Storybook shot started; delete
                                                 this session's files (--all: every session and baseline).

<story> is a story id (components-callout--board) or a Storybook URL containing one.

Variant (comma lists expand into every combination):
  --mode <light,dark|both|side>   default both; side = Storybook's side-by-side mode
  --surface <page,card,popup>     the surface the story sits on
  --primary <names>               organization primary color: blue, teal, rose, …
  --base <names>                  neutral, zinc, gray, slate, stone, taupe, mauve, mist, olive
  --destructive <names>           red, rose, orange
  --global <key=value>            any other global, repeatable
  --mobile                        same as --device "iPhone 15" (393 wide, touch, hover: none)
  --device <name>                 any Playwright device: "Pixel 8", "iPad Mini"
  --width <px> --height <px>      viewport (default 1280×900, or the device's)
  --scale <n>                     device scale factor (default 1, 2 with a device)
  --reduced-motion                prefers-reduced-motion: reduce

Scene (in command-line order; hover, focus and press run last and hold their state):
  --click <css>  --fill <css=text>  --key <key>  --hover <css>  --focus <css>  --press <css>

Target (default: the full page):
  --section <title>               a FoundationSection or Preview by title (exact, else unique substring); repeatable
  --select <css>                  the first match, 16px around it; repeatable; inside --section when both are given
  --viewport                      only the viewport

Output (default: a still PNG):
  --overlay <boxes,gaps,edges,type,grid>
                                  boxes: content/padding/border/margin with sizes; gaps: gaps labelled with their
                                  spacing step, off-scale red; edges: shared edges and baselines, 1–3px near-misses
                                  red; type: type role per text, off-role red; grid: 4px grid
  --loupe <n>                     the target at n×, nearest-neighbour; from 4× a line per device pixel
  --frames <n> --every <ms> [--slow <f>]
                                  n frames, every ms of animation time from the scene's last step; --slow 0.1 plays
                                  animations 10× slower; one sheet with labelled cells
  --measure [--style a,b] [--all] JSON per match: rect, padding, border, margin, radius, font, styles; no PNG
  --aria                          the target's accessibility tree as text
  --check                         run the checks (a11y, focus, overflow, target, tokens, align) on stills
  --ref <ref>                     diff every still against <ref>
  --sheet                         one contact sheet of all stills instead of one path per file
  --name <label>                  name the files

Files: .shots/<session>/<story>--<slug>-<hash>.<png|json|txt>, session = $SHOT_SESSION, else the last 8 characters
of $PI_SESSION_ID, else "local". The same capture always gets the same path. --out <dir> writes elsewhere.

Storybook: reuses this checkout's (one shot started, or \`pnpm web storybook\` on 6006), else starts one and leaves it
running. --url <url> uses another. Output: paths, findings and JSON on stdout; progress on stderr; no stacks
(SHOT_DEBUG=1 shows them). Do not pipe the output through tail.`;

const { values, positionals, tokens } = parseArgs({
  allowPositionals: true,
  tokens: true,
  options: {
    help: { type: 'boolean', short: 'h' },
    mode: { type: 'string' },
    surface: { type: 'string' },
    primary: { type: 'string' },
    base: { type: 'string' },
    destructive: { type: 'string' },
    global: { type: 'string', multiple: true, default: [] },
    mobile: { type: 'boolean', default: false },
    device: { type: 'string' },
    width: { type: 'string' },
    height: { type: 'string' },
    scale: { type: 'string' },
    'reduced-motion': { type: 'boolean', default: false },
    click: { type: 'string', multiple: true, default: [] },
    fill: { type: 'string', multiple: true, default: [] },
    key: { type: 'string', multiple: true, default: [] },
    hover: { type: 'string', multiple: true, default: [] },
    focus: { type: 'string', multiple: true, default: [] },
    press: { type: 'string', multiple: true, default: [] },
    section: { type: 'string', multiple: true, default: [] },
    select: { type: 'string', multiple: true, default: [] },
    viewport: { type: 'boolean', default: false },
    overlay: { type: 'string' },
    loupe: { type: 'string' },
    frames: { type: 'string' },
    every: { type: 'string' },
    slow: { type: 'string' },
    measure: { type: 'boolean', default: false },
    style: { type: 'string' },
    all: { type: 'boolean', default: false },
    aria: { type: 'boolean', default: false },
    check: { type: 'boolean', default: false },
    ref: { type: 'string' },
    story: { type: 'string', multiple: true, default: [] },
    sheet: { type: 'boolean', default: false },
    name: { type: 'string' },
    out: { type: 'string' },
    url: { type: 'string' },
    wait: { type: 'string' },
  },
});

const positive = (name: string, value: string | undefined): number | undefined => {
  if (value === undefined) return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fail(`--${name} must be a positive number, got "${value}".`);
};

const list = (value: string | undefined) =>
  value === undefined
    ? undefined
    : value
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part !== '');

/** Every combination of the comma-listed globals, with the single `--global` pairs added to each. */
const globalsFrom = (): ReadonlyArray<Record<string, string>> => {
  const fixed: Record<string, string> = {};
  for (const pair of values.global) {
    const separator = pair.indexOf('=');
    if (separator < 1) fail(`--global expects key=value, got "${pair}".`);
    fixed[pair.slice(0, separator)] = pair.slice(separator + 1);
  }
  const axes: ReadonlyArray<readonly [string, ReadonlyArray<string> | undefined]> = [
    ['surface', list(values.surface)],
    ['primaryColor', list(values.primary)],
    ['baseColor', list(values.base)],
    ['destructiveColor', list(values.destructive)],
  ];
  return axes.reduce<ReadonlyArray<Record<string, string>>>(
    (combinations, [name, options]) =>
      options === undefined
        ? combinations
        : combinations.flatMap((combination) => options.map((option) => ({ ...combination, [name]: option }))),
    [fixed],
  );
};

/** Steps in command-line order. */
const stepsFrom = (): ReadonlyArray<Step> =>
  tokens.flatMap((token): ReadonlyArray<Step> => {
    if (token.kind !== 'option' || token.value === undefined) return [];
    switch (token.name) {
      case 'click':
      case 'hover':
      case 'focus':
      case 'press':
        return [{ kind: token.name, selector: token.value }];
      case 'fill': {
        const separator = token.value.lastIndexOf('=');
        if (separator < 1) return fail(`--fill expects <css>=<text>, got "${token.value}".`);
        return [{ kind: 'fill', selector: token.value.slice(0, separator), text: token.value.slice(separator + 1) }];
      }
      case 'key':
        return [{ kind: 'key', key: token.value }];
      default:
        return [];
    }
  });

const flagsFrom = (): Flags => {
  const overlays = list(values.overlay) ?? [];
  for (const overlay of overlays) {
    if (!OVERLAYS.includes(overlay as Overlay)) fail(`--overlay takes ${OVERLAYS.join(', ')}; got "${overlay}".`);
  }
  const frames = positive('frames', values.frames);
  return {
    ...DEFAULT_FLAGS,
    modes: values.mode === undefined ? DEFAULT_FLAGS.modes : modesFor(values.mode),
    globals: globalsFrom(),
    device: values.device ?? (values.mobile ? 'iPhone 15' : undefined),
    width: positive('width', values.width),
    height: positive('height', values.height),
    scale: positive('scale', values.scale),
    reducedMotion: values['reduced-motion'],
    steps: stepsFrom(),
    sections: values.section,
    selects: values.select,
    viewport: values.viewport,
    overlays: overlays as ReadonlyArray<Overlay>,
    loupe: positive('loupe', values.loupe),
    frames:
      frames === undefined
        ? undefined
        : { count: frames, everyMs: positive('every', values.every) ?? 50, slow: positive('slow', values.slow) ?? 1 },
    measure: values.measure ? { styles: list(values.style) ?? [], all: values.all } : undefined,
    aria: values.aria,
    name: values.name,
  };
};

const session = process.env['SHOT_SESSION'] ?? process.env['PI_SESSION_ID']?.slice(-8) ?? 'local';
const outDir = values.out === undefined ? path.join(shotsDir, session) : path.resolve(values.out);

const launchBrowser = async (): Promise<Browser> => {
  try {
    return await chromium.launch();
  } catch (error) {
    if (!String(error).includes("Executable doesn't exist")) throw error;
    progress('Installing Playwright Chromium (one time)…');
    execFileSync('pnpm', ['exec', 'playwright', 'install', '--only-shell', 'chromium'], {
      cwd: mainCheckout.root,
      stdio: ['ignore', 'inherit', 'inherit'],
    });
    return chromium.launch();
  }
};

const runEnv = async (browser: Browser, url: string, logs: () => string, dir = outDir): Promise<RunEnv> => ({
  browser,
  url,
  runtime: await bundleRuntime(),
  logTail: logs,
  outDir: dir,
  checks: false,
  wait: positive('wait', values.wait) ?? 0,
});

const relative = (file: string) => path.relative(process.cwd(), file) || file;

const findingLine = (result: Result, finding: Finding) =>
  `${finding.severity === 'error' ? 'error' : 'warn '} ${finding.check.padEnd(8)} ${result.capture.story} › ${
    result.capture.name ?? describeTarget(result.capture.target)
  } (${result.capture.variant.mode}): ${finding.message}${finding.selector === '' ? '' : ` (${finding.selector})`}`;

/**
 * Findings once per distinct line: the same finding in light and dark is one line. Known findings (also at the
 * baseline) only count in the summary.
 */
const distinctFindings = (results: ReadonlyArray<Result>) => {
  const lines = new Map<string, Finding>();
  for (const result of results) {
    for (const finding of result.findings) {
      const line = findingLine(result, finding).replace(/ \((light|dark|side)\):/, ':');
      if (!lines.has(line)) lines.set(line, finding);
    }
  }
  return [...lines].map(([line, finding]) => ({ line, finding }));
};

const printFindings = (results: ReadonlyArray<Result>) => {
  for (const { line, finding } of distinctFindings(results)) {
    if (finding.known !== true) print(line);
  }
};

const failing = (results: ReadonlyArray<Result>) =>
  results.some((result) => result.findings.some((finding) => finding.severity === 'error' && finding.known !== true));

const storyPlan = async (env: RunEnv, story: string, flags: Flags): Promise<Plan> => {
  if (isExplicit(flags)) return planFromFlags(story, flags);
  const opened = await openStory(
    env,
    story,
    { ...planFromFlags(story, flags)[0]!.variant, mode: 'light' },
    { settle: false, slowClock: false },
  );
  if (opened.kind !== 'ready') return fail(opened.message);
  try {
    const declared = await readStory(opened.page);
    const sections = declared.outline.filter((entry) => entry.kind === 'section').map((entry) => entry.title);
    return [...defaultPlan(story, flags, sections), ...declaredPlan(story, flags, declared.shots)];
  } finally {
    await opened.close();
  }
};

const printResults = async (browser: Browser, results: ReadonlyArray<Result>) => {
  if (values.sheet) {
    const stills = results.filter((result) => result.file?.endsWith('.png'));
    if (stills.length > 0) {
      const sheet = await composeSheet(
        browser,
        stills.map((result) => ({ png: readFileSync(result.file!), label: slug(result.capture) })),
        { title: [...new Set(stills.map((result) => result.capture.story))].join(', ') },
      );
      const file = path.join(outDir, `sheet-${stills[0]!.key}.png`);
      writeFileSync(file, sheet);
      print(relative(file));
    }
  }
  for (const result of results) {
    if (result.file === undefined) continue;
    if (result.file.endsWith('.png')) {
      if (!values.sheet) print(relative(result.file));
      continue;
    }
    // Measurements and the aria tree are what to read: print them, after their path.
    print(`# ${relative(result.file)}`);
    print(readFileSync(result.file, 'utf8').trimEnd());
  }
  printFindings(results);
};

const shoot = async (rawStory: string) => {
  const url = await findStorybook(mainCheckout, values.url);
  const stories = await fetchStories(url);
  const story = requireStory(stories, storyIdFrom(rawStory)).id;
  const browser = await launchBrowser();
  try {
    const env = { ...(await runEnv(browser, url, () => logTail(mainCheckout))), checks: values.check };
    const plan = await storyPlan(env, story, flagsFrom());
    let results = await runPlan(env, plan);
    if (values.ref !== undefined) {
      const baseline = baselineFor(values.ref, (dir) => runEnv(browser, '', () => '', dir));
      results = diffResults(results, await baseline.results(plan, env.checks));
      for (const file of await regionSheets(browser, outDir, results)) print(relative(file));
    }
    writeManifest(outDir, results);
    await printResults(browser, results);
    if (failing(results)) process.exitCode = 1;
  } finally {
    await closeSheets();
    await browser.close();
  }
};

const outline = async (rawStory: string) => {
  const url = await findStorybook(mainCheckout, values.url);
  const story = requireStory(await fetchStories(url), storyIdFrom(rawStory)).id;
  const browser = await launchBrowser();
  try {
    const env = await runEnv(browser, url, () => logTail(mainCheckout));
    const opened = await openStory(
      env,
      story,
      { ...planFromFlags(story, flagsFrom())[0]!.variant, mode: 'light' },
      { settle: false, slowClock: false },
    );
    if (opened.kind !== 'ready') fail(opened.message);
    else {
      const { outline } = await readStory(opened.page);
      print(
        outline.length === 0
          ? '(no FoundationSection or Preview titles: shoot the page or --select)'
          : formatOutline(outline),
      );
      await opened.close();
    }
  } finally {
    await browser.close();
  }
};

const affectedStories = async (url: string, ref: string): Promise<ReadonlyArray<Story>> =>
  affected(await fetchStories(url), changedFiles(ref));

const verify = async () => {
  const ref = values.ref ?? 'HEAD';
  const url = await findStorybook(mainCheckout, values.url);
  const stories = await fetchStories(url);
  const chosen =
    values.story.length > 0
      ? values.story.map((id) => requireStory(stories, storyIdFrom(id)))
      : representatives(affected(stories, changedFiles(ref)));
  if (chosen.length === 0) {
    print(`0 stories affected by changes since ${ref}.`);
    return;
  }
  progress(`verify: ${chosen.length} ${chosen.length === 1 ? 'story' : 'stories'} against ${ref}`);
  const browser = await launchBrowser();
  try {
    const env = { ...(await runEnv(browser, url, () => logTail(mainCheckout))), checks: true };
    const flags = flagsFrom();
    const plan = (await Promise.all(chosen.map((story) => storyPlan(env, story.id, flags)))).flat();
    const baseline = baselineFor(ref, (dir) => runEnv(browser, '', () => '', dir));
    const current = await runPlan(env, plan);
    const results = diffResults(current, await baseline.results(plan, true));
    writeManifest(outDir, results);
    writeFileSync(path.join(outDir, 'verify.json'), JSON.stringify(results, null, 2));

    for (const file of await regionSheets(browser, outDir, results)) print(relative(file));
    for (const result of results) {
      if (result.diff?.kind === 'new' && result.file !== undefined) print(relative(result.file));
    }
    printFindings(results);
    const count = (kind: string) => results.filter((result) => result.diff?.kind === kind).length;
    const findings = distinctFindings(results).map(({ finding }) => finding);
    const errors = findings.filter((finding) => finding.severity === 'error' && finding.known !== true).length;
    const warnings = findings.filter((finding) => finding.severity === 'warn' && finding.known !== true).length;
    const known = findings.filter((finding) => finding.known === true).length;
    print(
      `${chosen.length} ${chosen.length === 1 ? 'story' : 'stories'}, ${results.length} captures: ${count('changed') + count('resized')} changed, ${count('new')} new, ${count('same')} same; ${errors} ${errors === 1 ? 'error' : 'errors'}, ${warnings} ${warnings === 1 ? 'warning' : 'warnings'}${known > 0 ? `, ${known} known` : ''}`,
    );
    if (failing(results)) process.exitCode = 1;
  } finally {
    await closeSheets();
    await browser.close();
  }
};

const stopAll = () => {
  const stopped = [mainCheckout, ...baselineShas().map((value) => baselineCheckout(value))].flatMap((checkout) => {
    const url = stop(checkout);
    return url === undefined ? [] : [url];
  });
  print(stopped.length === 0 ? 'No Storybook started by pnpm shot is running.' : `Stopped ${stopped.join(', ')}.`);
};

const clean = () => {
  if (!values.all) {
    rmSync(outDir, { recursive: true, force: true });
    print(`Removed ${relative(outDir)}.`);
    return;
  }
  removeBaselines();
  const kept = new Set(['storybook.json', 'storybook.log']);
  for (const entry of existsSync(shotsDir) ? readdirSync(shotsDir) : []) {
    if (!kept.has(entry)) rmSync(path.join(shotsDir, entry), { recursive: true, force: true });
  }
  print(`Removed every session and baseline under ${relative(shotsDir)}.`);
};

const [command, ...rest] = positionals;

try {
  if (values.help || command === undefined) {
    print(usage);
  } else if (command === 'stop') {
    stopAll();
  } else if (command === 'clean') {
    clean();
  } else if (command === 'url') {
    print((await runningUrl(mainCheckout)) ?? (await findStorybook(mainCheckout, values.url)));
  } else if (command === 'list') {
    const url = await findStorybook(mainCheckout, values.url);
    const filter = rest[0];
    const stories = await fetchStories(url);
    const direct = stories.filter((story) => filter === undefined || matchKind(story, filter) === 'direct');
    const importing = filter === undefined ? [] : stories.filter((story) => matchKind(story, filter) === 'imports');
    if (direct.length + importing.length === 0) progress(`No story matches "${filter}".`);
    for (const story of direct) print(`${story.id}  ${story.title} › ${story.name}`);
    for (const story of representatives(importing))
      print(`${story.id}  ${story.title} › ${story.name}  (uses ${filter})`);
  } else if (command === 'affected') {
    const url = await findStorybook(mainCheckout, values.url);
    for (const story of await affectedStories(url, values.ref ?? 'HEAD')) print(story.id);
  } else if (command === 'outline') {
    await outline(rest[0] ?? fail('Usage: pnpm -s shot outline <story>'));
  } else if (command === 'verify') {
    await verify();
  } else {
    await shoot(command);
  }
} catch (error) {
  process.stderr.write(`${errorMessage(error)}\n`);
  process.exitCode = 1;
}
