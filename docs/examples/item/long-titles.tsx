import { IconFileText } from '@tabler/icons-react';

import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Item, ItemContent, ItemDescription, ItemList, ItemMedia, ItemTitle } from '~/components/ui/item';

/** A title stays on one line and ends in an ellipsis; beside a badge, its text goes in a `span`. */
export function ItemLongTitles() {
  return (
    <Card className='w-full max-w-sm'>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent className='overflow-hidden'>
        <ItemList>
          <Item>
            <ItemMedia variant='icon'>
              <IconFileText />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Quarterly planning notes for the website redesign and the mobile app.pdf</ItemTitle>
              <ItemDescription>Uploaded on March 12</ItemDescription>
            </ItemContent>
          </Item>
          <Item>
            <ItemMedia variant='icon'>
              <IconFileText />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>
                <span>Invoice 2024-0193 for the design system workshop.pdf</span>
                <Badge size='sm'>Draft</Badge>
              </ItemTitle>
              <ItemDescription>Uploaded on March 14</ItemDescription>
            </ItemContent>
          </Item>
        </ItemList>
      </CardContent>
    </Card>
  );
}
