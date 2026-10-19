import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { Item, ItemContent, ItemDescription, ItemFooter, ItemHeader, ItemList, ItemTitle } from '~/components/ui/item';

/** `ItemHeader` and `ItemFooter` span the full width. */
export function ItemHeaderAndFooter() {
  return (
    <InsetCard className='w-full max-w-xl'>
      <InsetCardHeader>
        <InsetCardTitle>Antrag 2024-118</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='overflow-hidden'>
        <ItemList>
          <Item>
            <ItemHeader>
              <span className='text-caption text-muted-foreground'>Eingereicht am 12. März</span>
              <Badge intent='warning'>Ausstehend</Badge>
            </ItemHeader>
            <ItemContent>
              <ItemTitle>Mia Schmidt · Einschulung 2025</ItemTitle>
              <ItemDescription>Geburtsurkunde fehlt noch.</ItemDescription>
            </ItemContent>
            <ItemFooter>
              <span className='text-caption text-muted-foreground'>2 von 3 Unterlagen</span>
              <Button type='button' size='xs' intent='neutral' emphasis='raised'>
                Erinnern
              </Button>
            </ItemFooter>
          </Item>
        </ItemList>
      </InsetCardContent>
    </InsetCard>
  );
}
