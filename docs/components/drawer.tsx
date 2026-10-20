import { DrawerDefault } from '../examples/drawer/default';
import { DrawerNested } from '../examples/drawer/nested';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Drawer',
  description: 'A bottom sheet for touch, swiped down to close.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Drawer'
      description='A bottom sheet for touch menus and short tasks, swiped down to close; DrawerClose closes it from a button. Under DrawerProvider the page scales back; a drawer opened from a drawer stacks on it.'>
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
});
