import { TableDefault } from '../examples/table/default';
import { TableEmpty } from '../examples/table/empty';
import { TableFlush } from '../examples/table/flush';
import { TableGroupedRows } from '../examples/table/grouped-rows';
import { TableInACard } from '../examples/table/in-a-card';
import { TableRowLinks } from '../examples/table/row-links';
import { TableSortable } from '../examples/table/sortable';
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
            <Code>variant='card'</Code> straight in an Card, in place of CardContent: header and footer rows sit on the
            shell, the body is the card.
          </>
        }
        bare>
        <TableInACard />
      </ExampleSection>
      <ExampleSection
        title='With header'
        description='CardHeader above the table; no footer, so the shell shows as a 4px rim below the body.'
        bare>
        <TableWithHeader />
      </ExampleSection>
      <ExampleSection
        title='Flush'
        description={
          <>
            <Code>variant='flush'</Code> inside CardContent with overflow-hidden: the header row sits in the card; first
            and last column on the card title’s edge.
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
      <ExampleSection
        title='Sortable columns'
        description={
          <>
            <Code>TableHead sort onSort</Code>: a button in the header, <Code>aria-sort</Code> on the cell. The call
            site sorts.
          </>
        }
        bare>
        <TableSortable />
      </ExampleSection>
      <ExampleSection
        title='Grouped rows'
        description={
          <>
            <Code>TableGroupRow colSpan</Code> names the rows after it; <Code>open</Code> + <Code>onOpenChange</Code>{' '}
            fold them.
          </>
        }
        bare>
        <TableGroupedRows />
      </ExampleSection>
      <ExampleSection
        title='Row links'
        description={
          <>
            <Code>TableRowLink</Code> in one cell: its click area covers the row; the row’s other controls sit above it.
          </>
        }
        bare>
        <TableRowLinks />
      </ExampleSection>
      <ExampleSection title='Empty' description='One cell over every column holds an Empty.' bare>
        <TableEmpty />
      </ExampleSection>
    </FoundationPage>
  ),
});
