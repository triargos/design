import { ParentApp } from '../examples/patterns/parent-app/app';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Parent App',
  description: 'A whole phone app for parents: every tab and both sheets, in the contrast style.',
  group: 'Patterns',
  Page: () => (
    <FoundationPage
      title='Parent App'
      description='A whole phone app for parents, built from components and roles only: Today, Absences, Messages, Documents, Family, the announcements and two drawers (reporting a child sick, the profile). Tap through it: "Back to school" on Today shows the screen with nobody absent, and the Quiet day switch shows Today with nothing open (no note to upload, no unread message, no new announcement).'>
      <ExampleSection
        title='App'
        description={
          <>
            <Code>SIZING_STYLES.contrast</Code> with Bricolage Grotesque in <Code>--font-display</Code>: plain cards,
            flat controls, an inverse lead card and an inverse <Code>BottomNavList labels='current'</Code>.
          </>
        }
        bare>
        <ParentApp />
      </ExampleSection>
    </FoundationPage>
  ),
});
