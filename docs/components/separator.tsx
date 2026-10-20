import { SeparatorDefault } from '../examples/separator/default';
import { SeparatorVertical } from '../examples/separator/vertical';
import { ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Separator',
  description: 'A hairline between groups.',
  group: 'Components',
  Page: () => (
    <FoundationPage title='Separator' description='A hairline between groups.'>
      <ExampleSection title='Default'>
        <SeparatorDefault />
      </ExampleSection>
      <ExampleSection title='Vertical'>
        <SeparatorVertical />
      </ExampleSection>
    </FoundationPage>
  ),
});
