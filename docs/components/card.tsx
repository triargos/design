import { CardDefault } from '../examples/card/default';
import { CardDestructive } from '../examples/card/destructive';
import { CardEmpty } from '../examples/card/empty';
import { CardNoHeader } from '../examples/card/no-header';
import { CardStacked } from '../examples/card/stacked';
import { CardWithActions } from '../examples/card/with-actions';
import { CardWithDescription } from '../examples/card/with-description';
import { CardShell } from '../examples/card/shell';
import { CardWithFooter } from '../examples/card/with-footer';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Card',
  description: 'The content block: a titled card, or a framed one.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Card'
      description='The content block. One markup, two looks: a plain card sets its header above the surface as the block’s title; variant="shell" frames the content, the header a label strip inside the frame.'>
      <ExampleSection
        title='Default'
        description='The header sits above the card, on the text edge of what is inside it.'
        bare>
        <CardDefault />
      </ExampleSection>
      <ExampleSection title='With description' description='One sentence under the title.' bare>
        <CardWithDescription />
      </ExampleSection>
      <ExampleSection
        title='With actions'
        description='Header actions are raised sm / icon-sm buttons; an action and its overflow menu join in a ButtonGroup. Row actions inside the list stay ghost. Both end on one column. A flush ItemList: CardContent with overflow-hidden.'
        bare>
        <CardWithActions />
      </ExampleSection>
      <ExampleSection title='No header' description='Content alone.' bare>
        <CardNoHeader />
      </ExampleSection>
      <ExampleSection
        title='With footer'
        description={
          <>
            <Code>CardFooter show</Code> while the form is dirty; type to show it again.
          </>
        }
        bare>
        <CardWithFooter />
      </ExampleSection>
      <ExampleSection
        title='Shell'
        description={
          <>
            <Code>variant='shell'</Code>: the content framed in a tinted shell, the header a one-line label strip on it.
            Keep descriptions to one sentence; long copy makes the shell read as a gray block.
          </>
        }
        bare>
        <CardShell />
      </ExampleSection>
      <ExampleSection title='Stacked' description='Peer cards sit one group step apart, in a stack or in columns.' bare>
        <CardStacked />
      </ExampleSection>
      <ExampleSection
        title='Destructive'
        description={
          <>
            <Code>intent='destructive'</Code> marks only the title. The action row stacks below sm, the button full
            width.
          </>
        }
        bare>
        <CardDestructive />
      </ExampleSection>
      <ExampleSection
        title='Empty'
        description={
          <>
            <Code>Empty size='sm'</Code> in the content.
          </>
        }
        bare>
        <CardEmpty />
      </ExampleSection>
    </FoundationPage>
  ),
});
