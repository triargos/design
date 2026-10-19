import { ChevronRightIcon } from 'lucide-react';

import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { Item, ItemActions, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';

/** `render={<a />}` (a router Link in the app): the row highlights on hover. */
export function ItemLink() {
  return (
    <InsetCard className='w-full max-w-xl'>
      <InsetCardHeader>
        <InsetCardTitle>Anträge</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='overflow-hidden'>
        <ItemList>
          <Item render={<a href='#nachmittagsbetreuung' />}>
            <ItemContent>
              <ItemTitle>Nachmittagsbetreuung</ItemTitle>
              <ItemDescription>3 offene Anträge</ItemDescription>
            </ItemContent>
            <ItemActions>
              <ChevronRightIcon className='size-4 text-faint-foreground' />
            </ItemActions>
          </Item>
          <Item render={<a href='#ferienbetreuung' />}>
            <ItemContent>
              <ItemTitle>Ferienbetreuung</ItemTitle>
              <ItemDescription>Keine offenen Anträge</ItemDescription>
            </ItemContent>
            <ItemActions>
              <ChevronRightIcon className='size-4 text-faint-foreground' />
            </ItemActions>
          </Item>
        </ItemList>
      </InsetCardContent>
    </InsetCard>
  );
}
