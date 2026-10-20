import { ItemDefault } from '../examples/item/default';
import { ItemHeaderAndFooter } from '../examples/item/header-and-footer';
import { ItemLink } from '../examples/item/link';
import { ItemLoadingMore } from '../examples/item/loading-more';
import { ItemLongTitles } from '../examples/item/long-titles';
import { ItemSelected } from '../examples/item/selected';
import { ItemVirtualized } from '../examples/item/virtualized';
import { ItemWithActions } from '../examples/item/with-actions';
import { ItemWithDescription } from '../examples/item/with-description';
import { ItemWithMedia } from '../examples/item/with-media';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Item',
  description: 'A row in a list: media, title and description, actions.',
  group: 'Components',
  Page: () => (
    <FoundationPage title='Item' description='A row in a list: media, title and description, actions.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>ItemContent · ItemTitle</Code> in an <Code>ItemList</Code>, in a card.
          </>
        }
        bare>
        <ItemDefault />
      </ExampleSection>
      <ExampleSection title='With description' bare>
        <ItemWithDescription />
      </ExampleSection>
      <ExampleSection
        title='With media'
        description={
          <>
            <Code>ItemMedia variant='icon'</Code>; an Avatar for people.
          </>
        }
        bare>
        <ItemWithMedia />
      </ExampleSection>
      <ExampleSection title='With actions' description='A status and a ghost menu button on the right.' bare>
        <ItemWithActions />
      </ExampleSection>
      <ExampleSection
        title='Long titles'
        description={
          <>
            One line, then an ellipsis. Beside a badge or an icon, the text goes in a <Code>span</Code>.
          </>
        }
        bare>
        <ItemLongTitles />
      </ExampleSection>
      <ExampleSection
        title='Header and footer'
        description={
          <>
            <Code>ItemHeader</Code> and <Code>ItemFooter</Code> span the full width.
          </>
        }
        bare>
        <ItemHeaderAndFooter />
      </ExampleSection>
      <ExampleSection
        title='Link'
        description={
          <>
            <Code>{'render={<a />}'}</Code>, or a router link: the row highlights on hover and ends in an{' '}
            <Code>ItemChevron</Code>, which nudges right.
          </>
        }
        bare>
        <ItemLink />
      </ExampleSection>
      <ExampleSection
        title='Selected'
        description={
          <>
            A <Code>selected</Code> row takes a quiet fill.
          </>
        }
        bare>
        <ItemSelected />
      </ExampleSection>
      <ExampleSection
        title='Virtualized'
        description={
          <>
            <Code>ItemList virtualized items itemKey</Code>: 1,000 rows, only those in view render. Give it a height.
          </>
        }
        bare>
        <ItemVirtualized />
      </ExampleSection>
      <ExampleSection
        title='Loading more'
        description={
          <>
            <Code>hasMore</Code> + <Code>onLoadMore</Code>; <Code>isLoadingMore</Code> shows a spinner. Scroll down.
          </>
        }
        bare>
        <ItemLoadingMore />
      </ExampleSection>
    </FoundationPage>
  ),
});
