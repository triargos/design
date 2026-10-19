import { fail } from './output.ts';
import { closure } from './story-index.ts';
import { dashboardDir, mainCheckout } from './storybook.ts';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

/** The app's routes, from `react-router routes --json`: patterns, their modules, and which a change affects. */

interface RouteNode {
  readonly id: string;
  readonly path?: string;
  readonly index?: boolean;
  readonly file: string;
  readonly children?: ReadonlyArray<RouteNode>;
}

export interface AppRoute {
  /** `/app/persons/:personId`. */
  readonly pattern: string;
  /** The route module, absolute. */
  readonly file: string;
  /** The layouts above it, root excluded, and the module itself: a change to any of them changes the route. */
  readonly chain: ReadonlyArray<string>;
}

const appDir = path.join(dashboardDir(mainCheckout), 'app');

const join = (parent: string, segment: string | undefined): string => {
  if (segment === undefined || segment === '') return parent;
  if (segment.startsWith('/')) return segment;
  return `${parent === '/' ? '' : parent}/${segment}`;
};

export const appRoutes = (): ReadonlyArray<AppRoute> => {
  let tree: ReadonlyArray<RouteNode>;
  try {
    tree = JSON.parse(
      execFileSync('pnpm', ['exec', 'react-router', 'routes', '--json'], {
        cwd: dashboardDir(mainCheckout),
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }),
    ) as ReadonlyArray<RouteNode>;
  } catch {
    return fail('react-router routes --json failed; run it in apps/dashboard to see why.');
  }
  const routes: Array<AppRoute> = [];
  const walk = (nodes: ReadonlyArray<RouteNode>, parent: string, chain: ReadonlyArray<string>) => {
    for (const node of nodes) {
      const pattern = join(parent, node.path);
      const file = path.join(appDir, node.file);
      // The root module is above every route: it would make every change affect every route.
      const nodeChain = node.id === 'root' ? chain : [...chain, file];
      if (node.index === true || (node.path !== undefined && node.children === undefined)) {
        routes.push({ pattern: pattern === '' ? '/' : pattern, file, chain: nodeChain });
      }
      if (node.children !== undefined) walk(node.children, pattern, nodeChain);
    }
  };
  walk(tree, '', []);
  return routes;
};

export const routeMatches = (route: AppRoute, filter: string): boolean => {
  const needle = filter.toLowerCase();
  return (
    route.pattern.toLowerCase().includes(needle) || path.relative(appDir, route.file).toLowerCase().includes(needle)
  );
};

export const affectedRoutes = (
  routes: ReadonlyArray<AppRoute>,
  changed: ReadonlyArray<string>,
): ReadonlyArray<AppRoute> => {
  const changedSet = new Set(changed);
  return routes.filter((route) => route.chain.some((file) => [...closure(file)].some((each) => changedSet.has(each))));
};

export const relativeToApp = (file: string) => path.relative(appDir, file);
