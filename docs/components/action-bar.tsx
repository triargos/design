import { ActionBarDefault } from '../examples/action-bar/default';
import { ActionBarStatus } from '../examples/action-bar/status';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Action Bar',
  description: 'A floating toolbar for what is selected or unsaved.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Action Bar'
      description='A floating toolbar on the inverse surface, sticky under the content while something is selected or unsaved. On a phone it docks in the BottomNav. Keep it mounted so it animates out.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>open</Code> while rows are selected: the count and a clear button, a hairline, then the actions.
          </>
        }>
        <ActionBarDefault />
      </ExampleSection>
      <ExampleSection
        title='Status'
        description={
          <>
            <Code>status</Code> replaces the actions once they ran ("Saved"), then close the bar. <Code>priority</Code>{' '}
            picks the bar that shows when two are open under a <Code>BottomNavProvider</Code>.
          </>
        }>
        <ActionBarStatus />
      </ExampleSection>
    </FoundationPage>
  ),
});
