import { AnimatePresence, motion, type Transition, useIsPresent, useReducedMotion } from 'framer-motion';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { useBottomNavDock, useFitShell } from '~/components/ui/bottom-nav';
import { cn } from '~/lib/utils';

type ActionBarProps = {
  /** Shown while true (something is selected); it animates in and out, so keep it mounted. */
  readonly open: boolean;
  /**
   * Under a `BottomNavProvider` one open bar shows at a time: the highest `priority` (default 0), of those the last
   * opened. Give a bar that must not be covered a higher one (unsaved changes over a selection).
   */
  readonly priority?: number;
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

// The swap between the actions and the status, or one docked bar and the next: `useFitShell` springs the shell to the
// size of what it shows next with a little overshoot; the old row shrinks and blurs out in place, the new one rises
// and sharpens as the shell settles. The shell springs, so a status that comes and goes quickly turns around from
// where it is.
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
        'flex w-max shrink-0 items-center gap-related p-(--outer-inset) [&_[data-slot=button]]:rounded-inner',
        !present && 'absolute top-1/2 left-1/2 -translate-1/2',
        className,
      )}
      {...props}
    />
  );
}

/**
 * The toolbar: its shell, in the page or in the nav's dock. Docked, one on its way out (another bar took its place)
 * leaves the flow and stays centered while it fades, so the one coming in sizes the dock.
 */
function Toolbar({ docked, className, ...props }: React.ComponentProps<typeof motion.div> & { docked: boolean }) {
  const present = useIsPresent();
  return (
    <motion.div
      role='toolbar'
      data-slot='action-bar'
      data-exiting={present ? undefined : ''}
      inert={!present}
      className={cn(
        'relative flex items-center justify-center text-control',
        '[--outer-inset:calc((var(--spacing-control-lg)+2*var(--spacing-popup-inset)-var(--spacing-control))/2)]',
        docked && !present && 'absolute top-1/2 left-1/2 -translate-1/2',
        className,
      )}
      {...props}
    />
  );
}

/**
 * A floating toolbar for what is selected, or for changes to save: the count, clear, the actions, on the inverted
 * surface like the `BottomNav`. In the page it sticks to the bottom of the scrolling column (`sticky bottom-4
 * self-center`, in a flex column). On a phone, under a `BottomNavProvider` with a `BottomNav` showing, it docks in the
 * nav instead: the nav's shell morphs to fit it and its items cascade in. A docked bar answers container queries from
 * the nav's width. Its row sits in from the corner by what brings a `control` button to the nav's height (`control-lg`
 * + 2 × `popup-inset`), and its buttons take `rounded-inner`, concentric with the shell (`--bottom-nav-radius`, here
 * too). Under a provider, several may be open: one shows (`priority`), the next takes its place when it closes. A
 * `status` replaces the actions once they ran; the shell springs to its size.
 */
function ActionBar({ open, priority = 0, status, className, children, 'aria-label': ariaLabel }: ActionBarProps) {
  const nav = useBottomNavDock();
  const dock = nav?.dock ?? null;
  const openBar = nav?.openBar;
  const id = React.useId();
  const reduced = useReducedMotion() ?? false;
  const shellRef = React.useRef<HTMLDivElement>(null);
  const [layer, setLayer] = React.useState<HTMLDivElement | null>(null);
  const showsStatus = status !== undefined && status !== null && status !== false;
  const shown = open && (nav === null || nav.top === id);

  React.useEffect(() => {
    if (open && openBar !== undefined) return openBar(id, priority);
  }, [open, openBar, id, priority]);

  // In the page the shell holds an explicit size and springs to the row that shows. Docked, the nav's shell does.
  useFitShell(shellRef, dock === null ? layer : null, { reduced });

  const toolbar = (key: string, docked: boolean, motionProps: React.ComponentProps<typeof motion.div>) => (
    <Toolbar
      key={key}
      ref={docked ? undefined : shellRef}
      docked={docked}
      aria-label={ariaLabel}
      {...motionProps}
      className={cn(
        !docked &&
          // overflow-hidden: the shell springs past or short of the row; the row's padding keeps focus rings.
          'sticky bottom-4 origin-bottom self-center overflow-hidden bar-corners bg-popover text-popover-foreground shadow-popup',
      )}>
      {/* In the page, what sizes the shell: the row that shows (one on its way out leaves the flow). Docked, the nav's
          dock does; a labelled nav stretches the row. */}
      <div ref={docked ? undefined : setLayer} className={docked ? 'contents' : 'flex w-max'}>
        <AnimatePresence initial={false}>
          {showsStatus ? (
            <ActionBarRow key='status' aria-hidden>
              <span className='flex h-control items-center gap-control-gap px-(--action-bar-status-pad-x) font-medium whitespace-nowrap [&_svg]:size-icon [&_svg]:shrink-0'>
                {status}
              </span>
            </ActionBarRow>
          ) : (
            <ActionBarRow key='actions' className={className}>
              {children}
            </ActionBarRow>
          )}
        </AnimatePresence>
      </div>
      {/* Always mounted, so a screen reader hears the status when it fills. */}
      <span role='status' className='sr-only'>
        {showsStatus ? status : null}
      </span>
    </Toolbar>
  );

  if (dock !== null) {
    // The nav animates the morph and the cascade; the bar only stays for its way out.
    return createPortal(
      <AnimatePresence initial={false}>
        {shown && toolbar('docked', true, { initial: false, exit: leave })}
      </AnimatePresence>,
      dock,
    );
  }

  const hidden = { opacity: 0, transform: reduced ? rest : 'translateY(8px) scale(0.95)' };
  return (
    <AnimatePresence initial={false}>
      {shown &&
        toolbar('inline', false, {
          'data-surface': 'inverse',
          initial: hidden,
          animate: { opacity: 1, transform: rest },
          exit: hidden,
          transition: inlineTransition,
        } as React.ComponentProps<typeof motion.div>)}
    </AnimatePresence>
  );
}

export { ActionBar };
