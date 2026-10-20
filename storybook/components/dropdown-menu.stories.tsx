import type { Meta, StoryObj } from '@storybook/react-vite';

import { DropdownMenuCheckbox } from '../examples/dropdown-menu/checkbox';
import { DropdownMenuDefault } from '../examples/dropdown-menu/default';
import { DropdownMenuDestructiveItem } from '../examples/dropdown-menu/destructive-item';
import { DropdownMenuRadioGroupExample } from '../examples/dropdown-menu/radio-group';
import { DropdownMenuShortcuts } from '../examples/dropdown-menu/shortcuts';
import { DropdownMenuSubmenu } from '../examples/dropdown-menu/submenu';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { open, clickThrough } from '../kit/play';

const meta = {
  title: 'Components/Dropdown Menu',
  parameters: { description: 'A list of actions opened from a button.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Dropdown Menu'
      description='A list of actions opened from a button: an icon, a label, a shortcut. A destructive item takes intent="destructive" and sits last. Below 768px the same parts open as a bottom drawer of large rows; a submenu stacks a second drawer. To open a dialog from an item, see Dialog › Opened from a menu.'>
      <ExampleSection title='Default'>
        <DropdownMenuDefault />
      </ExampleSection>
      <ExampleSection
        title='Shortcuts'
        description={
          <>
            <Code>DropdownMenuShortcut</Code>
          </>
        }>
        <DropdownMenuShortcuts />
      </ExampleSection>
      <ExampleSection title='Checkbox' description='Toggles in the menu, controlled.'>
        <DropdownMenuCheckbox />
      </ExampleSection>
      <ExampleSection title='Radio group' description='One of a few, chosen in the menu.'>
        <DropdownMenuRadioGroupExample />
      </ExampleSection>
      <ExampleSection
        title='Submenu'
        description='A row with a chevron opens a second list beside the first; one level only. On touch it stacks a second drawer.'>
        <DropdownMenuSubmenu />
      </ExampleSection>
      <ExampleSection
        title='Destructive item'
        description={
          <>
            <Code>intent='destructive'</Code>, last, after a separator.
          </>
        }>
        <DropdownMenuDestructiveItem />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = {
  render: () => <DropdownMenuDefault />,
  play: open('click', 'Actions', 'Website redesign'),
};
export const Shortcuts: Story = { render: () => <DropdownMenuShortcuts />, play: open('click', 'Actions', '⌘D') };
export const Checkbox: Story = {
  render: () => <DropdownMenuCheckbox />,
  play: open('click', 'Columns', 'Visible columns'),
};
export const RadioGroup: Story = {
  name: 'Radio group',
  render: () => <DropdownMenuRadioGroupExample />,
  play: open('click', 'Sort', 'Sort by'),
};
export const Submenu: Story = {
  render: () => <DropdownMenuSubmenu />,
  play: clickThrough(
    { click: 'Actions', shows: 'Change status' },
    { click: 'Change status', role: 'menuitem', shows: 'In progress' },
  ),
};
export const DestructiveItem: Story = {
  name: 'Destructive item',
  render: () => <DropdownMenuDestructiveItem />,
  play: open('click', 'Actions', 'Delete'),
};
