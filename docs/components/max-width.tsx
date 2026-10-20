import { MaxWidthSizes } from '../examples/max-width/sizes';
import { ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Max Width',
  description: 'Caps the page column and centers it.',
  group: 'Components',
  Page: () => (
    <FoundationPage title='Max Width' description='Caps the page column and centers it; pick the size by content.'>
      <ExampleSection title='Sizes' bare>
        <MaxWidthSizes />
      </ExampleSection>
    </FoundationPage>
  ),
});
