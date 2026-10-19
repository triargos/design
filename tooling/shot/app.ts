import { type Browser, request } from 'playwright';

import { fail, progress } from './output.ts';
import { closest } from './story-index.ts';
import { repoRoot, shotsDir, sleep } from './storybook.ts';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

/**
 * The running dev app: where it is, and how shot logs in. Login is the real flow (`/login`, magic link, session
 * cookie); under `DEV_FAST_LOGIN` the dev server writes the link to `.dev/login-outbox/<email>.json` instead of mailing
 * it (`login-email-sender.server.ts`), and shot reads it there.
 */

export interface AppAccess {
  readonly url: string;
  readonly host: string;
  readonly allowWrites: boolean;
  /** Playwright storage state for the user in the organization; `fresh` logs in again. */
  readonly session: (as: string, org: string | undefined, fresh: boolean) => Promise<string>;
}

interface ShipWorkspace {
  readonly path: string;
  readonly proxyDomain: string;
}

/** This checkout's ship workspace, if ship manages it. */
const shipWorkspace = (): ShipWorkspace | undefined => {
  try {
    const workspaces = JSON.parse(
      execFileSync('ship', ['ls', '--json', '--no-pr'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }),
    ) as ReadonlyArray<ShipWorkspace>;
    return workspaces.find((workspace) => workspace.path === repoRoot);
  } catch {
    return undefined;
  }
};

