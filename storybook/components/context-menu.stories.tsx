import type { Meta, StoryObj } from '@storybook/react-vite';

import { ContextMenuCheckbox } from '../examples/context-menu/checkbox';
import { ContextMenuDefault } from '../examples/context-menu/default';
import { ContextMenuDestructiveItem } from '../examples/context-menu/destructive-item';
import { ContextMenuGrouped } from '../examples/context-menu/grouped';
import { ContextMenuRadioGroupExample } from '../examples/context-menu/radio-group';
import { ContextMenuSubmenu } from '../examples/context-menu/submenu';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { rightClick } from '../kit/play';

const meta = {
  title: 'Components/Context Menu',
  parameters: { description: 'A menu opened with a right click where the pointer is.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Context Menu'
      description='The dropdown menu, opened with a right click (long press on touch) where the pointer is. Only ever a shortcut: every action is reachable another way.'>
      <ExampleSection title='Default' description='Right-click the area.'>
        <ContextMenuDefault />
      </ExampleSection>
      <ExampleSection
        title='Grouped'
        description={
          <>
            <Code>ContextMenuGroup · ContextMenuLabel</Code>
          </>
        }>
        <ContextMenuGrouped />
      </ExampleSection>
      <ExampleSection title='Submenu'>
        <ContextMenuSubmenu />
      </ExampleSection>
      <ExampleSection title='Checkbox'>
        <ContextMenuCheckbox />
      </ExampleSection>
      <ExampleSection title='Radio group'>
        <ContextMenuRadioGroupExample />
      </ExampleSection>
      <ExampleSection title='Destructive item'>
        <ContextMenuDestructiveItem />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = {
  render: () => <ContextMenuDefault />,
  play: rightClick('Rechtsklick auf die Datei', 'Umbenennen'),
};
export const Grouped: Story = {
  render: () => <ContextMenuGrouped />,
  play: rightClick('Rechtsklick auf die Datei', 'Teilen'),
};
export const Submenu: Story = {
  render: () => <ContextMenuSubmenu />,
  play: rightClick('Rechtsklick auf die Datei', 'Verschieben nach'),
};
export const Checkbox: Story = {
  render: () => <ContextMenuCheckbox />,
  play: rightClick('Rechtsklick auf die Datei', 'Sichtbar für'),
};
export const RadioGroup: Story = {
  name: 'Radio group',
  render: () => <ContextMenuRadioGroupExample />,
  play: rightClick('Rechtsklick auf die Datei', 'Ansicht'),
};
export const DestructiveItem: Story = {
  name: 'Destructive item',
  render: () => <ContextMenuDestructiveItem />,
  play: rightClick('Rechtsklick auf die Datei', 'Löschen'),
};
