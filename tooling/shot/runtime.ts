import { build } from 'esbuild';

import type { Finding, Overlay, Rect } from './model.ts';
import { dashboardDir, mainCheckout } from './storybook.ts';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The in-page runtime (`apps/dashboard/.storybook/shot-runtime.ts`), bundled from this checkout so a baseline page at
 * an older ref measures with the same code, and axe-core for the a11y check.
 */

export interface RuntimeOutlineEntry {
  readonly kind: 'section' | 'preview' | 'card';
  readonly title: string;
  readonly depth: number;
}

export type RuntimeCheck = 'overflow' | 'target' | 'tokens' | 'align';

interface ShotRuntime {
  outline(): ReadonlyArray<RuntimeOutlineEntry>;
  markSection(
    title: string,
    nth: number | undefined,
    mark: string,
  ): { readonly ok: true } | { readonly ok: false; readonly several: ReadonlyArray<string> };
  overlay(kinds: ReadonlyArray<Overlay>, root: Element): Record<string, unknown>;
  clearOverlay(): void;
  measure(elements: ReadonlyArray<Element>, styles: ReadonlyArray<string>): ReadonlyArray<unknown>;
  check(ids: ReadonlyArray<RuntimeCheck>, root: Element): ReadonlyArray<Omit<Finding, 'rect'> & { rect: Rect }>;
}

declare global {
  interface Window {
    __shot: ShotRuntime;
  }
}

export const bundleRuntime = async (): Promise<string> => {
  const dashboard = dashboardDir(mainCheckout);
  const result = await build({
    entryPoints: [path.join(dashboard, '.storybook/shot-runtime.ts')],
    bundle: true,
    format: 'iife',
    write: false,
    target: 'chrome120',
    tsconfig: path.join(dashboard, 'tsconfig.json'),
    logLevel: 'silent',
  });
  return result.outputFiles[0]!.text;
};

export const axeSource = (): string => readFileSync(fileURLToPath(import.meta.resolve('axe-core/axe.min.js')), 'utf8');