const envBaseUrl = (): string | undefined => {
  const file = path.join(repoRoot, 'apps/dashboard/.env');
  if (!existsSync(file)) return undefined;
  return /^BASE_URL=(.+)$/m
    .exec(readFileSync(file, 'utf8'))?.[1]
    ?.trim()
    .replaceAll(/^["']|["']$/g, '');
};

const healthy = async (url: string): Promise<boolean> => {
  const context = await request.newContext({ ignoreHTTPSErrors: true });
  try {
    const response = await context.get(`${url}/api/v1/health`, { timeout: 5000, maxRedirects: 0 });
    return response.ok();
  } catch {
    return false;
  } finally {
    await context.dispose();
  }
};

/** `--url` ?? `$SHOT_APP_URL` ?? this checkout's ship workspace ?? `BASE_URL` from `apps/dashboard/.env`. */
const findApp = async (explicitUrl: string | undefined): Promise<string> => {
  const workspace = shipWorkspace();
  const url = (
    explicitUrl ??
    process.env['SHOT_APP_URL'] ??
    (workspace === undefined ? undefined : `https://${workspace.proxyDomain}`) ??
    envBaseUrl() ??
    fail('No app URL: pass --url, set SHOT_APP_URL, or set BASE_URL in apps/dashboard/.env.')
  ).replace(/\/$/, '');
  if (!(await healthy(url))) {
    fail(
      `App not running at ${url}. Start it in the background: ship up (in ${workspace?.path ?? repoRoot}), or pnpm web dev.`,
    );
  }
  return url;
};

const outboxDir = path.join(repoRoot, 'apps/dashboard/.dev/login-outbox');

interface OutboxEntry {
  readonly email: string;
  readonly signInUrl: string;
  readonly at: string;
}

/** The outbox entry for `email` written at or after `since`, polled for 10s. */
const awaitLoginLink = async (email: string, since: number): Promise<OutboxEntry | undefined> => {
  const file = path.join(outboxDir, `${email.toLowerCase()}.json`);
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (existsSync(file)) {
      const entry = JSON.parse(readFileSync(file, 'utf8')) as OutboxEntry;
      // The server stamps `at` after the submit: allow a second of clock and rounding slack.
      if (Date.parse(entry.at) >= since - 1000) return entry;
    }
    await sleep(200);
  }
  return undefined;
};

interface OrganizationSummary {
  readonly id: string;
  readonly name: string;
  readonly slug: string | null;
}

const slugOf = (text: string) => text.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-');

const sessionFile = (host: string, as: string, org: string | undefined) =>
  path.join(shotsDir, 'auth', host, `${slugOf(as)}--${org === undefined ? 'default' : slugOf(org)}.json`);

/** Sessions last 7 days; renew a day early. */
const sessionMaxAgeMs = 6 * 24 * 60 * 60 * 1000;

const login = async (browser: Browser, url: string, as: string, org: string | undefined, file: string) => {
  progress(`login: ${as}${org === undefined ? '' : ` in ${org}`} at ${url}`);
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  try {
    const page = await context.newPage();
    await page.goto(`${url}/login`);
    // Before hydration the form would submit natively (GET /login?email=…), without sending a link.
    await page.waitForSelector('html[data-hydrated]', { timeout: 20_000 });
    await page.locator('#email').fill(as);
    const submittedAt = Date.now();
    const [answer] = await Promise.all([
      page
        .waitForResponse((response) => response.request().method() === 'POST' && response.url().includes('/login'), {
          timeout: 10_000,
        })
        .catch(() => undefined),
      page.locator('button[type=submit]').click(),
    ]);
    if (answer !== undefined && !answer.ok()) {
      const body = (await answer.json().catch(() => ({}))) as { _tag?: string };
      fail(`login: ${as} was refused (${answer.status()}${body._tag === undefined ? '' : ` ${body._tag}`}).`);
    }
    const entry = await awaitLoginLink(as, submittedAt);
    if (entry === undefined) {
      const shown = (await page.locator('[data-slot=field-error], [role=alert]').allInnerTexts()).join(' ').trim();
      fail(
        `login: no link for ${as} in ${path.relative(repoRoot, outboxDir)} within 10s. DEV_FAST_LOGIN must be true in apps/dashboard/.env, and ${as} needs an account${shown === '' ? '' : ` (the page says: ${shown})`}.`,
      );
    }
    await page.goto(entry!.signInUrl);
    await page.waitForURL((current) => !current.pathname.startsWith('/login/verify'), { timeout: 15_000 });
    const landed = new URL(page.url());
    if (landed.pathname === '/login/2fa') fail(`login: ${as} has MFA (landed on /login/2fa); pick a user without it.`);
    if (landed.pathname.startsWith('/login') || landed.pathname === '/account-deactivated') {
      fail(`login: ${as} was not logged in (landed on ${landed.pathname}${landed.search}).`);
    }
    if (org !== undefined) {
      const response = await page.request.get(`${url}/api/v2/organizations`);
      if (!response.ok()) fail(`login: listing organizations failed with ${response.status()}.`);
      const organizations = (await response.json()) as ReadonlyArray<OrganizationSummary>;
      const match = organizations.find((candidate) => candidate.slug === org || candidate.id === org);
      if (match === undefined) {
        const names = organizations.map((candidate) => candidate.slug ?? candidate.id);
        fail(
          `login: ${as} has no organization "${org}" (of ${names.length}). Closest:\n${closest(org, names)
            .map((name) => `  ${name}`)
            .join('\n')}`,
        );
      }
      const switched = await page.request.post(`${url}/api/v2/organizations/set-active-organization`, {
        data: { organizationId: match!.id },
      });
      if (!switched.ok()) fail(`login: switching to ${org} failed with ${switched.status()}.`);
    }
    mkdirSync(path.dirname(file), { recursive: true });
    await context.storageState({ path: file });
  } finally {
    await context.close();
  }
};

/** One login per (host, user, org) at a time, across shot processes. */
const withLock = async <A>(file: string, body: () => Promise<A>): Promise<A> => {
  const lock = `${file}.lock`;
  mkdirSync(path.dirname(lock), { recursive: true });
  const deadline = Date.now() + 60_000;
  for (;;) {
    try {
      mkdirSync(lock);
      break;
    } catch {
      if (Date.now() > deadline) fail(`login: ${lock} is held for over a minute; remove it if no shot is running.`);
      await sleep(250);
    }
  }
  try {
    return await body();
  } finally {
    rmSync(lock, { recursive: true, force: true });
  }
};

export const appAccess = async (
  browser: Browser,
  explicitUrl: string | undefined,
  allowWrites: boolean,
): Promise<AppAccess> => {
  const url = await findApp(explicitUrl);
  const host = new URL(url).host;
  return {
    url,
    host,
    allowWrites,
    session: (as, org, fresh) => {
      const file = sessionFile(host, as, org);
      const usable = () => !fresh && existsSync(file) && Date.now() - statSync(file).mtimeMs < sessionMaxAgeMs;
      if (usable()) return Promise.resolve(file);
      return withLock(file, async () => {
        // Another process may have logged in while this one waited.
        if (!fresh && usable()) return file;
        await login(browser, url, as, org, file);
        return file;
      });
    },
  };
};

/** Defaults for `--as` and `--org` per app host, in `.shots/config.json` (kept by `clean --all`). */
interface ShotConfig {
  readonly apps?: Readonly<Record<string, { readonly as?: string; readonly org?: string }>>;
}

const configFile = path.join(shotsDir, 'config.json');

const readConfig = (): ShotConfig =>
  existsSync(configFile) ? (JSON.parse(readFileSync(configFile, 'utf8')) as ShotConfig) : {};

export const appDefaults = (host: string): { readonly as?: string; readonly org?: string } =>
  readConfig().apps?.[host] ?? {};

export const saveAppDefaults = (host: string, defaults: { readonly as: string; readonly org: string | undefined }) => {
  const config = readConfig();
  mkdirSync(shotsDir, { recursive: true });
  writeFileSync(configFile, JSON.stringify({ ...config, apps: { ...config.apps, [host]: defaults } }, null, 2));
};

/** Deletes cached sessions on `host`, for one user or all. */
export const logout = (host: string, as: string | undefined): number => {
  const dir = path.join(shotsDir, 'auth', host);
  if (!existsSync(dir)) return 0;
  const prefix = as === undefined ? '' : `${slugOf(as)}--`;
  const files = readdirSync(dir).filter((file) => file.startsWith(prefix) && file.endsWith('.json'));
  for (const file of files) rmSync(path.join(dir, file), { force: true });
  return files.length;
};
