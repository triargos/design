import {
  type AnimationPlaybackControls,
  AnimatePresence,
  type TargetAndTransition,
  animate,
  motion,
  useIsPresent,
  usePresence,
  useReducedMotion,
} from 'framer-motion';
import { ChevronRightIcon } from 'lucide-react';
import {
  type ReactNode,
  createContext,
  use,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { Button } from '~/components/ui/button';
import { useFloatMenuSlot } from '~/components/ui/layout-slots';
import { popupSurface } from '~/components/ui/popover';

import { cn } from '~/lib/utils';

export interface BottomFloatMenuPanel {
  key: string;
  label: string;
  content: ReactNode;
}

export type BottomFloatMenuDismissReason = 'escape' | 'outside';

interface BottomFloatMenuProps {
  show: boolean;
  /** Wrap controls in `BottomFloatMenuItem`. */
  children: ReactNode;
  /** The bar's accessible name (a toolbar). */
  label: string;
  /** Shown instead of the bar; the bar morphs into it. */
  panel?: BottomFloatMenuPanel | null;
  /** Escape or a press outside an open panel. */
  onPanelDismiss?: (reason: BottomFloatMenuDismissReason) => void;
}

const BAR_VIEW = 'bar';
const FOCUSABLE = 'button:not([disabled]), a[href]';

// Dynamic Island: the bar flies up from below while its shell grows from a pill, springs between sizes, and
// collapses back into a pill as it drops away. The content is pinned in the shell (bottom, center) and only fades in,
// all at once (`float-menu-content-in`, `tailwind.css`), so it never moves against the bar. No `scale` touches
// text that stays on screen: when the compositor layer drops, scaled text re-rasterizes and snaps.

/** `ease-enter`. */
const easeEnter = [0.23, 1, 0.32, 1] as const;
// Stiff springs (stiffness/damping, not duration/bounce): high stiffness pulls hard from rest, so motion starts fast
// instead of easing in, and settles in ~300ms. A long `visualDuration` spring reads as slow and nearly linear.
/**
 * Flying up, growing out of the pill, and morphing between sizes: damping ratio ~0.7, overshoot ~4.5% of the travel.
 * One spring for all three, so the fly-up and the growth peak on the same frame and the bar moves as one piece.
 */
const islandSpring = { type: 'spring', stiffness: 520, damping: 32 } as const;
/** The shell collapsing into the pill on hide: critically damped, no bounce. */
const collapseSpring = { type: 'spring', stiffness: 600, damping: 49 } as const;
/**
 * The pill the shell grows from and collapses into: the same ratio on both axes, so the overshoot is the same share of
 * width and height and reads like a scale, not a horizontal stretch.
 */
const SEED_RATIO = 0.6;
const seedPill = (target: { width: number; height: number }) => ({
  width: Math.round(target.width * SEED_RATIO),
  height: Math.round(target.height * SEED_RATIO),
});

// The outgoing view blurs out fast; the incoming one is never hidden as a whole, its children stagger in.
const viewExit: TargetAndTransition = {
  opacity: 0,
  filter: 'blur(2px)',
  transition: { duration: 0.08, ease: easeEnter },
};

const surfaceOffscreen = { opacity: 0, transform: 'translateY(20px)' };

const surfaceEnter: TargetAndTransition = {
  opacity: 1,
  transform: 'translateY(0px)',
  // Ends as `none`: no transform left behind to hold a compositor layer.
  transitionEnd: { transform: 'none' },
  // `easeOut`, not `easeEnter`: the latter is opaque after one frame, so the pill appeared instead of fading in.
  transition: { transform: islandSpring, opacity: { duration: 0.2, ease: 'easeOut' } },
};

// Drops while the shell collapses into the pill (`MorphingShell`), fading as it goes.
const surfaceExit: TargetAndTransition = {
  opacity: 0,
  transform: 'translateY(12px)',
  transition: { transform: collapseSpring, opacity: { duration: 0.15, delay: 0.06, ease: easeEnter } },
};

/** Read once by the menu and shared, instead of one media-query hook per item. */
const ReducedMotionContext = createContext(false);

export const BottomFloatMenu = ({ show, children, label, panel = null, onPanelDismiss }: BottomFloatMenuProps) => {
  const shouldReduceMotion = useReducedMotion() ?? false;
  // Portaled out of the page: an opacity or transform ancestor would trap a `fixed` bar.
  // Form controls inside reach their form through the `form` attribute.
  const slot = useFloatMenuSlot();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const outsideMainLayout = slot === undefined;
  const target = outsideMainLayout ? (mounted ? document.body : null) : slot;
  if (!target) return null;

  return createPortal(
    // `inset-x-0` instead of `left-1/2 -translate-x-1/2`: a half-pixel translate blurs the text.
    <div className={cn('pointer-events-none flex flex-col', outsideMainLayout && 'fixed inset-x-0 bottom-8 z-50')}>
      <ReducedMotionContext value={shouldReduceMotion}>
        <AnimatePresence>
          {show && (
            <MenuSurface key='menu'>
              <MorphingShell label={label} panel={panel} onPanelDismiss={onPanelDismiss}>
                {children}
              </MorphingShell>
            </MenuSurface>
          )}
        </AnimatePresence>
      </ReducedMotionContext>
    </div>,
    target,
  );
};

const MenuSurface = ({ children }: { children: ReactNode }) => {
  const reduceMotion = use(ReducedMotionContext);
  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : surfaceOffscreen}
      animate={reduceMotion ? { opacity: 1, transition: { duration: 0.2 } } : surfaceEnter}
      exit={reduceMotion ? { opacity: 0, transition: { duration: 0.15 } } : surfaceExit}
      className='pointer-events-auto z-100 mx-auto'>
      {children}
    </motion.div>
  );
};

