import type { Meta, StoryObj } from '@storybook/react-vite';

import { SeparatorDefault } from '../examples/separator/default';
import { SeparatorVertical } from '../examples/separator/vertical';
import { ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Separator',
  parameters: { description: 'A hairline between groups.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Separator'
      description='A hairline in border-subtle between groups, horizontal or vertical. Inside a FieldGroup, FieldSeparator.'>
      <ExampleSection title='Default'>
        <SeparatorDefault />
      </ExampleSection>
      <ExampleSection title='Vertical'>
        <SeparatorVertical />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <SeparatorDefault /> };
export const Vertical: Story = { render: () => <SeparatorVertical /> };
