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
      description='A list of actions opened from a button: an icon, a label, a shortcut. A destructive item takes intent="destructive" and sits last. To open a dialog from an item, see Dialog › Opened from a menu.'>
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
      <ExampleSection title='Checkbox' description='Toggles that stay in the menu.'>
        <DropdownMenuCheckbox />
      </ExampleSection>
      <ExampleSection title='Radio group' description='One of a few, chosen in the menu.'>
        <DropdownMenuRadioGroupExample />
      </ExampleSection>
      <ExampleSection
        title='Submenu'
        description='A row with a chevron opens a second list beside the first; one level only. On touch it opens in place.'>
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
  play: open('click', 'Aktionen', 'Antrag 2024-118'),
};
export const Shortcuts: Story = { render: () => <DropdownMenuShortcuts />, play: open('click', 'Aktionen', '⌘D') };
export const Checkbox: Story = {
  render: () => <DropdownMenuCheckbox />,
  play: open('click', 'Spalten', 'Sichtbare Spalten'),
};
export const RadioGroup: Story = {
  name: 'Radio group',
  render: () => <DropdownMenuRadioGroupExample />,
  play: open('click', 'Sortieren', 'Sortieren nach'),
};
export const Submenu: Story = {
  render: () => <DropdownMenuSubmenu />,
  play: clickThrough(
    { click: 'Aktionen', shows: 'Status ändern' },
    { click: 'Status ändern', role: 'menuitem', shows: 'In Prüfung' },
  ),
};
export const DestructiveItem: Story = {
  name: 'Destructive item',
  render: () => <DropdownMenuDestructiveItem />,
  play: open('click', 'Aktionen', 'Löschen'),
};
