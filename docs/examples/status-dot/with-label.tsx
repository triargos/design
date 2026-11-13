import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Item, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';
import { StatusDot } from '~/components/ui/status-dot';

/** The dot alone is decorative: the label names the state. */
export function StatusDotWithLabel() {
  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>Members</CardTitle>
      </CardHeader>
      <CardContent>
        <ItemList>
          <Item>
            <ItemContent>
              <ItemTitle>Lena Park</ItemTitle>
              <ItemDescription>Design</ItemDescription>
            </ItemContent>
            <span className='flex items-center gap-control-gap text-caption text-muted-foreground'>
              <StatusDot intent='success' />
              Online
            </span>
          </Item>
        </ItemList>
      </CardContent>
    </Card>
  );
}
