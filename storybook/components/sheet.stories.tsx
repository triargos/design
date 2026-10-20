import type { Meta, StoryObj } from '@storybook/react-vite';

import { SheetDefault } from '../examples/sheet/default';
import { SheetDirections } from '../examples/sheet/directions';
import { SheetWithoutCloseButton } from '../examples/sheet/without-close-button';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { open } from '../kit/play';

const meta = {
  title: 'Components/Sheet',
  parameters: { description: 'A side panel: the dialog shell at full height.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Sheet'
      description='A side panel: the dialog shell at full height, for a task next to the page. SheetBody scrolls; from sm the panel floats 8px in.'>
      <ExampleSection title='Default'>
        <SheetDefault />
      </ExampleSection>
      <ExampleSection
        title='Without close button'
        description={
          <>
            <Code>showCloseButton={'{false}'}</Code>: no ✕, the footer action closes it.
          </>
        }>
        <SheetWithoutCloseButton />
      </ExampleSection>
      <ExampleSection
        title='Directions'
        description={
          <>
            <Code>side='right'</Code> (the default) or <Code>'left'</Code>.
          </>
        }>
        <SheetDirections />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = {
  render: () => <SheetDefault />,
  play: open('click', 'Invite member', 'We’ll email them a link to join the workspace.'),
};
export const WithoutCloseButton: Story = {
  name: 'Without close button',
  render: () => <SheetWithoutCloseButton />,
  play: open('click', 'Filter', 'Project, assignee and due date.'),
};
export const Directions: Story = {
  render: () => <SheetDirections />,
  play: open('click', 'Left', 'Navigation and folders.'),
};
