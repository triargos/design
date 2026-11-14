import { CardDefault } from '../examples/card/default';
import { CardDestructive } from '../examples/card/destructive';
import { CardEmphasis } from '../examples/card/emphasis';
import { CardEmpty } from '../examples/card/empty';
import { CardNoHeader } from '../examples/card/no-header';
import { CardPlain } from '../examples/card/plain';
import { CardStacked } from '../examples/card/stacked';
import { CardStretched } from '../examples/card/stretched';
import { CardWithActions } from '../examples/card/with-actions';
import { CardWithDescription } from '../examples/card/with-description';
import { CardWithFooter } from '../examples/card/with-footer';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Card',
  description: 'The content block: a tinted shell with a title band, or a plain card titled above.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Card'
      description='The content block. One markup, two looks: by default a tinted shell, the header a title band inside it and the content a panel below it; variant="plain" sets the header above the surface as the block’s title.'>
      <ExampleSection
        title='Default'
        description='A tinted shell around the content, the header a title band on the tint. Keep descriptions to one sentence; long copy makes the shell read as a gray block.'
        bare>
        <CardDefault />
      </ExampleSection>
      <ExampleSection title='With description' description='One sentence under the title.' bare>
        <CardWithDescription />
      </ExampleSection>
      <ExampleSection
        title='With actions'
        description='Header actions are raised sm / icon-sm buttons; an action and its overflow menu join in a ButtonGroup. Row actions inside the list stay ghost. Both end on one column. A list goes straight in CardContent, no class.'
        bare>
        <CardWithActions />
      </ExampleSection>
      <ExampleSection title='No header' description='Content alone: without a header a shell draws no tint.' bare>
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
        title='Plain'
        description={
          <>
            <Code>variant='plain'</Code>, the exception: the header sits above the card, on the page, as a section
            heading, on the text edge of what is inside it; the footer a muted band under a rule. A shell around a table
            sets its header the same way, since the column row is its band.
          </>
        }
        bare>
        <CardPlain />
      </ExampleSection>
      <ExampleSection title='Stacked' description='Peer cards sit one group step apart, in a stack or in columns.' bare>
        <CardStacked />
      </ExampleSection>
      <ExampleSection
        title='Destructive'
        description={
          <>
            <Code>intent='destructive'</Code> colors the title; the shell stays neutral. The action row stacks below sm,
            the button full width.
          </>
        }
        bare>
        <CardDestructive />
      </ExampleSection>
      <ExampleSection
        title='Emphasis'
        description={
          <>
            <Code>intent</Code> colors the title (<Code>destructive</Code>, <Code>warning</Code>);{' '}
            <Code>emphasis='subtle'</Code> tints the shell in it too. A list goes straight in the content: the card
            clips its rows to the corners.
          </>
        }
        bare>
        <CardEmphasis />
      </ExampleSection>
      <ExampleSection
        title='Stretched'
        description='Cards in a grid row take its height: the content grows, the header keeps its own. No class on the card.'
        bare>
        <CardStretched />
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
