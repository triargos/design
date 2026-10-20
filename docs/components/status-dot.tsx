import { StatusDotVariants } from '../examples/status-dot/variants';
import { StatusDotWithLabel } from '../examples/status-dot/with-label';
import { ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Status Dot',
  description: 'A state as a dot in its intent’s hue, next to a label that names it.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Status Dot'
      description='The intent’s hue as a dot, only next to a label that names the state: in dense rows, legends and stats. The dot alone is decorative.'>
      <ExampleSection title='Variants'>
        <StatusDotVariants />
      </ExampleSection>
      <ExampleSection title='With label' description='In a dense row, where a badge would be too loud.'>
        <StatusDotWithLabel />
      </ExampleSection>
    </FoundationPage>
  ),
});
