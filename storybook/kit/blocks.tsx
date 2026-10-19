import { ChevronRightIcon } from 'lucide-react';
import {
  createContext,
  Fragment,
  isValidElement,
  use,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { Button } from '~/components/ui/button';
import { CopyButton } from '~/components/ui/copy-button';
import {
  InsetCard,
  InsetCardContent,
  InsetCardFooter,
  InsetCardHeader,
  InsetCardTitle,
} from '~/components/ui/inset-card';

import { cn } from '~/lib/utils';

import { measureGaps, type GapBand } from './measure';

/**
 * How the docs site renders a Board: the examples only. Spec sections (`FoundationSection`: matrices, forced states,
 * guidance) stay in Storybook; `afterHeader` (the docs Playground) goes below the page header. Storybook provides
 * none, so Boards render whole there.
 */
export interface DocsMode {
  readonly afterHeader?: ReactNode;
  /** Component and pattern pages: spec sections out, the lead sentence only. Foundation pages keep both. */
  readonly hideSpecs?: boolean;
}

export const DocsModeContext = createContext<DocsMode | null>(null);

/**
 * Story page layout, after Interfere's design pages: a centered column, the title and a hairline, then sections. Specimens
 * sit in the app's own card (`Preview`, `SpecimenList`), so they render on the surface they mostly live on.
 */
/** The docs show a Board's lead sentence; the rest is spec, for Storybook. */
const firstSentence = (text: string) => /^.+?[.!?](?=\s|$)/.exec(text)?.[0] ?? text;

export function FoundationPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const docs = use(DocsModeContext);
  return (
    <div className='mx-auto flex w-full max-w-3xl flex-col gap-page'>
      <header className='flex flex-col gap-tight'>
        <h1 className='text-heading'>{title}</h1>
        <p className='max-w-prose text-body text-pretty text-muted-foreground'>
          {docs?.hideSpecs ? firstSentence(description) : description}
        </p>
      </header>
      <Hairline />
      <div className='flex flex-col gap-section'>
        {use(DocsModeContext)?.afterHeader}
        {children}
      </div>
    </div>
  );
}

export function Hairline({ className }: { className?: string }) {
  return <div aria-hidden className={cn('h-px shrink-0 bg-border', className)} />;
}

/** A spec section of a Board. The docs site leaves it out (`DocsModeContext`). */
export function FoundationSection(props: { title: string; description?: ReactNode; children: ReactNode }) {
  if (use(DocsModeContext)?.hideSpecs) return null;
  return <Section {...props} />;
}

/** A titled section: `FoundationSection` and `ExampleSection` share it. */
export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  // The docs drop a description that only lists parts (`<Code>A</Code> · <Code>B</Code>`): the code below shows them.
  const docs = use(DocsModeContext)?.hideSpecs === true;
  const shown = description !== undefined && !(docs && isCodeOnly(description));
  return (
    <section data-slot='foundation-section' data-title={title} className='flex flex-col gap-group'>
      <div className='flex flex-col gap-tight'>
        <h2 className='text-body font-medium'>{title}</h2>
        {shown && <p className='max-w-prose text-body text-pretty text-muted-foreground'>{description}</p>}
      </div>
      {children}
    </section>
  );
}

/** Only `Code` and the punctuation between it: a list of parts, not a sentence. */
function isCodeOnly(node: ReactNode): boolean {
  if (node === null || node === undefined || typeof node === 'boolean') return true;
  if (typeof node === 'string') return /^[\s·,/+&|()–-]*$/.test(node);
  if (Array.isArray(node)) return node.every(isCodeOnly);
  if (isValidElement<{ children?: ReactNode }>(node)) {
    if (node.type === Code) return true;
    if (node.type === Fragment) return isCodeOnly(node.props.children);
  }
  return false;
}

