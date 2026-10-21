import { AnimatePresence, animate, motion, type Transition, useIsPresent, useReducedMotion } from 'framer-motion';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { useBottomNavDock } from '~/components/ui/bottom-nav';
import { cn } from '~/lib/utils';

type ActionBarProps = {
  /** Shown while true (something is selected); it animates in and out, so keep it mounted. */
  readonly open: boolean;
  /**
   * What the actions did ("Saved"), in place of them: the bar morphs to fit it. Keep the bar open while it shows,
   * then close it. Announced to screen readers.
   */
  readonly status?: React.ReactNode;
  /** Names the toolbar ("Selection"). */
  readonly 'aria-label': string;
  /** Styles the row of actions (`flex-wrap`, a `max-w-*`); the shell takes its size. */
  readonly className?: string;
  readonly children: React.ReactNode;
};

// Text moved by a fractional transform snaps to whole device pixels, so a transform that overshoots or runs on the
// main thread makes the label tick a pixel as it settles. Every transform here is one `transform` string, which Motion
// hands to the compositor (the label moves with its layer, smoothly), and none overshoots: the bounce is in the
// shell's width, which moves no text vertically.

/** In the page: rises 8px from 95% on one spring with no bounce, so a quick select-clear turns around mid-way. */
const inlineTransition: Transition = { type: 'spring', duration: 0.3, bounce: 0, opacity: { duration: 0.15 } };
const rest = 'translateY(0px) scale(1)';

// The morph between the actions and the status, after the `BottomNav`'s: the shell springs to the size of what it
// shows next with a little overshoot; the old row shrinks and blurs out in place, the new one rises and sharpens as
// the shell settles. The shell springs, so a status that comes and goes quickly turns around from where it is. A row
// that changes size while it shows (a count grows a digit, the row wraps) resizes the shell without the bounce.
const morph: Transition = { type: 'spring', duration: 0.45, bounce: 0.25 };
const resizing: Transition = { type: 'spring', duration: 0.25, bounce: 0 };
const fade = { duration: 0.15 } as const;
const leave = { opacity: 0, transform: 'translateY(0px) scale(0.9)', filter: 'blur(4px)', transition: fade };
const hiddenRow = { opacity: 0, transform: 'translateY(6px) scale(0.96)', filter: 'blur(4px)' };
const shownRow = {
  opacity: 1,
  transform: rest,
  filter: 'blur(0px)',
  transition: { duration: 0.3, delay: 0.06, ease: [0.23, 1, 0.32, 1], opacity: { duration: 0.2, delay: 0.06 } },
} as const;

/**
 * One row of the bar: the actions or the status. A row on its way out leaves the flow and stays centered while it
 * fades, so the row coming in sizes the shell.
 */
function ActionBarRow({ className, ...props }: React.ComponentProps<typeof motion.div>) {
  const present = useIsPresent();
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.div
      data-slot='action-bar-content'
      data-exiting={present ? undefined : ''}
      inert={!present}
      initial={reduced ? { opacity: 0 } : hiddenRow}
      animate={reduced ? { opacity: 1, transition: fade } : shownRow}
      exit={reduced ? { opacity: 0, transition: fade } : leave}
      className={cn(
        'flex w-max shrink-0 items-center gap-related p-1.5',
        !present && 'absolute top-1/2 left-1/2 -translate-1/2',
        className,
      )}
      {...props}
    />
  );
}

/**
 * A floating toolbar for what is selected: the count, clear, the actions, on the inverted surface like the
 * `BottomNav`. In the page it sticks to the bottom of the scrolling column (`sticky bottom-4 self-center`, in a flex
 * column). On a phone, under a `BottomNavProvider` with a `BottomNav` showing, it docks in the nav instead: the nav's
 * shell morphs to fit it and its items cascade in. A docked bar answers container queries from the nav's width. 6px in
 * from the 16px corner, 36px buttons (`rounded-control`, 10px) are concentric with it. One per page. A `status`
 * replaces the actions once they ran; the shell springs to its size.
 */
