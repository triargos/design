import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { Item, ItemContent, ItemDescription, ItemFooter, ItemHeader, ItemList, ItemTitle } from '~/components/ui/item';

/** `ItemHeader` and `ItemFooter` span the full width. */
export function ItemHeaderAndFooter() {
  return (
    <InsetCard className='w-full max-w-xl'>
      <InsetCardHeader>
        <InsetCardTitle>Review requests</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='overflow-hidden'>
        <ItemList>
          <Item>
            <ItemHeader>
              <span className='text-caption text-muted-foreground'>Requested on March 12</span>
              <Badge intent='warning'>Pending</Badge>
            </ItemHeader>
            <ItemContent>
              <ItemTitle>Homepage copy · Website redesign</ItemTitle>
              <ItemDescription>Waiting for a second reviewer.</ItemDescription>
            </ItemContent>
            <ItemFooter>
              <span className='text-caption text-muted-foreground'>1 of 2 approvals</span>
              <Button size='xs'>Remind</Button>
            </ItemFooter>
          </Item>
        </ItemList>
      </InsetCardContent>
    </InsetCard>
  );
}
