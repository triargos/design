import { BackLink } from '~/components/ui/back-link';

import { BackLinkDefault } from '../examples/back-link/default';
import { Code, ExampleSection, FoundationPage, FoundationSection, Matrix, StateCell } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

const STATES = ['rest', 'hover', 'focus'] as const;

export default defineDocs({
  title: 'Back Link',
  description: 'A link up to the parent page, above the page title.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Back Link'
      description='A link up to the parent page, above the page title. One level up; a deeper path is a Breadcrumb.'>
      <ExampleSection
        title='Default'
        description={
          <>
            The label names the parent page. The chevron hangs left of the column, so the label starts on the title’s
            edge. It renders <Code>render</Code>, else the <Code>LinkProvider</Code> link, else an <Code>a</Code>.
          </>
        }>
        <BackLinkDefault />
      </ExampleSection>

      <FoundationSection
        title='States'
        description='Forced here. Muted at rest, foreground on hover, the focus ring on the keyboard. 24px tall; 44px to a finger.'>
        <Matrix
          columnWidth='9rem'
          columns={STATES}
          rows={[
            {
              name: 'link',
              cells: STATES.map((state) => (
                <StateCell key={state} state={state}>
                  <div className='ps-group'>
                    <BackLink href='#projects'>Projects</BackLink>
                  </div>
                </StateCell>
              )),
            },
          ]}
        />
      </FoundationSection>
    </FoundationPage>
  ),
});