function ActionBar({ open, status, className, children, 'aria-label': ariaLabel }: ActionBarProps) {
  const nav = useBottomNavDock();
  const dock = nav?.dock ?? null;
  const setDocked = nav?.setDocked;
  const reduced = useReducedMotion() ?? false;
  const shellRef = React.useRef<HTMLDivElement>(null);
  // The size each shell springs to; a shell not in here is entering.
  const fitted = React.useRef(new WeakMap<HTMLElement, string>());
  const showsStatus = status !== undefined && status !== null && status !== false;

  React.useEffect(() => {
    if (setDocked === undefined) return;
    setDocked(open && dock !== null);
    return () => setDocked(false);
  }, [open, dock, setDocked]);

  // In the page the shell holds an explicit size and springs to the row that shows. Docked, the nav's shell does.
  React.useLayoutEffect(() => {
    const shell = shellRef.current;
    if (!open || dock !== null || shell === null) return;
    const row = shell.querySelector<HTMLElement>(':scope > [data-slot=action-bar-content]:not([data-exiting])');
    if (row === null) return;
    let running: { stop: () => void } | undefined;
    const fit = (transition: Transition) => {
      const size = { width: row.offsetWidth, height: row.offsetHeight };
      if (size.width === 0) return;
      const key = `${size.width}x${size.height}`;
      const previous = fitted.current.get(shell);
      if (previous === key) return;
      fitted.current.set(shell, key);
      running?.stop();
      const target = { width: `${size.width}px`, height: `${size.height}px` };
      // A fresh shell takes the row's size at once (it is entering); so does every change under reduced motion.
      if (previous === undefined || reduced) {
        Object.assign(shell.style, target);
        return;
      }
      // Explicit keyframes: the shell's inline size is set behind Motion's back.
      running = animate(
        shell,
        { width: [shell.offsetWidth, size.width], height: [shell.offsetHeight, size.height] },
        transition,
      );
    };
    fit(morph);
    const observer = new ResizeObserver(() => fit(resizing));
    observer.observe(row);
    return () => {
      observer.disconnect();
      running?.stop();
    };
  }, [open, dock, showsStatus, reduced]);

  const toolbar = (key: string, motionProps: React.ComponentProps<typeof motion.div>, surface: string) => (
    <motion.div
      key={key}
      ref={shellRef}
      role='toolbar'
      aria-label={ariaLabel}
      data-slot='action-bar'
      className={cn('relative flex items-center justify-center text-control', surface)}
      {...motionProps}>
      <AnimatePresence initial={false}>
        {showsStatus ? (
          <ActionBarRow key='status' aria-hidden>
            <span className='flex h-9 items-center gap-1.5 px-2.5 font-medium whitespace-nowrap [&_svg]:size-4 [&_svg]:shrink-0'>
              {status}
            </span>
          </ActionBarRow>
        ) : (
          <ActionBarRow key='actions' className={className}>
            {children}
          </ActionBarRow>
        )}
      </AnimatePresence>
      {/* Always mounted, so a screen reader hears the status when it fills. */}
      <span role='status' className='sr-only'>
        {showsStatus ? status : null}
      </span>
    </motion.div>
  );

  if (dock !== null) {
    // The nav animates the morph and the cascade; the bar only stays for the nav's fade when it closes.
    return createPortal(
      <AnimatePresence initial={false}>
        {open && toolbar('docked', { initial: false, exit: { opacity: 0, transition: { duration: 0.15 } } }, '')}
      </AnimatePresence>,
      dock,
    );
  }

  const hidden = { opacity: 0, transform: reduced ? rest : 'translateY(8px) scale(0.95)' };
  return (
    <AnimatePresence initial={false}>
      {open &&
        toolbar(
          'inline',
          {
            'data-surface': 'inverse',
            initial: hidden,
            animate: { opacity: 1, transform: rest },
            exit: hidden,
            transition: inlineTransition,
          } as React.ComponentProps<typeof motion.div>,
          // overflow-hidden: the shell springs past or short of the row; 6px of padding in the row keeps focus rings.
          'sticky bottom-4 origin-bottom self-center overflow-hidden rounded-popup bg-popover text-popover-foreground shadow-popup',
        )}
    </AnimatePresence>
  );
}

export { ActionBar };
