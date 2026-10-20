import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Item, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';

export function ItemWithDescription() {
  return (
    <Card className='w-full max-w-xl'>
      <CardHeader>
        <CardTitle>Members</CardTitle>
      </CardHeader>
      <CardContent className='overflow-hidden'>
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
      </CardContent>
    </Card>
  );
}
