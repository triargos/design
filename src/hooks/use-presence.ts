import * as React from 'react';

/**
 * Keeps an element mounted while it leaves: `shown` false marks it `leaving` until its own CSS transitions finish,
 * then unmounts it. Shown again mid-way, it turns around from where it is. `entering` is true once it mounted after
 * the first render, for a `starting:` style that should not play on page load.
 */
export function usePresence<T extends Element>(shown: boolean) {
  const ref = React.useRef<T>(null);
  const [mounted, setMounted] = React.useState(shown);
  const [entering, setEntering] = React.useState(false);
  if (shown && !mounted) {
    setMounted(true);
    setEntering(true);
  }
  const leaving = mounted && !shown;

  React.useEffect(() => {
    if (!leaving) return;
    let cancelled = false;
    const animations = ref.current?.getAnimations() ?? [];
    void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      if (!cancelled) setMounted(false);
    });
    return () => {
      cancelled = true;
    };
  }, [leaving]);

  return { ref, mounted, leaving, entering };
}
