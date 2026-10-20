import { DropdownMenuCheckbox } from '../examples/dropdown-menu/checkbox';
import { DropdownMenuDefault } from '../examples/dropdown-menu/default';
import { DropdownMenuDestructiveItem } from '../examples/dropdown-menu/destructive-item';
import { DropdownMenuRadioGroupExample } from '../examples/dropdown-menu/radio-group';
import { DropdownMenuShortcuts } from '../examples/dropdown-menu/shortcuts';
import { DropdownMenuSubmenu } from '../examples/dropdown-menu/submenu';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Dropdown Menu',
  description: 'A list of actions opened from a button.',
  group: 'Components',
  Page: () => (
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
      <ExampleSection title='Checkbox' description='Toggles in the menu, controlled.'>
        <DropdownMenuCheckbox />
      </ExampleSection>
      <ExampleSection title='Radio group' description='One of a few, chosen in the menu.'>
        <DropdownMenuRadioGroupExample />
      </ExampleSection>
      <ExampleSection
        title='Submenu'
        description='A row with a chevron opens a second list beside the first; one level only.'>
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
});