type MorphingShellProps = Omit<BottomFloatMenuProps, 'show'>;

const MorphingShell = ({ children, label, panel, onPanelDismiss }: MorphingShellProps) => {
  const reduceMotion = use(ReducedMotionContext);
  const shellRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const barFocusIndex = useRef(-1);
  const view = panel?.key ?? BAR_VIEW;
  const [isPresent, safeToRemove] = usePresence();
  const shapeAnimation = useRef<AnimationPlaybackControls | null>(null);
  const collapsing = useRef(false);

  useLayoutEffect(() => {
    const shell = shellRef.current;
    const content = contentRef.current;
    if (!shell || !content) return;
    let sized = false;
    const setSize = ({ width, height }: { width: number; height: number }) =>
      Object.assign(shell.style, { width: `${width}px`, height: `${height}px` });

    // The shell follows its content: grows from a pill on show, then bar to panel, panel to panel, items added or
    // removed. The content is centered and bottom-aligned in it, like the shell in the page, so its text stays put
    // while the edges move.
    const resize = () => {
      if (collapsing.current) return;
      const target = { width: content.offsetWidth, height: content.offsetHeight };
      shapeAnimation.current?.stop();
      if (reduceMotion) {
        setSize(target);
        return;
      }
      if (!sized) setSize(seedPill(target));
      sized = true;
      shapeAnimation.current = animate(shell, target, islandSpring);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(content);
    return () => {
      observer.disconnect();
      shapeAnimation.current?.stop();
    };
  }, [reduceMotion]);

  // Hide: the content blurs out and the shell collapses into the pill; the menu unmounts once it has (and the
  // surface's own exit is done, `AnimatePresence` waits for both).
  useEffect(() => {
    const shell = shellRef.current;
    const content = contentRef.current;
    if (!shell || !content) return;
    if (isPresent) {
      // Shown again mid-collapse: bring the content back and regrow.
      if (!collapsing.current) return;
      collapsing.current = false;
      shell.style.pointerEvents = '';
      animate(content, { opacity: 1, filter: 'blur(0px)' }, { duration: 0.2, ease: easeEnter });
      shapeAnimation.current?.stop();
      shapeAnimation.current = animate(
        shell,
        { width: content.offsetWidth, height: content.offsetHeight },
        islandSpring,
      );
      return;
    }
    if (reduceMotion) {
      safeToRemove();
      return;
    }
    collapsing.current = true;
    // The collapse outlives the fade: let clicks through to the page meanwhile.
    shell.style.pointerEvents = 'none';
    shapeAnimation.current?.stop();
    animate(content, { opacity: 0, filter: 'blur(4px)' }, { duration: 0.1, ease: easeEnter });
    const collapse = animate(shell, seedPill({ width: shell.offsetWidth, height: shell.offsetHeight }), collapseSpring);
    shapeAnimation.current = collapse;
    void collapse.finished.then(() => {
      if (collapsing.current) safeToRemove();
    });
  }, [isPresent, reduceMotion, safeToRemove]);

  // Layout effect: runs before the browser drops focus from the now-inert previous view.
  const previousView = useRef(view);
  useLayoutEffect(() => {
    const shell = shellRef.current;
    if (!shell || previousView.current === view) return;
    const leavingBar = previousView.current === BAR_VIEW;
    previousView.current = view;
    const active = document.activeElement;
    if (!active || !shell.contains(active)) return;
    const current = shell.querySelector<HTMLElement>(`[data-float-menu-view="${view}"]`);
    const focusable = [...(current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])];
    if (leavingBar) {
      const bar = shell.querySelector<HTMLElement>(`[data-float-menu-view="${BAR_VIEW}"]`);
      barFocusIndex.current = [...(bar?.querySelectorAll(FOCUSABLE) ?? [])].indexOf(active);
    }
    const target = view === BAR_VIEW ? focusable[barFocusIndex.current] : undefined;
    (target ?? focusable[0])?.focus({ preventScroll: true });
  }, [view]);

  // Subscribes once per open panel; `panel` and the callback are new objects on every parent render.
  const panelOpen = panel !== null;
  const dismissOnOutsidePress = useEffectEvent((event: PointerEvent) => {
    if (event.target instanceof Node && !shellRef.current?.contains(event.target)) onPanelDismiss?.('outside');
  });
  useEffect(() => {
    if (!panelOpen) return;
    const listener = (event: PointerEvent) => dismissOnOutsidePress(event);
    document.addEventListener('pointerdown', listener);
    return () => document.removeEventListener('pointerdown', listener);
  }, [panelOpen]);

  return (
    <div
      ref={shellRef}
      data-surface='popup'
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || !panel || !onPanelDismiss) return;
        event.preventDefault();
        event.stopPropagation();
        onPanelDismiss('escape');
      }}
      className={cn(
        '[--float-control:--spacing(10)] pointer-coarse:[--float-control:--spacing(11)]',
        // The toast and popup surface. The bar's controls sit 6px in and take `rounded-inner` (popup radius − 6px); the
        // panel's rows sit 4px in, concentric the same way.
        'relative flex items-end justify-center overflow-hidden text-body',
        popupSurface,
      )}>
      <div ref={contentRef} className='w-max flex-none'>
        <AnimatePresence mode='popLayout'>
          <MenuView key={view} view={view}>
            {panel ? (
              <div
                role='group'
                aria-label={panel.label}
                className='flex w-max max-w-[min(22rem,calc(100vw-2rem))] min-w-[min(16.75rem,calc(100vw-2rem))] float-menu-content-in flex-col p-1 pointer-coarse:min-w-[min(18.5rem,calc(100vw-2rem))]'>
                {panel.content}
              </div>
            ) : (
              <div
                role='toolbar'
                aria-label={label}
                className={[
                  // Room to breathe: 8px between controls, 6px around them. Too wide for the screen, it wraps.
                  'flex max-w-[calc(100vw-2rem)] float-menu-content-in flex-wrap items-center justify-center gap-2 p-1.5 [--outer-inset:--spacing(1.5)]',
                  '[&_[data-slot=button]]:h-(--float-control) [&_[data-slot=button]]:min-w-(--float-control) [&_[data-slot=button]]:rounded-inner',
                ].join(' ')}>
                {children}
              </div>
            )}
          </MenuView>
        </AnimatePresence>
      </div>
    </div>
  );
};

