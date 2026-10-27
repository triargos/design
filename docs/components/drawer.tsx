import { DrawerAccountMenu } from '../examples/drawer/account-menu';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Drawer',
  description: 'A menu on a phone: a bottom sheet you swipe away, with pages.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Drawer'
      description="A menu on a phone: floating 8px in from the bottom, springing up (duration-drawer ease-spring), swiped down to dismiss. Base UI's Drawer: a scrolled page scrolls back first, a flick leaves faster than a slow drag. For a task next to the page, use a Sheet.">
      <ExampleSection
        title='Account menu, with pages'
        description={
          <>
            <Code>DrawerStack</Code> holds <Code>DrawerPage</Code>s: <Code>DrawerMenuItem push</Code> morphs to the next
            one: its rows blur out, the next page's cascade in from the side, the drawer springs to its height. The
            page's back button pops it; on open the rows rise in. <Code>DrawerMenuGroup</Code>s part with a hairline;{' '}
            <Code>DrawerOption</Code> is a choice with a check. <Code>useDrawerStack()</Code> pushes from code.
          </>
        }>
        <DrawerAccountMenu />
      </ExampleSection>
    </FoundationPage>
  ),
});
