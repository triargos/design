import type { Meta, StoryObj } from '@storybook/react-vite';

import { DrawerDefault } from '../examples/drawer/default';
import { DrawerNested } from '../examples/drawer/nested';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { open, clickThrough } from '../kit/play';

const meta = {
  title: 'Components/Drawer',
  parameters: { description: 'A bottom sheet for touch, swiped down to close.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Drawer'
      description='A bottom sheet for touch menus and short tasks, swiped down to close. Under DrawerProvider the page scales back; a drawer opened from a drawer stacks on it.'>
      <ExampleSection title='Default'>
        <DrawerDefault />
      </ExampleSection>
      <ExampleSection
        title='Nested'
        description={
          <>
            <Code>DrawerProvider · DrawerIndent</Code>: the page scales back. Open both.
          </>
        }>
        <DrawerNested />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = {
  render: () => <DrawerDefault />,
  play: open('click', 'Abwesenheit melden', 'Mia Schmidt · heute'),
};
export const Nested: Story = {
  render: () => <DrawerNested />,
  play: clickThrough(
    { click: 'Abwesenheit öffnen', shows: 'Mia Schmidt · Krankheit · heute' },
    { click: 'Grund ändern', shows: 'Krankheit, Arzttermin oder ein anderer Grund.' },
  ),
};
