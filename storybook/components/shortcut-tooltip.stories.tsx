import type { Meta, StoryObj } from '@storybook/react-vite';

import { ShortcutTooltipDefault } from '../examples/shortcut-tooltip/default';
import { ExampleSection, FoundationPage } from '../kit/blocks';
import { open } from '../kit/play';

const meta = {
  title: 'Components/Shortcut Tooltip',
  parameters: { description: 'Names a control and its keyboard shortcut.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Shortcut Tooltip'
      description='A Tooltip that names a control and its shortcut. A chord reads “G then P” (chordSeparator); a combination uses the platform’s modifier.'>
      <ExampleSection title='Default' description='Hover the button.'>
        <ShortcutTooltipDefault />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = {
  render: () => <ShortcutTooltipDefault />,
  play: open('hover', 'Projects', 'Projects'),
};
