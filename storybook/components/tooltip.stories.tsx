import type { Meta, StoryObj } from '@storybook/react-vite';
import { MoreHorizontalIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '~/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';

import { TooltipAlignment } from '../examples/tooltip/alignment';
import { TooltipDefault } from '../examples/tooltip/default';
import { TooltipDelayGroup } from '../examples/tooltip/delay-group';
import { TooltipPositions } from '../examples/tooltip/positions';
import { TooltipVariants } from '../examples/tooltip/variants';
import { ExampleSection, FoundationPage, FoundationSection, Preview } from '../kit/blocks';
import { open } from '../kit/play';

const meta = {
  title: 'Components/Tooltip',
  parameters: { description: 'A name for an icon-only control, after 200ms.' },
  component: Tooltip,
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

type Appearance = 'light' | 'inverted';

function IconWithTooltip({
  label,
  icon,
  appearance,
  open,
}: {
  label: string;
  icon: ReactNode;
  appearance: Appearance;
  open?: boolean;
}) {
  return (
    <Tooltip open={open}>
      <TooltipTrigger
        render={<Button type='button' intent='neutral' emphasis='ghost' size='icon-sm' aria-label={label} />}>
        {icon}
      </TooltipTrigger>
      <TooltipContent appearance={appearance}>{label}</TooltipContent>
    </Tooltip>
  );
}

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Tooltip'
      description='A name for an icon-only control, after 200ms. Two appearances to compare before one becomes the only one: light (a small popup) and inverted (the neutral solid).'>
      <ExampleSection title='Default' description='Hover the button.'>
        <TooltipDefault />
      </ExampleSection>
      <ExampleSection
        title='Variants'
        description='Light, a small popup, and inverted, the neutral solid: compared before one becomes the only one.'>
        <TooltipVariants />
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

      <FoundationSection
        title='Appearance'
        description='Open, side by side. Switch the mode and surface in the toolbar.'>
        <div className='grid gap-group md:grid-cols-2'>
          {(['light', 'inverted'] as const).map((appearance) => (
            <Preview key={appearance} title={appearance} className='h-28 items-end justify-center'>
              <IconWithTooltip label='Weitere Aktionen' icon={<MoreHorizontalIcon />} appearance={appearance} open />
            </Preview>
          ))}
        </div>
      </FoundationSection>
    </FoundationPage>
  ),
};

export const Default: Story = {
  render: () => <TooltipDefault />,
  play: open('hover', 'Weitere Aktionen', 'Weitere Aktionen'),
};
export const Variants: Story = {
  render: () => <TooltipVariants />,
  play: open('hover', 'Inverted', 'Weitere Aktionen'),
};
export const Positions: Story = {
  render: () => <TooltipPositions />,
  play: open('hover', 'Rechts', 'Tooltip rechts'),
};
export const Alignment: Story = {
  render: () => <TooltipAlignment />,
  play: open('hover', 'Anfang', 'Ausgerichtet: Anfang'),
};
export const DelayGroup: Story = {
  name: 'Delay group',
  render: () => <TooltipDelayGroup />,
  play: open('hover', 'Fett', 'Fett'),
};
