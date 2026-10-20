import type { ReactNode } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';

import { cn } from '~/lib/utils';

import { Code, FoundationPage, FoundationSection, Tile, TileGrid } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

/** The surface-relative fills; each `[data-surface]` re-declares them one step from itself. */
function RelativeFills() {
  return (
    <div className='flex flex-wrap gap-2'>
      <span className='rounded-sm bg-muted px-2 py-0.5 text-caption'>muted</span>
      <span className='rounded-sm bg-field px-2 py-0.5 text-caption'>field</span>
      <span className='rounded-sm bg-shell px-2 py-0.5 text-caption'>shell</span>
      <span className='rounded-sm bg-neutral-subtle px-2 py-0.5 text-caption'>neutral-subtle</span>
    </div>
  );
}

function Layer({ name, owner, children }: { name: string; owner: ReactNode; children?: ReactNode }) {
  return (
    <div className='flex flex-col gap-3'>
      <div className='flex items-baseline justify-between gap-4'>
        <span className='text-body font-medium'>{name}</span>
        {owner}
      </div>
      <RelativeFills />
      {children}
    </div>
  );
}

// Literal class names, so Tailwind generates them.
const elevations = [
  { className: 'shadow-none', name: 'flat', use: 'Page content, shells' },
  { className: 'shadow-border', name: 'shadow-border', use: 'The ring alone, no lift' },
  { className: 'shadow-field', name: 'shadow-field', use: 'Fields: a firmer ring, heavier at the bottom' },
  { className: 'shadow-raised', name: 'shadow-raised', use: 'Cards, raised buttons, tab chips' },
  { className: 'shadow-popup', name: 'shadow-popup', use: 'Menus, popovers, selects, tooltips' },
  { className: 'shadow-modal', name: 'shadow-modal', use: 'Dialogs, sheets' },
] as const;

export default defineDocs({
  title: 'Surfaces',
  description: 'Surfaces sit on each other: sidebar → page panel → card shell → card → popup.',
  group: 'Foundations',
  Page: () => (
    <FoundationPage
      title='Surfaces'
      description='Surfaces sit on each other: sidebar → page panel → card shell → card → popup. Quiet fills are relative: the same class reads one step from whatever surface it sits on. Elevation says how high a surface sits.'>
      <FoundationSection
        title='Elevation'
        description='One edge at every level: a translucent ring outside the fill, so it takes the color of whatever sits behind it. Higher levels add drop; in dark the drops vanish and the white ring carries the edge.'>
        <TileGrid>
          {elevations.map(({ className, name, use }) => (
            <Tile key={name} name={name} meta={use}>
              <div className={cn('h-20 rounded-card bg-card', className)} />
            </Tile>
          ))}
        </TileGrid>
      </FoundationSection>

      <FoundationSection title='Stack' description='Each layer shows the same fill classes.'>
        <div className='flex flex-col gap-6'>
          <Layer name='Page panel' owner={<Code>MainLayout · bg-background</Code>} />
          <Card>
            <CardHeader>
              <CardTitle>Card shell</CardTitle>
              <CardDescription>The label strip sits on the shell, not on a second surface.</CardDescription>
            </CardHeader>
            <CardContent className='p-4'>
              <Layer name='Card' owner={<Code>CardContent</Code>}>
                <div
                  data-surface='popup'
                  className={cn('rounded-popup bg-popover text-popover-foreground shadow-popup', 'mt-2 max-w-sm p-4')}>
                  <Layer name='Popup' owner={<Code>PopoverContent · shadow-popup</Code>} />
                </div>
              </Layer>
            </CardContent>
          </Card>
        </div>
      </FoundationSection>
    </FoundationPage>
  ),
});
