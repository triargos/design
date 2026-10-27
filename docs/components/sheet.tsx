import { SheetBottom } from '../examples/sheet/bottom';
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
      <ExampleSection
        title='Bottom, with pages'
        description={
          <>
            <Code>side='bottom'</Code>: a menu on a phone, floating 8px in, springing up (
            <Code>duration-sheet ease-spring</Code>). Drag its top down to dismiss. <Code>SheetStack</Code> holds{' '}
            <Code>SheetPage</Code>s: <Code>SheetMenuItem push</Code> morphs to the next one: its rows blur out, the next
            page's cascade in from the side, the sheet springs to its height. The page's back button pops it; on open
            the rows rise in. <Code>SheetMenuGroup</Code>s part with a hairline; <Code>SheetOption</Code> is a choice
            with a check. <Code>useSheetStack()</Code> pushes from code.
          </>
        }>
        <SheetBottom />
      </ExampleSection>
    </FoundationPage>
  ),
});
