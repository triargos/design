import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { Item, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';

export function ItemWithDescription() {
  return (
    <InsetCard className='w-full max-w-xl'>
      <InsetCardHeader>
        <InsetCardTitle>Members</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='overflow-hidden'>
        <ItemList>
          <Item>
            <ItemContent>
              <ItemTitle>Jordan Lee</ItemTitle>
              <ItemDescription>jordan@acme.com</ItemDescription>
            </ItemContent>
          </Item>
          <Item>
            <ItemContent>
              <ItemTitle>Sam Rivera</ItemTitle>
              <ItemDescription>sam@acme.com</ItemDescription>
            </ItemContent>
          </Item>
        </ItemList>
      </InsetCardContent>
    </InsetCard>
  );
}
