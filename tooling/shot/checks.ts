import type { Locator, Page } from 'playwright';

import type { Capture, CheckId, Finding, Rect } from './model.ts';
import { settle } from './page.ts';
import { axeSource, type RuntimeCheck } from './runtime.ts';

/**
 * The checks registry. `group` checks run once per page load (its render and console); `capture` checks run on each
 * still capture's target before overlays draw.
 */

export interface CheckContext {
  readonly page: Page;
  readonly capture: Capture;
  readonly roots: ReadonlyArray<Locator>;
}

interface CaptureCheck {
  readonly appliesTo: (capture: Capture) => boolean;
  readonly run: (context: CheckContext) => Promise<ReadonlyArray<Finding>>;
}

const runtimeCheck =
  (id: RuntimeCheck): CaptureCheck['run'] =>
  async ({ roots }) =>
    (
      await Promise.all(roots.map((root) => root.evaluate((element, ids) => window.__shot.check(ids, element), [id])))
    ).flat();

/** Page-level axe rules that do not apply to a component on a story page. */
const pageRules = ['region', 'landmark-one-main', 'page-has-heading-one', 'bypass', 'landmark-unique', 'html-has-lang'];

interface AxeViolation {
  readonly id: string;
  readonly impact: string | null;
  readonly help: string;
  readonly nodes: ReadonlyArray<{ readonly target: ReadonlyArray<string>; readonly rect: Rect | undefined }>;
}

const a11y: CaptureCheck['run'] = async ({ page, roots }) => {
  if (!(await page.evaluate(() => 'axe' in window))) await page.addScriptTag({ content: axeSource() });
  const violations = (
    await Promise.all(
      roots.map((root) =>
        root.evaluate(async (element, disabled) => {
          const axe = (window as unknown as { axe: { run: (...args: ReadonlyArray<unknown>) => Promise<unknown> } })
            .axe;
          const result = (await axe.run(element, {
            resultTypes: ['violations'],
            rules: Object.fromEntries(disabled.map((rule) => [rule, { enabled: false }])),
          })) as {
            violations: ReadonlyArray<{
              id: string;
              impact: string | null;
              help: string;
              nodes: ReadonlyArray<{ target: ReadonlyArray<string> }>;
            }>;
          };
          return result.violations.map((violation) => ({
            id: violation.id,
            impact: violation.impact,
            help: violation.help,
            nodes: violation.nodes.map((node) => {
              const target = document.querySelector(node.target.join(' '));
              const rect = target?.getBoundingClientRect();
              return {
                target: node.target,
                rect:
                  rect === undefined
                    ? undefined
                    : { x: rect.left + scrollX, y: rect.top + scrollY, width: rect.width, height: rect.height },
              };
            }),
          }));
        }, pageRules),
      ),
    )
  ).flat() as ReadonlyArray<AxeViolation>;
  return violations.flatMap((violation) =>
    violation.nodes.map((node) => ({
      check: 'a11y' as const,
      severity:
        violation.impact === 'serious' || violation.impact === 'critical' ? ('error' as const) : ('warn' as const),
      message: `${violation.help} (${violation.id})`,
      selector: node.target.join(' '),
      rect: node.rect,
    })),
  );
};

/** The focused element's surroundings, focused and blurred: identical pixels mean no visible focus indicator. */
const focus: CaptureCheck['run'] = async ({ page, capture }) => {
  const step = capture.scene.findLast((candidate) => candidate.kind === 'focus');
  if (step === undefined || step.kind !== 'focus') return [];
  const area = await page.evaluate(() => {
    const element = document.activeElement;
    if (element === null || element === document.body) return undefined;
    const rect = element.getBoundingClientRect();
    return { x: rect.left + scrollX - 8, y: rect.top + scrollY - 8, width: rect.width + 16, height: rect.height + 16 };
  });
  if (area === undefined) {
    return [
      {
        check: 'focus',
        severity: 'error',
        message: 'nothing is focused after the focus step',
        selector: step.selector,
        rect: undefined,
      },
    ];
  }
  const clip = { ...area, x: Math.max(0, area.x), y: Math.max(0, area.y) };
  const focused = await page.screenshot({ fullPage: true, clip });
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await settle(page);
  const blurred = await page.screenshot({ fullPage: true, clip });
  await page.keyboard.press('Shift');
  await page.locator(step.selector).first().focus();
  await settle(page);
  return focused.equals(blurred)
    ? [
        {
          check: 'focus',
          severity: 'error',
          message: 'focus shows no visible outline or ring',
          selector: step.selector,
          rect: area,
        },
      ]
    : [];
};

const isStill = (capture: Capture) => capture.output.kind === 'still';

const CAPTURE_CHECKS: Readonly<Record<Exclude<CheckId, 'render' | 'console'>, CaptureCheck>> = {
  a11y: { appliesTo: isStill, run: a11y },
  focus: {
    appliesTo: (capture) => isStill(capture) && capture.scene.some((step) => step.kind === 'focus'),
    run: focus,
  },
  overflow: { appliesTo: isStill, run: runtimeCheck('overflow') },
  target: {
    appliesTo: (capture) => isStill(capture) && capture.variant.device !== undefined,
    run: runtimeCheck('target'),
  },
  tokens: { appliesTo: isStill, run: runtimeCheck('tokens') },
  align: { appliesTo: isStill, run: runtimeCheck('align') },
};

export const renderFinding = (message: string): Finding => ({
  check: 'render',
  severity: 'error',
  message,
  selector: '',
  rect: undefined,
});

export const consoleFindings = (errors: ReadonlyArray<string>): ReadonlyArray<Finding> =>
  errors.map((error) => ({
    check: 'console',
    severity: 'warn',
    message: error.split('\n')[0]!.slice(0, 200),
    selector: '',
    rect: undefined,
  }));

/** One finding per check and message; repeats collapse into a count. */
export const collapse = (findings: ReadonlyArray<Finding>): ReadonlyArray<Finding> => {
  const groups = new Map<string, Array<Finding>>();
  for (const finding of findings) {
    const id = `${finding.check}|${finding.severity}|${finding.message}`;
    groups.set(id, [...(groups.get(id) ?? []), finding]);
  }
  return [...groups.values()].map((group) =>
    group.length === 1 ? group[0]! : { ...group[0]!, message: `${group[0]!.message} (×${group.length})` },
  );
};

export const runCaptureChecks = async (context: CheckContext): Promise<ReadonlyArray<Finding>> => {
  const findings: Array<Finding> = [];
  for (const check of Object.values(CAPTURE_CHECKS)) {
    if (check.appliesTo(context.capture)) findings.push(...(await check.run(context)));
  }
  return collapse(findings);
};
