import { ChevronRightIcon } from 'lucide-react';

import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { Item, ItemActions, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';

/** `render={<a />}`, or a router link: the row highlights on hover. */
export function ItemLink() {
  return (
    <InsetCard className='w-full max-w-xl'>
      <InsetCardHeader>
        <InsetCardTitle>Projects</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='overflow-hidden'>
        <ItemList>
          <Item render={<a href='#website-redesign' />}>
            <ItemContent>
              <ItemTitle>Website redesign</ItemTitle>
              <ItemDescription>3 open tasks</ItemDescription>
            </ItemContent>
            <ItemActions>
              <ChevronRightIcon className='size-4 text-faint-foreground' />
            </ItemActions>
          </Item>
          <Item render={<a href='#mobile-app' />}>
            <ItemContent>
              <ItemTitle>Mobile app</ItemTitle>
              <ItemDescription>No open tasks</ItemDescription>
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
