import type { Meta, StoryObj } from '@storybook/react-vite';

import { Kbd } from '~/components/ui/kbd';

import { KbdCombinations } from '../examples/kbd/combinations';
import { KbdDefault } from '../examples/kbd/default';
import { KbdInRunningText } from '../examples/kbd/in-running-text';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Kbd',
  parameters: { description: 'A key on the keyboard.' },
  component: Kbd,
} satisfies Meta<typeof Kbd>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Kbd'
      description='A key on the keyboard, in caption on the quiet fill. Shortcut Tooltip names a control and its shortcut.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>20px · rounded-control-xs</Code>
          </>
        }>
        <KbdDefault />
      </ExampleSection>
      <ExampleSection
        title='Combinations'
        description={
          <>
            <Code>KbdGroup</Code>
          </>
        }>
        <KbdCombinations />
      </ExampleSection>
      <ExampleSection title='In running text'>
        <KbdInRunningText />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <KbdDefault /> };
export const Combinations: Story = { render: () => <KbdCombinations /> };
export const InRunningText: Story = {
  name: 'In running text',
  render: () => <KbdInRunningText />,
};
