import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { Item, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';

/** `data-selected` and `data-targeted` (keyboard selection, use-selectable) take a quiet fill. */
export function ItemSelected() {
  return (
    <InsetCard className='w-full max-w-xl'>
      <InsetCardHeader>
        <InsetCardTitle>Mitglieder</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='overflow-hidden'>
        <ItemList>
          <Item data-selected>
            <ItemContent>
              <ItemTitle>Erika Mustermann</ItemTitle>
              <ItemDescription>Ausgewählt</ItemDescription>
            </ItemContent>
          </Item>
          <Item data-targeted>
            <ItemContent>
              <ItemTitle>Max Mustermann</ItemTitle>
              <ItemDescription>Mit der Tastatur angesteuert</ItemDescription>
            </ItemContent>
          </Item>
          <Item>
            <ItemContent>
              <ItemTitle>Lea Schmidt</ItemTitle>
            </ItemContent>
          </Item>
        </ItemList>
      </InsetCardContent>
    </InsetCard>
  );
}