/** One specimen, or a row of them, in a card. `title` labels a usage: the composition it shows. */
export function Preview({
  title,
  className,
  footer,
  children,
}: {
  title?: string;
  className?: string;
  /** On the shell under the card: `ExampleCode`. */
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <InsetCard data-slot='preview' data-title={title} className='min-w-0'>
      {title !== undefined && (
        <InsetCardHeader className='py-2'>
          <InsetCardTitle className='text-caption text-muted-foreground'>{title}</InsetCardTitle>
        </InsetCardHeader>
      )}
      {/* The examples are German; the docs around them are English. */}
      <InsetCardContent lang='de' className={cn('flex flex-wrap items-center gap-related p-group', className)}>
        {children}
      </InsetCardContent>
      {footer}
    </InsetCard>
  );
}

/**
 * The source of the example an `ExampleSection` shows, by section title (`'With icon'` →
 * `examples/<entry>/with-icon.tsx`). The docs site provides it, loaded with the page; Storybook does not, so it shows
 * no code.
 */
export const ExampleSourceContext = createContext<((section: string) => string | undefined) | null>(null);

/** "Show code" and copy, on the shell under an example; the source opens below. */
export function ExampleCode({ section }: { section: string }) {
  const source = use(ExampleSourceContext)?.(section)?.trimEnd();
  const [open, setOpen] = useState(false);
  const codeId = useId();

  if (source === undefined) return null;
  return (
    <div data-slot='example-code'>
      <div className='flex items-center justify-between gap-related px-1 pt-1'>
        <Button
          type='button'
          size='xs'
          intent='neutral'
          emphasis='ghost'
          aria-expanded={open}
          aria-controls={codeId}
          onClick={() => setOpen((value) => !value)}
          className='text-muted-foreground'>
          <ChevronRightIcon
            data-icon='inline-start'
            aria-hidden
            className={cn('transition-transform duration-150', open && 'rotate-90')}
          />
          {open ? 'Hide code' : 'Show code'}
        </Button>
        <CopyButton value={source} label='Copy code' size='icon-xs' />
      </div>
      <InsetCardFooter show={open} className='px-0 pt-1'>
        <pre
          id={codeId}
          tabIndex={0}
          aria-label={`${section} code`}
          className='max-h-120 overflow-auto rounded-inner border border-(--edge) bg-card p-group font-mono text-caption text-foreground'>
          <code>{source}</code>
        </pre>
      </InsetCardFooter>
    </div>
  );
}

/**
 * One example (a file in `storybook/examples/`) as a page section: the section title is the example's name. `bare` for an
 * example that is a card itself, so it does not nest in the `Preview` card.
 */
export function ExampleSection({
  title,
  description,
  bare = false,
  className,
  children,
}: {
  title: string;
  description?: ReactNode;
  bare?: boolean;
  className?: string;
  children: ReactNode;
}) {
  // The docs frame every example alike: centered on the preview card, a bare one (a card itself) included, so none ends
  // at its own width above a full-width code strip.
  const docs = use(DocsModeContext) !== null;
  return (
    <Section title={title} description={description}>
      {bare && !docs ? (
        <div className='flex min-w-0 flex-col gap-tight'>
          <div lang='de' className={cn('min-w-0', className)}>
            {children}
          </div>
          <ExampleCode section={title} />
        </div>
      ) : (
        <Preview
          className={cn(
            className,
            docs && 'min-h-36 px-page py-page',
            // A bare example is block content (a page stage, a capped card): block layout lets a stage fill the width
            // and centers a capped card on its auto margins. The rest is a row of controls, centered.
            docs && (bare ? 'block *:mx-auto' : 'justify-center'),
          )}
          footer={<ExampleCode section={title} />}>
          {children}
        </Preview>
      )}
    </Section>
  );
}

/** Labelled `SpecimenRow`s in one card, separated by hairlines. */
export function SpecimenList({ children }: { children: ReactNode }) {
  return (
    <InsetCard>
      <InsetCardContent className='flex flex-col overflow-hidden'>{children}</InsetCardContent>
    </InsetCard>
  );
}

const LABEL_HEIGHT = 20;

/**
 * Measures the real vertical gaps in `children` and labels each with its spacing step. A gap that is not on the scale
 * is red. Measures again on resize and once entry animations settle.
 */
