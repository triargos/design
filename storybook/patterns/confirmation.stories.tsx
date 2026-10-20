import type { Meta, StoryObj } from '@storybook/react-vite';

import { ConfirmationDefault } from '../examples/patterns/confirmation/default';
import { ExampleSection, FoundationPage } from '../kit/blocks';
import { open } from '../kit/play';

const meta = {
  title: 'Patterns/Confirmation',
  parameters: { description: 'A destructive action: subtle trigger, confirmation, toast.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Confirmation'
      description='A destructive action outside a danger zone: destructive/subtle opens the Alert Dialog, destructive/solid confirms, a toast reports it.'>
      <ExampleSection title='Default'>
        <ConfirmationDefault />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = {
  render: () => <ConfirmationDefault />,
  play: open('click', 'Delete document…', 'Delete document?'),
};
