import { TableDefault } from '../examples/table/default';
import { TableEmpty } from '../examples/table/empty';
import { TableFlush } from '../examples/table/flush';
import { TableInACard } from '../examples/table/in-a-card';
import { TableWithHeader } from '../examples/table/with-header';
import { TableWithSelection } from '../examples/table/with-selection';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Table',
  description: 'Rows of records with shared columns.',
  group: 'Components',
  Page: () => (
    <FoundationPage title='Table' description='Rows of records with shared columns.'>
      <ExampleSection title='Default' description='A plain table, rows separated by hairlines.'>
        <TableDefault />
      </ExampleSection>
      <ExampleSection
        title='In a card'
        description={
          <>
            <Code>variant='card'</Code> straight in an InsetCard, in place of InsetCardContent: header and footer rows
            sit on the shell, the body is the card.
          </>
        }
        bare>
        <TableInACard />
      </ExampleSection>
      <ExampleSection
        title='With header'
        description='InsetCardHeader above the table; no footer, so the shell shows as a 4px rim below the body.'
        bare>
        <TableWithHeader />
      </ExampleSection>
      <ExampleSection
        title='Flush'
        description={
          <>
            <Code>variant='flush'</Code> inside InsetCardContent with overflow-hidden: the header row sits in the card;
            first and last column on the card title’s edge.
          </>
        }
        bare>
        <TableFlush />
      </ExampleSection>
      <ExampleSection
        title='With selection'
        description={
          <>
            TanStack <Code>useTable</Code> with <Code>rowSelectionFeature</Code>; a selected row is{' '}
            <Code>selected</Code>.
          </>
        }
        bare>
        <TableWithSelection />
      </ExampleSection>
      <ExampleSection title='Empty' description='One cell over every column holds an EmptyState.' bare>
        <TableEmpty />
      </ExampleSection>
    </FoundationPage>
  ),
});
