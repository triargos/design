import { BottomNavDefault } from '../examples/bottom-nav/default';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Bottom Nav',
  description: 'The app navigation on a phone: a floating pill of icon tabs and the main action.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Bottom Nav'
      description='The app navigation on a phone: a floating pill of 3–5 icon tabs and the main action beside it, hidden from md up where the Sidebar takes over.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>BottomNavList</Code> holds a <Code>BottomNavLink current</Code> per page and a{' '}
            <Code>BottomNavButton</Code> for "More": a menu with the rest, or{' '}
            <Code>onClick=&#123;toggleSidebar&#125;</Code> (<Code>useSidebar</Code>) for the sidebar sheet.{' '}
            <Code>BottomNavAction</Code> is the main action. Labels are for screen readers; a count is a{' '}
            <Code>Badge</Code> in the tab.
          </>
        }
        bare>
        <BottomNavDefault />
      </ExampleSection>
    </FoundationPage>
  ),
});
