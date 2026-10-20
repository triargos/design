import type { Meta, StoryObj } from '@storybook/react-vite';
import { MoreHorizontalIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';

import { TooltipAlignment } from '../examples/tooltip/alignment';
import { TooltipDefault } from '../examples/tooltip/default';
import { TooltipDelayGroup } from '../examples/tooltip/delay-group';
import { TooltipPositions } from '../examples/tooltip/positions';
import { ExampleSection, FoundationPage, FoundationSection, Preview } from '../kit/blocks';
import { open } from '../kit/play';

const meta = {
  title: 'Components/Tooltip',
  parameters: { description: 'A name for an icon-only control, after 200ms.' },
  component: Tooltip,
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Tooltip'
      description='A name for an icon-only control, after 200ms: a small popup. Opened by keyboard focus, it shows without animation.'>
      <ExampleSection title='Default' description='Hover the button.'>
        <TooltipDefault />
      </ExampleSection>
      <ExampleSection title='Positions'>
        <TooltipPositions />
      </ExampleSection>
      <ExampleSection title='Alignment'>
        <TooltipAlignment />
      </ExampleSection>
      <ExampleSection
        title='Delay group'
        description='Icon-only buttons in one TooltipProvider: the first tooltip opens after 200ms, its neighbours at once.'>
        <TooltipDelayGroup />
      </ExampleSection>

      <FoundationSection title='Open' description='Switch the mode and surface in the toolbar.'>
        <Preview title='TooltipContent' className='h-28 items-end justify-center'>
          <Tooltip open>
            <TooltipTrigger render={<Button emphasis='ghost' size='icon-sm' aria-label='More actions' />}>
              <MoreHorizontalIcon />
            </TooltipTrigger>
            <TooltipContent>More actions</TooltipContent>
          </Tooltip>
        </Preview>
      </FoundationSection>
    </FoundationPage>
  ),
};

export const Default: Story = {
  render: () => <TooltipDefault />,
  play: open('hover', 'More actions', 'More actions'),
};
export const Positions: Story = {
  render: () => <TooltipPositions />,
  play: open('hover', 'Right', 'Opens on the right'),
};
export const Alignment: Story = {
  render: () => <TooltipAlignment />,
  play: open('hover', 'Start', 'Aligned to the start'),
};
export const DelayGroup: Story = {
  name: 'Delay group',
  render: () => <TooltipDelayGroup />,
  play: open('hover', 'Bold', 'Bold'),
};
