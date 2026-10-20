import { IconChevronRight } from '@tabler/icons-react';

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Item, ItemActions, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';

/** `render={<a />}`, or a router link: the row highlights on hover. */
export function ItemLink() {
  return (
    <Card className='w-full max-w-xl'>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
      </CardHeader>
      <CardContent className='overflow-hidden'>
        <ItemList>
          <Item render={<a href='#website-redesign' />}>
            <ItemContent>
              <ItemTitle>Website redesign</ItemTitle>
              <ItemDescription>3 open tasks</ItemDescription>
            </ItemContent>
            <ItemActions>
              <IconChevronRight className='size-4 text-faint-foreground' />
            </ItemActions>
          </Item>
          <Item render={<a href='#mobile-app' />}>
            <ItemContent>
              <ItemTitle>Mobile app</ItemTitle>
              <ItemDescription>No open tasks</ItemDescription>
            </ItemContent>
            <ItemActions>
              <IconChevronRight className='size-4 text-faint-foreground' />
            </ItemActions>
          </Item>
        </ItemList>
      </CardContent>
    </Card>
  );
}
