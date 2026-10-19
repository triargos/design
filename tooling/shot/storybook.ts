import { fail, progress } from './output.ts';
import { execFileSync, spawn } from 'node:child_process';
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import path from 'node:path';

/** Storybook processes: the checkout's own, and one per baseline worktree. */

export const repoRoot = path.resolve(import.meta.dirname, '../..');
export const shotsDir = path.join(repoRoot, '.shots');
const defaultPort = 6006;
const startTimeoutMs = 180_000;

/** A checkout Storybook can run in: the repository, or a baseline worktree. */
export interface Checkout {
  readonly root: string;
  /** Where the process state and log live. */
  readonly stateFile: string;
  readonly logFile: string;
}

interface StorybookState {
  readonly pid: number;
  readonly url: string;
}

export const mainCheckout: Checkout = {
  root: repoRoot,
  stateFile: path.join(shotsDir, 'storybook.json'),
  logFile: path.join(shotsDir, 'storybook.log'),
};

export const dashboardDir = (checkout: Checkout) => path.join(checkout.root, 'apps/dashboard');

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const isAlive = (pid: number): boolean => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

/** Answers when `index.json` does; the index is what every command needs first. */
const answers = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(`${url}/index.json`, { signal: AbortSignal.timeout(2000) });
    return response.ok;
  } catch {
    return false;
  }
};

const readState = (checkout: Checkout): StorybookState | undefined => {
  if (!existsSync(checkout.stateFile)) return undefined;
  try {
    return JSON.parse(readFileSync(checkout.stateFile, 'utf8')) as StorybookState;
  } catch {
    return undefined;
  }
};

/** The process listening on `port`, if its working directory is this checkout's dashboard (not another worktree's). */
const ownStorybookOnPort = (checkout: Checkout, port: number): boolean => {
  try {
    const pids = execFileSync('lsof', ['-tiTCP:' + port, '-sTCP:LISTEN'], { encoding: 'utf8' })
      .trim()
      .split('\n');
    return pids.some((pid) =>
      execFileSync('lsof', ['-a', '-p', pid, '-d', 'cwd', '-Fn'], { encoding: 'utf8' })
        .split('\n')
        .some((line) => line === `n${dashboardDir(checkout)}`),
    );
  } catch {
    return false;
  }
};

const freePort = () =>
  new Promise<number>((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, () => {
      const address = server.address();
      server.close(() => (typeof address === 'object' && address !== null ? resolve(address.port) : reject()));
    });
  });

export const logTail = (checkout: Checkout, lines = 30) =>
  existsSync(checkout.logFile) ? readFileSync(checkout.logFile, 'utf8').split('\n').slice(-lines).join('\n') : '';

const start = async (checkout: Checkout): Promise<string> => {
  mkdirSync(path.dirname(checkout.stateFile), { recursive: true });
  const port = await freePort();
  const url = `http://localhost:${port}`;
  const log = openSync(checkout.logFile, 'w');
  const child = spawn('pnpm', ['run', 'storybook', '-p', String(port), '--ci'], {
    cwd: dashboardDir(checkout),
    detached: true,
    stdio: ['ignore', log, log],
  });
  closeSync(log);
  child.unref();
  if (child.pid === undefined) return fail('Could not start Storybook.');
  writeFileSync(checkout.stateFile, JSON.stringify({ pid: child.pid, url } satisfies StorybookState));
  progress(`Starting Storybook on ${url} (log: ${path.relative(repoRoot, checkout.logFile)})…`);

  const deadline = Date.now() + startTimeoutMs;
  while (Date.now() < deadline) {
    if (!isAlive(child.pid)) return fail(`Storybook exited while starting:\n${logTail(checkout)}`);
    if (await answers(url)) return url;
    await sleep(1000);
  }
  return fail(`Storybook did not answer within ${startTimeoutMs / 1000}s:\n${logTail(checkout)}`);
};

/** The checkout's running Storybook, or a new one left running for the next shot. */
export const findStorybook = async (checkout: Checkout, explicitUrl?: string): Promise<string> => {
  if (explicitUrl !== undefined) return explicitUrl.replace(/\/$/, '');
  const state = readState(checkout);
  if (state !== undefined && isAlive(state.pid) && (await answers(state.url))) return state.url;
  const localUrl = `http://localhost:${defaultPort}`;
  if (checkout === mainCheckout && ownStorybookOnPort(checkout, defaultPort) && (await answers(localUrl))) {
    return localUrl;
  }
  return start(checkout);
};

/** The running Storybook's URL without starting one. */
export const runningUrl = async (checkout: Checkout): Promise<string | undefined> => {
  const state = readState(checkout);
  if (state !== undefined && isAlive(state.pid) && (await answers(state.url))) return state.url;
  return undefined;
};

export const stop = (checkout: Checkout): string | undefined => {
  const state = readState(checkout);
  rmSync(checkout.stateFile, { force: true });
  if (state === undefined || !isAlive(state.pid)) return undefined;
  // Detached, so the pid leads its own process group: pnpm and the Storybook node process below it.
  process.kill(-state.pid, 'SIGTERM');
  return state.url;
};

const baselineDir = path.join(shotsDir, 'baseline');

export const baselineCheckout = (sha: string): Checkout => ({
  root: path.join(baselineDir, sha),
  stateFile: path.join(baselineDir, `${sha}.storybook.json`),
  logFile: path.join(baselineDir, `${sha}.storybook.log`),
});

export const baselineShas = (): ReadonlyArray<string> =>
  existsSync(baselineDir)
    ? readdirSync(baselineDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && /^[0-9a-f]{40}$/.test(entry.name))
        .map((entry) => entry.name)
    : [];
