/** `--ease-spring` for Web Animations, which take no `var()`; `ease-out` before the theme loads. */
export const springEasing = () =>
  getComputedStyle(document.documentElement).getPropertyValue('--ease-spring').trim() || 'ease-out';

const timingKeys = new Set(['offset', 'computedOffset', 'easing', 'composite']);

/**
 * A Web Animation that ends in inline styles: finished or stopped, the element keeps the values it reached, so the
 * next animation starts from there. `finished` resolves either way.
 */
export function animateTo(
  element: HTMLElement,
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
  options: KeyframeAnimationOptions,
) {
  const animation = element.animate(keyframes, { ...options, fill: 'both' });
  const settle = () => {
    if (animation.playState === 'idle') return;
    try {
      animation.commitStyles();
    } catch {
      const last = animation.effect instanceof KeyframeEffect ? animation.effect.getKeyframes().at(-1) : undefined;
      for (const [property, value] of Object.entries(last ?? {}))
        if (!timingKeys.has(property))
          element.style.setProperty(property.replace(/[A-Z]/g, '-$&').toLowerCase(), String(value));
    }
    animation.cancel();
  };
  return { finished: animation.finished.then(settle, () => {}), stop: settle };
}
