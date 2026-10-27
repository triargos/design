import { SheetDefault } from '../examples/sheet/default';
import { SheetDirections } from '../examples/sheet/directions';
import { SheetSizes } from '../examples/sheet/sizes';
import { SheetWithoutCloseButton } from '../examples/sheet/without-close-button';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Sheet',
  description: 'A side panel: the dialog surface at full height.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Sheet'
      description='A side panel: the dialog surface at full height, for a task next to the page. SheetBody scrolls; from sm the panel floats 8px in.'>
      <ExampleSection title='Default'>
        <SheetDefault />
      </ExampleSection>
      <ExampleSection
        title='Sizes'
        description={
          <>
            <Code>size</Code>: <Code>default</Code> 24rem · <Code>lg</Code> 28rem from <Code>sm</Code> up.
          </>
        }>
        <SheetSizes />
      </ExampleSection>
      <ExampleSection
        title='Without close button'
        description={
          <>
            <Code>showCloseButton={'{false}'}</Code>: no ✕, the footer action closes it.
          </>
        }>
        <SheetWithoutCloseButton />
      </ExampleSection>
      <ExampleSection
        title='Directions'
        description={
          <>
            <Code>side='right'</Code> (the default) or <Code>'left'</Code>.
          </>
        }>
        <SheetDirections />
      </ExampleSection>
    </FoundationPage>
  ),
});
