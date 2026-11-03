/** `--ease-spring` for Web Animations, which take no `var()`; `ease-out` before the theme loads. */
export const springEasing = () =>
  getComputedStyle(document.documentElement).getPropertyValue('--ease-spring').trim() || 'ease-out';

const timingKeys = new Set(['offset', 'computedOffset', 'easing', 'composite']);

const animatedProperties = (keyframes: Keyframe[] | PropertyIndexedKeyframes) => [
  ...new Set(
    (Array.isArray(keyframes) ? keyframes.flatMap(Object.keys) : Object.keys(keyframes))
      .filter((key) => !timingKeys.has(key))
      .map((key) => key.replace(/[A-Z]/g, '-$&').toLowerCase()),
  ),
];

/**
 * A Web Animation that ends in inline styles: finished or stopped, the element keeps the values it reached, so the
 * next animation starts from there. `finished` resolves either way.
 */
export function animateTo(
  element: HTMLElement,
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
  options: KeyframeAnimationOptions,
) {
  const properties = animatedProperties(keyframes);
  const animation = element.animate(keyframes, { ...options, fill: 'both' });
  const settle = () => {
    if (animation.playState === 'idle') return;
    const computed = getComputedStyle(element);
    const reached = properties.map((property) => [property, computed.getPropertyValue(property)] as const);
    for (const [property, value] of reached) element.style.setProperty(property, value);
    animation.cancel();
  };
  return { finished: animation.finished.then(settle, () => {}), stop: settle };
}
