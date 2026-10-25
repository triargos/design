import {
  createContext,
  use,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { cn } from '~/lib/utils';

import { paintedExtent, type PaintedExtent } from './measure';

type Report = (id: string, ok: boolean | undefined) => void;

const PaintCheckContext = createContext<Report | null>(null);

/**
 * A regression check: every `PaintCheck` inside measures what its control paints, and the line on top counts the ones
 * that paint outside or short of their box. Live, so it holds under any theme, density or mode the page is in.
 */
export function PaintCheckGroup({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<ReadonlyMap<string, boolean>>(new Map());
  const report = useCallback<Report>((id, ok) => {
    setResults((current) => {
      if (current.get(id) === ok) return current;
      const next = new Map(current);
      if (ok === undefined) next.delete(id);
      else next.set(id, ok);
      return next;
    });
  }, []);
  const failed = [...results.values()].filter((ok) => !ok).length;
  return (
    <PaintCheckContext value={report}>
      <div className='flex flex-col gap-related'>
        <p
          role='status'
          data-paint-check={failed === 0 ? 'pass' : 'fail'}
          className={cn('text-body font-medium', failed === 0 ? 'text-success' : 'text-destructive')}>
          {failed === 0
            ? `All ${results.size} paint exactly their box.`
            : `${failed} of ${results.size} paint outside or short of their box.`}
        </p>
        {children}
      </div>
    </PaintCheckContext>
  );
}

/** Waits for running transitions (a forced hover fades in), so the reading is the settled state. */
const settled = (element: Element) =>
  Promise.all(element.getAnimations({ subtree: false }).map((animation) => animation.finished.catch(() => undefined)));

const describe = (extent: PaintedExtent | undefined): { label: string; ok: boolean } => {
  if (extent === undefined) return { label: 'paints nothing', ok: true };
  const above = -extent.top;
  const below = extent.bottom - extent.box;
  const painted = Math.round((extent.bottom - extent.top) * 100) / 100;
  if (above === 0 && below === 0) return { label: `${painted}px`, ok: true };
  const off = above + below;
  return { label: `${painted}px, box ${extent.box}px (${off > 0 ? '+' : ''}${off})`, ok: false };
};

/**
 * Measures the `[data-slot]` control inside: the rows it paints (fill, border, rings) must be its border box, so a row
 * of controls at one size lines up whatever their emphasis. Dashed guides mark the box; the label says what it paints.
 * `backdrop` sets the surface the control sits on, e.g. a saturated fill where a translucent edge disappears.
 */
export function PaintCheck({ backdrop, children }: { backdrop?: string; children: ReactNode }) {
  const id = useId();
  const report = use(PaintCheckContext);
  const root = useRef<HTMLDivElement>(null);
  const [extent, setExtent] = useState<PaintedExtent | undefined | null>(null);

  useLayoutEffect(() => {
    const control = root.current?.querySelector<HTMLElement>('[data-slot]');
    if (!control) return;
    let cancelled = false;
    const measure = () => {
      // After the frame the forced-state styles land in, and after the transitions they start.
      requestAnimationFrame(() => {
        void settled(control).then(() => {
          if (!cancelled) setExtent(paintedExtent(control));
        });
      });
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(control);
    // Mode and theme switches restyle the control without resizing it.
    const restyle = new MutationObserver(measure);
    restyle.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] });
    return () => {
      cancelled = true;
      resize.disconnect();
      restyle.disconnect();
    };
  }, []);

  const result = useMemo(() => (extent === null ? undefined : describe(extent)), [extent]);
  useLayoutEffect(() => {
    report?.(id, result?.ok);
  }, [id, report, result?.ok]);
  useLayoutEffect(() => () => report?.(id, undefined), [id, report]);

  return (
    <div className='flex flex-col items-start gap-tight'>
      <div className={cn('flex', backdrop !== undefined && ['rounded-control-sm px-2.5 py-1.5', backdrop])}>
        <div ref={root} className='relative isolate flex'>
          {/* The box's top and bottom row, behind the control: a control that paints short of them shows the guide. */}
          <span
            aria-hidden
            className='absolute -inset-x-2 top-0 -z-10 border-t border-dashed border-muted-foreground/50'
          />
          <span
            aria-hidden
            className='absolute -inset-x-2 bottom-0 -z-10 border-b border-dashed border-muted-foreground/50'
          />
          {children}
        </div>
      </div>
      <span
        className={cn(
          'text-caption tabular-nums',
          result === undefined || result.ok ? 'text-muted-foreground' : 'font-medium text-destructive',
        )}>
        {result?.label ?? '…'}
      </span>
    </div>
  );
}
