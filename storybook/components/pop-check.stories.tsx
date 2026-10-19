import type { Meta, StoryObj } from '@storybook/react-vite';

import { PopCheckDefault } from '../examples/pop-check/default';
import { ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Pop Check',
  parameters: { description: 'A check that pops in and draws its stroke.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Pop Check'
      description='A check that pops in tilted, past full size, and draws its stroke; render it as a keyed child of AnimatePresence. CopyButton and Checkbox use it. Reduced motion: a cross-fade.'>
      <ExampleSection title='Default' description='Replay with the button.'>
        <PopCheckDefault />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <PopCheckDefault /> };
