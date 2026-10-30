import * as React from 'react';

const ATTRIBUTE = 'data-name-check';
const NAMED_BY_CONTENT = new Set(['button', 'a', 'link', 'tab', 'menuitem', 'option']);

const textOf = (node: Node | null) => (node?.textContent ?? '').trim();

/** What a screen reader would announce it by, roughly: a label, an aria attribute, a title, or a button's text. */
function hasAccessibleName(element: HTMLElement): boolean {
  if (element.getAttribute('aria-label')?.trim()) return true;
  const labelledBy = element.getAttribute('aria-labelledby')?.split(/\s+/) ?? [];
  if (labelledBy.some((id) => id !== '' && textOf(element.ownerDocument.getElementById(id)))) return true;
  if ('labels' in element && element.labels instanceof NodeList && [...element.labels].some((label) => textOf(label)))
    return true;
  if (element.id) {
    const labels = element.ownerDocument.querySelectorAll(`label[for="${CSS.escape(element.id)}"]`);
    if ([...labels].some((label) => textOf(label))) return true;
  }
  if (textOf(element.closest('label'))) return true;
  if (element.getAttribute('title')?.trim()) return true;
  const role = element.getAttribute('role') ?? element.tagName.toLowerCase();
  return NAMED_BY_CONTENT.has(role) && textOf(element) !== '';
}

/**
 * Development only: logs an error when the element that spreads the returned props has no accessible name a tick after
 * it mounts (an icon-only button without `aria-label`, a switch without a label). Nothing in production.
 */
function useAccessibleNameCheck(component: string, enabled = true): { readonly [ATTRIBUTE]?: string } {
  const id = React.useId();
  const active = process.env.NODE_ENV !== 'production' && enabled;
  React.useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => {
      const element = document.querySelector<HTMLElement>(`[${ATTRIBUTE}="${CSS.escape(id)}"]`);
      if (element && !hasAccessibleName(element))
        console.error(
          `${component} has no accessible name. Give it aria-label or aria-labelledby, or label it (FieldLabel, <label>).`,
          element,
        );
    }, 0);
    return () => clearTimeout(timer);
  }, [active, component, id]);
  return active ? { [ATTRIBUTE]: id } : {};
}

export { hasAccessibleName, useAccessibleNameCheck };
