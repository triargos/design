import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Item, ItemContent, ItemList, ItemTitle } from '~/components/ui/item';

/** A row in a list. Lists sit flush in a card, a hairline between rows that stops at the row padding. */
export function ItemDefault() {
  return (
    <Card className='w-full max-w-xl'>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
      </CardHeader>
      <CardContent className='overflow-hidden'>
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
      </CardContent>
    </Card>
  );
}
