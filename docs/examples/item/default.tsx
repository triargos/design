import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { Item, ItemContent, ItemList, ItemTitle } from '~/components/ui/item';

/** A row in a list. Lists sit flush in a card, a hairline between rows that stops at the row padding. */
export function ItemDefault() {
  return (
    <InsetCard className='w-full max-w-xl'>
      <InsetCardHeader>
        <InsetCardTitle>Projects</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='overflow-hidden'>
        <ItemList>
          <Item>
            <ItemContent>
              <ItemTitle>Website redesign</ItemTitle>
            </ItemContent>
          </Item>
          <Item>
            <ItemContent>
              <ItemTitle>Mobile app</ItemTitle>
            </ItemContent>
          </Item>
        </ItemList>
      </InsetCardContent>
    </InsetCard>
  );
}
