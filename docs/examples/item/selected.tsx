import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Item, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';

/** A `selected` row takes a quiet fill. */
export function ItemSelected() {
  return (
    <Card className='w-full max-w-xl'>
      <CardHeader>
        <CardTitle>Members</CardTitle>
      </CardHeader>
      <CardContent className='overflow-hidden'>
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
      </CardContent>
    </Card>
  );
}