export function GapRuler({ show, children }: { show: boolean; children: ReactNode }) {
  const labelFont = useLabelFont();
  const ref = useRef<HTMLDivElement>(null);
  const [bands, setBands] = useState<ReadonlyArray<GapBand>>([]);
  useLayoutEffect(() => {
    const root = ref.current;
    if (root === null || !show) {
      setBands([]);
      return;
    }
    const measure = () => setBands(measureGaps(root).filter((band) => band.axis === 'vertical'));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    const settle = window.setTimeout(measure, 800);
    void document.fonts.ready.then(measure);
    return () => {
      observer.disconnect();
      window.clearTimeout(settle);
    };
  }, [show]);

  // Labels sit in the right gutter; push each below the previous one so neighbouring 4px gaps stay readable.
  let labelFloor = Number.NEGATIVE_INFINITY;
  const labelled = bands.map((band) => {
    const labelTop = Math.max(band.top + band.height / 2 - LABEL_HEIGHT / 2, labelFloor);
    labelFloor = labelTop + LABEL_HEIGHT + 2;
    return { band, labelTop, step: band.step };
  });

  return (
    <div className={cn('relative', show && 'pr-28')}>
      <div ref={ref}>{children}</div>
      {labelled.map(({ band, labelTop, step }) => (
        <div key={`${band.top}:${band.height}`} aria-hidden className='pointer-events-none'>
          <div
            className={cn('absolute', step === undefined ? 'bg-destructive/30' : 'bg-primary/20')}
            style={{ top: band.top, left: band.left, width: band.width, height: band.height }}
          />
          <span
            className={cn(
              'absolute right-0 flex min-w-26 items-center justify-between gap-2 rounded-full bg-background px-2 text-caption tabular-nums ring-1',
              labelFont,
              step === undefined ? 'text-destructive ring-destructive/40' : 'text-muted-foreground ring-border',
            )}
            style={{ top: labelTop, height: LABEL_HEIGHT }}>
            <span className='text-foreground'>{band.height}</span>
            {step ?? 'off scale'}
          </span>
        </div>
      ))}
    </div>
  );
}

/** One labelled row of a `SpecimenList`: what it is and who owns it on the left, the rendered result on the right. */
export function SpecimenRow({ name, meta, children }: { name: string; meta?: ReactNode; children: ReactNode }) {
  return (
    <div className='grid gap-related border-t border-border p-group first:border-t-0 md:grid-cols-[11rem_1fr] md:items-center md:gap-group'>
      <div className='flex flex-col'>
        <span className='text-body font-medium'>{name}</span>
        {meta !== undefined && <span className='text-caption text-muted-foreground'>{meta}</span>}
      </div>
      <div className='min-w-0'>{children}</div>
    </div>
  );
}

/**
 * Two axes in one card: a header row of column names, then one row per value of the other axis. Dense: every
 * combination at a glance (intent × emphasis, size × state).
 */
