import type { Meta, StoryObj } from '@storybook/react-vite';

import { CommandDefault } from '../examples/command/default';
import { CommandGrouped } from '../examples/command/grouped';
import { CommandStandalone } from '../examples/command/standalone';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { open } from '../kit/play';

const meta = {
  title: 'Components/Command',
  parameters: { description: 'A filterable list of commands; the palette.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Command'
      description='A filterable list of commands (cmdk): the palette in a dialog, or a list inline. For picking a value in a form, Search Select.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>CommandDialog</Code>, opened with ⌘K or its button.
          </>
        }>
        <CommandDefault />
      </ExampleSection>
      <ExampleSection
        title='Grouped'
        description={
          <>
            <Code>CommandGroup heading · CommandSeparator · CommandShortcut</Code>
          </>
        }>
        <CommandGrouped />
      </ExampleSection>
      <ExampleSection title='Standalone' description='Inline in a card: a filterable list without a popup.' bare>
        <CommandStandalone />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <CommandDefault />, play: open('click', /Suchen/, 'Mitglied einladen') };
export const Grouped: Story = { render: () => <CommandGrouped /> };
export const Standalone: Story = { render: () => <CommandStandalone /> };
