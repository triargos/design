/**
 * Forces interaction states for a spec matrix: every rule on `:hover`, `:active`, `:focus-visible` or
 * `:focus-within` is copied with the pseudo-class swapped for a class, so a cell with `state-hover` (and everything
 * in it) renders hovered. The copies keep their `@layer` and `@media` wrappers, so the cascade order stays the same.
 */
const FORCED: ReadonlyArray<readonly [pseudo: string, className: string]> = [
  [':hover', 'state-hover'],
  [':active', 'state-press'],
  [':focus-visible', 'state-focus'],
  [':focus-within', 'state-focus'],
];

const forced = (css: string): string => {
  let next = css;
  for (const [pseudo, className] of FORCED) {
    next = next.replaceAll(pseudo, `:is(.${className}, .${className} *)`);
  }
  return next;
};

function forcedRules(rules: CSSRuleList): string {
  let css = '';
  for (const rule of rules) {
    if (rule instanceof CSSStyleRule) {
      // The whole rule, so declarations nested in it (`@supports` fallbacks) come along.
      if (forced(rule.selectorText) !== rule.selectorText) css += forced(rule.cssText);
    } else if (rule instanceof CSSMediaRule || rule instanceof CSSSupportsRule || rule instanceof CSSLayerBlockRule) {
      const inner = forcedRules(rule.cssRules);
      if (inner === '') continue;
      const prelude =
        rule instanceof CSSMediaRule
          ? `@media ${rule.conditionText}`
          : rule instanceof CSSSupportsRule
            ? `@supports ${rule.conditionText}`
            : `@layer ${rule.name}`;
      css += `${prelude}{${inner}}`;
    }
  }
  return css;
}

const STYLE_ID = 'forced-states';

/** Writes the forced copies once per set of stylesheets; a stylesheet loaded later (a code-split chunk) adds its own. */
export function installForcedStates(): void {
  const sheets = [...document.styleSheets].filter((sheet) => (sheet.ownerNode as Element | null)?.id !== STYLE_ID);
  let style = document.getElementById(STYLE_ID);
  const key = String(sheets.length);
  if (style?.dataset['sheets'] === key) return;
  let css = '';
  for (const sheet of sheets) {
    try {
      css += forcedRules(sheet.cssRules);
    } catch {
      // A cross-origin stylesheet hides its rules; it has no states to force.
    }
  }
  if (style === null) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.append(style);
  }
  style.dataset['sheets'] = key;
  style.textContent = css;
}
