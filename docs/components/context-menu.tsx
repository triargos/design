import { ContextMenuCheckbox } from '../examples/context-menu/checkbox';
import { ContextMenuDefault } from '../examples/context-menu/default';
import { ContextMenuDestructiveItem } from '../examples/context-menu/destructive-item';
import { ContextMenuGrouped } from '../examples/context-menu/grouped';
import { ContextMenuRadioGroupExample } from '../examples/context-menu/radio-group';
import { ContextMenuSubmenu } from '../examples/context-menu/submenu';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Context Menu',
  description: 'A menu opened with a right click where the pointer is.',
  group: 'Components',
  Page: () => (
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
});
