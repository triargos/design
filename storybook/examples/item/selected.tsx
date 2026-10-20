import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { Item, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';

/** A `selected` row takes a quiet fill. */
export function ItemSelected() {
  return (
    <InsetCard className='w-full max-w-xl'>
      <InsetCardHeader>
        <InsetCardTitle>Members</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='overflow-hidden'>
        <ItemList>
          <Item selected>
            <ItemContent>
              <ItemTitle>Jordan Lee</ItemTitle>
              <ItemDescription>Selected</ItemDescription>
            </ItemContent>
          </Item>
          <Item>
            <ItemContent>
              <ItemTitle>Sam Rivera</ItemTitle>
            </ItemContent>
          </Item>
          <Item>
            <ItemContent>
              <ItemTitle>Priya Patel</ItemTitle>
            </ItemContent>
          </Item>
        </ItemList>
      </InsetCardContent>
    </InsetCard>
  );
}
