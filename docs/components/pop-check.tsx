import { PopCheckDefault } from '../examples/pop-check/default';
import { ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Pop Check',
  description: 'A check that pops in and draws its stroke.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Pop Check'
      description='A check that pops in tilted, past full size, and draws its stroke; render it as a keyed child of AnimatePresence. CopyButton and Checkbox use it. Reduced motion: a cross-fade.'>
      <ExampleSection title='Default' description='Replay with the button.'>
        <PopCheckDefault />
      </ExampleSection>
    </FoundationPage>
  ),
});