export function Matrix({
  columns,
  rows,
  columnWidth = '7.5rem',
}: {
  columns: ReadonlyArray<string>;
  rows: ReadonlyArray<{ name: string; meta?: ReactNode; cells: ReadonlyArray<ReactNode> }>;
  columnWidth?: string;
}) {
  const labelFont = useLabelFont();
  const grid = { gridTemplateColumns: `8rem repeat(${columns.length}, minmax(${columnWidth}, 1fr))` };
  return (
    <InsetCard>
      <InsetCardContent className='overflow-x-auto'>
        <div className='grid min-w-fit items-center gap-x-related' style={grid}>
          <span />
          {columns.map((column) => (
            <span key={column} className={cn('px-1 pt-group pb-related text-caption text-muted-foreground', labelFont)}>
              {column}
            </span>
          ))}
          {rows.map((row) => (
            <div key={row.name} className='contents'>
              <div className='flex flex-col border-t border-border-subtle py-related pl-group'>
                <span className='text-body font-medium'>{row.name}</span>
                {row.meta !== undefined && <span className='text-caption text-muted-foreground'>{row.meta}</span>}
              </div>
              {row.cells.map((cell, index) => (
                // oxlint-disable-next-line react/no-array-index-key -- cells are positional, one per column.
                <div
                  key={index}
                  className='flex min-w-0 items-center border-t border-border-subtle px-1 py-related last:pr-group'>
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
      </InsetCardContent>
    </InsetCard>
  );
}

/** A grid of `Tile`s: one visual each, named underneath (radius, shadow, surface). */
export function TileGrid({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('grid grid-cols-2 gap-x-group gap-y-page md:grid-cols-3', className)}>{children}</div>;
}

export function Tile({ name, meta, children }: { name: string; meta?: ReactNode; children: ReactNode }) {
  const labelFont = useLabelFont();
  return (
    <div className='flex min-w-0 flex-col gap-related'>
      {children}
      <div className='flex min-w-0 flex-col px-1'>
        <span className='text-body font-medium'>{name}</span>
        {meta !== undefined && (
          <span className={cn('truncate text-caption text-muted-foreground', labelFont)}>{meta}</span>
        )}
      </div>
    </div>
  );
}

/** Labels (token, part and prop names) are mono in Storybook; the docs set them in the page's sans. */
const useLabelFont = () => (use(DocsModeContext) === null ? 'font-mono' : 'font-sans');

/** A prop, value or part name. Mono in Storybook's spec; in the docs it reads as a word. */
export function Code({ children }: { children: ReactNode }) {
  if (use(DocsModeContext) !== null) return <span className='text-foreground'>{children}</span>;
  return <code className='font-mono text-caption text-muted-foreground'>{children}</code>;
}

/** Reads a custom property where the element sits, so the value follows the brand, the mode and the surface. */
function useCustomProperty(name: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState('');
  // No dependencies: the toolbar re-renders the story with new CSS, and the value is read after that commit.
  useLayoutEffect(() => {
    if (ref.current === null) return;
    const next = getComputedStyle(ref.current).getPropertyValue(`--${name}`).trim();
    setValue((current) => (current === next ? current : next));
  });
  return [ref, value] as const;
}

export type SwatchKind = 'fill' | 'text' | 'line';

export interface SwatchToken {
  readonly token: string;
  readonly role: string;
  readonly kind?: SwatchKind;
  /** Text color shown on a fill, as a CSS value. */
  readonly on?: string;
}

const swatchStyle = (token: string, kind: SwatchKind, on: string | undefined): CSSProperties => {
  switch (kind) {
    case 'fill':
      return { background: `var(--${token})`, color: on };
    case 'text':
      return { color: `var(--${token})` };
    case 'line':
      return { boxShadow: `inset 0 0 0 3px var(--${token})` };
  }
};

export function Swatch({ token, role, kind = 'fill', on }: SwatchToken) {
  const labelFont = useLabelFont();
  const [ref, value] = useCustomProperty(token);
  return (
    <div ref={ref} className='flex min-w-0 flex-col gap-related'>
      <div
        style={swatchStyle(token, kind, on)}
        className={cn(
          'flex h-20 items-end rounded-xl p-3 text-heading ring-1 ring-foreground/10 ring-inset',
          kind !== 'fill' && 'bg-background',
        )}>
        {(kind === 'text' || on !== undefined) && 'Aa'}
      </div>
      <div className='flex min-w-0 flex-col px-1'>
        <span className='text-body font-medium'>{token}</span>
        <span className='text-caption text-muted-foreground'>{role}</span>
        <span className={cn('truncate text-caption text-muted-foreground/70', labelFont)} title={value}>
          {value}
        </span>
      </div>
    </div>
  );
}

export function SwatchGrid({ tokens }: { tokens: ReadonlyArray<SwatchToken> }) {
  return (
    <div className='grid grid-cols-2 gap-x-group gap-y-page md:grid-cols-4'>
      {tokens.map((token) => (
        <Swatch key={token.token} {...token} />
      ))}
    </div>
  );
}

/**
 * `parameters.pseudo` for a board that forces states per cell: a `StateCell` with `state='hover'` puts everything in it
 * under `:hover` (`storybook-addon-pseudo-states`), and so on.
 */
export const FORCED_STATES = {
  hover: ['.state-hover, .state-hover *'],
  active: ['.state-press, .state-press *'],
  focusVisible: ['.state-focus, .state-focus *'],
  focusWithin: ['.state-focus, .state-focus *'],
} as const;

export function StateCell({ state, children }: { state: string; children: ReactNode }) {
  return <div className={`state-${state} flex min-w-0 items-center`}>{children}</div>;
}
