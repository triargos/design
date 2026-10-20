import { PlayIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '~/components/ui/button';

import { cn } from '~/lib/utils';

import { Code, FoundationPage, FoundationSection, SpecimenList, SpecimenRow } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

// Literal class names, so Tailwind generates them.
const durations = [
  {
    className: 'duration-enter',
    ms: 100,
    use: 'Popups and menus: enter and exit',
    owner: 'Popover, Select, Combobox, menus',
  },
  {
    className: 'duration-feedback',
    ms: 150,
    use: 'Hover, press, colour on controls and rows',
    owner: 'TabsTrigger, Item',
  },
  {
    className: 'duration-move',
    ms: 200,
    use: 'Something that travels on screen',
    owner: 'Tabs indicator, Sheet, Switch thumb',
  },
  {
    className: 'duration-modal',
    ms: 250,
    use: 'Dialogs and their backdrop: enter and exit. Larger than a popup, so slower',
    owner: 'Dialog, AlertDialog, Sheet',
  },
] as const;

const easings = [
  {
    className: 'ease-enter',
    curve: [0.23, 1, 0.32, 1],
    use: 'Enter and exit. Fast start: the response is immediate, the end settles.',
  },
  {
    className: 'ease-move',
    curve: [0.645, 0.045, 0.355, 1],
    use: 'Moving what is already on screen: accelerate, then brake.',
  },
] as const;

/** A cubic-bezier as a plotted curve: time to the right, progress up. */
function Curve({ curve }: { curve: readonly [number, number, number, number] }) {
  const [x1, y1, x2, y2] = curve;
  const size = 64;
  const point = (x: number, y: number) => `${x * size} ${size - y * size}`;
  return (
    <svg viewBox={`-4 -4 ${size + 8} ${size + 8}`} className='size-16 shrink-0 overflow-visible' aria-hidden='true'>
      <rect x={0} y={0} width={size} height={size} className='fill-muted' rx={4} />
      <line x1={0} y1={size} x2={x1 * size} y2={size - y1 * size} className='stroke-faint-foreground' strokeWidth={1} />
      <line x1={size} y1={0} x2={x2 * size} y2={size - y2 * size} className='stroke-faint-foreground' strokeWidth={1} />
      <path
        d={`M ${point(0, 0)} C ${point(x1, y1)} ${point(x2, y2)} ${point(1, 1)}`}
        className='fill-none stroke-primary'
        strokeWidth={2}
        strokeLinecap='round'
      />
    </svg>
  );
}

/** A dot that crosses its track with the given classes, replayed on demand. */
function Run({ className, label }: { className: string; label: string }) {
  const [end, setEnd] = useState(false);
  return (
    <div className='flex items-center gap-group'>
      <div className='@container relative h-8 flex-1 rounded-full bg-muted'>
        <div
          className={cn(
            'absolute top-1 left-1 size-6 rounded-full bg-primary-solid shadow-raised transition-[translate] motion-reduce:transition-none',
            end && 'translate-x-[calc(100cqw-100%-0.5rem)]',
            className,
          )}
        />
      </div>
      <Button emphasis='ghost' size='icon' aria-label={`Play ${label}`} onClick={() => setEnd((value) => !value)}>
        <PlayIcon />
      </Button>
    </div>
  );
}

export default defineDocs({
  title: 'Motion',
  description: 'Motion says what changed and where it went.',
  group: 'Foundations',
  Page: () => (
    <FoundationPage
      title='Motion'
      description='Motion says what changed and where it went. It is short, it starts fast, and frequent actions barely move. Durations and curves are roles, named by what moves.'>
      <FoundationSection title='Durations' description='Larger and rarer moves take longer.'>
        <SpecimenList>
          {durations.map((duration) => (
            <SpecimenRow key={duration.className} name={duration.className} meta={`${duration.ms}ms · ${duration.use}`}>
              <div className='flex flex-col gap-related'>
                <Run className={`${duration.className} ease-enter`} label={duration.className} />
                <Code>{duration.owner}</Code>
              </div>
            </SpecimenRow>
          ))}
        </SpecimenList>
      </FoundationSection>

      <FoundationSection
        title='Easing'
        description='Never linear for UI, never ease-in. Hover and colour use the default ease.'>
        <SpecimenList>
          {easings.map((easing) => (
            <SpecimenRow
              key={easing.className}
              name={easing.className}
              meta={<Code>{`cubic-bezier(${easing.curve.join(', ')})`}</Code>}>
              <div className='flex items-center gap-group'>
                <Curve curve={easing.curve} />
                <p className='text-body text-pretty text-muted-foreground'>{easing.use}</p>
              </div>
            </SpecimenRow>
          ))}
        </SpecimenList>
      </FoundationSection>

      <FoundationSection title='Rules'>
        <SpecimenList>
          <SpecimenRow name='Enter and exit' meta={<Code>fade + zoom from 95%</Code>}>
            <p className='text-body text-pretty text-muted-foreground'>
              Popups and dialogs fade and scale from 95%, from their trigger (<Code>origin-(--transform-origin)</Code>).
              Never from 0.
            </p>
          </SpecimenRow>
          <SpecimenRow name='Springs' meta={<Code>cardRevealTransition</Code>}>
            <p className='text-body text-pretty text-muted-foreground'>
              Motion that can be interrupted (a footer that shows and hides while typing, a dialog acknowledging) is a
              spring in code, so it keeps its speed when it turns around.
            </p>
          </SpecimenRow>
          <SpecimenRow name='Arriving content' meta={<Code>animate-in fade-in-0 duration-feedback</Code>}>
            <p className='text-body text-pretty text-muted-foreground'>
              Content that arrives after a load fades in once, opacity only. A confirmation check pops in and draws its
              stroke (Checkbox, Copy Button).
            </p>
          </SpecimenRow>
          <SpecimenRow name='Reduced motion' meta={<Code>motion-reduce:</Code>}>
            <p className='text-body text-pretty text-muted-foreground'>
              Movement stops; fades may stay. CSS: <Code>motion-reduce:transition-none</Code>. Code:{' '}
              <Code>useReducedMotion()</Code>.
            </p>
          </SpecimenRow>
          <SpecimenRow name='Frequent actions' meta='Menus, shortcuts, selection'>
            <p className='text-body text-pretty text-muted-foreground'>
              What people do many times a day only fades. Nothing travels, nothing bounces.
            </p>
          </SpecimenRow>
        </SpecimenList>
      </FoundationSection>
    </FoundationPage>
  ),
});