const MenuView = ({ view, children }: { view: string; children: ReactNode }) => {
  const isPresent = useIsPresent();
  const reduceMotion = use(ReducedMotionContext);
  return (
    <motion.div
      data-float-menu-view={view}
      inert={!isPresent}
      initial={false}
      exit={reduceMotion ? { opacity: 0, transition: { duration: 0.08 } } : viewExit}>
      {children}
    </motion.div>
  );
};

/**
 * A wrapper per control: the bar's children fade in (`float-menu-content-in` animates `& > *`), so the fade runs on the
 * wrapper, off the Button's own transitions.
 */
export const BottomFloatMenuItem = ({ children }: { children: ReactNode }) => (
  <div className='flex items-center'>{children}</div>
);

interface BottomFloatMenuRowProps {
  icon: ReactNode;
  children: ReactNode;
  onClick: () => void;
  /** It opens another panel: a chevron at the end. */
  opensPanel?: boolean;
}

/** A row in a panel: an icon and a label. */
export const BottomFloatMenuRow = ({ icon, children, onClick, opensPanel }: BottomFloatMenuRowProps) => (
  <BottomFloatMenuItem>
    <Button
      emphasis='ghost'
      onClick={onClick}
      className='h-auto min-h-(--float-control) w-full justify-start gap-2 rounded-inner px-3 py-2.5'>
      {icon}
      <span className='min-w-0 truncate'>{children}</span>
      {opensPanel && <ChevronRightIcon className='ml-auto text-muted-foreground' />}
    </Button>
  </BottomFloatMenuItem>
);
