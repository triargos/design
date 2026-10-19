import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';

import { FloatMenuSlotContext } from '~/components/ui/layout-slots';
import { Skeleton } from '~/components/ui/skeleton';

import { BottomFloatMenuDefault } from '../examples/bottom-float-menu/default';
import { BottomFloatMenuStatus } from '../examples/bottom-float-menu/status';
import { BottomFloatMenuWithPanel } from '../examples/bottom-float-menu/with-panel';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { clickThrough } from '../kit/play';

const meta = {
  title: 'Components/Bottom Float Menu',
  parameters: { description: 'A bar that floats over the bottom of the page while something is pending.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * A page column with the float-menu slot at its bottom, as `MainLayout` provides it (`FloatMenuSlotContext`). Without
 * a provider the menu portals to `body`, fixed to the viewport: what the example stories show.
 */
function PageStage({ height = 'h-48', children }: { height?: string; children: ReactNode }) {
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);
  return (
    <div className={`relative ${height} overflow-hidden rounded-card bg-background shadow-border`}>
      <div className='flex flex-col gap-related p-group' aria-hidden>
        <Skeleton className='h-4 w-1/3 animate-none' />
        <Skeleton className='h-3 w-2/3 animate-none' />
        <Skeleton className='h-3 w-1/2 animate-none' />
      </div>
      <div ref={setSlot} className='pointer-events-none absolute inset-x-0 bottom-8 z-10 flex flex-col' />
      <FloatMenuSlotContext value={slot}>{children}</FloatMenuSlotContext>
    </div>
  );
}

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Bottom Float Menu'
      description='A bar that floats over the bottom of the page while something is pending: a selection, unsaved changes. It grows from a pill and its controls fade in one by one; a row opens a panel and the bar morphs into it. MainLayout provides the slot it portals into; each stage here provides its own. For unsaved changes, UnsavedChangesToast builds the bar: Patterns › Settings Form.'>
      <ExampleSection title='Default' description='Direct actions on a selection: inbox, import rules.' bare>
        <PageStage>
          <BottomFloatMenuDefault />
        </PageStage>
      </ExampleSection>
      <ExampleSection
        title='With panel'
        description={
          <>
            A count, clear, and an actions panel with a nested panel. <Code>BottomFloatMenuRow opensPanel</Code> adds
            the chevron. Click Aktionen.
          </>
        }
        bare>
        <PageStage height='h-72'>
          <BottomFloatMenuWithPanel />
        </PageStage>
      </ExampleSection>
      <ExampleSection title='Status' description='A status instead of controls: the saved confirmation.' bare>
        <PageStage>
          <BottomFloatMenuStatus />
        </PageStage>
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <BottomFloatMenuDefault /> };
export const WithPanel: Story = {
  name: 'With panel',
  render: () => <BottomFloatMenuWithPanel />,
  play: clickThrough({ click: 'Aktionen', shows: 'Eltern einladen' }),
};
export const Status: Story = { render: () => <BottomFloatMenuStatus /> };
