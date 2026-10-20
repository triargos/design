import { SidebarCollapsed } from '../examples/sidebar/collapsed';
import { SidebarDefault } from '../examples/sidebar/default';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Sidebar',
  description: 'The app navigation: the sidebar on the shell, the page panel beside it.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Sidebar'
      description='The app navigation: the sidebar on the shell, the page panel beside it.'>
      <ExampleSection title='Default' bare>
        <SidebarDefault />
      </ExampleSection>
      <ExampleSection
        title='Collapsed'
        description={
          <>
            <Code>collapsible='icon'</Code>, closed: icons only. The trigger toggles it; ⌘[ toggles the app's own
            sidebar.
          </>
        }
        bare>
        <SidebarCollapsed />
      </ExampleSection>
    </FoundationPage>
  ),
});
