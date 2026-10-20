import { FileTextIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Item, ItemContent, ItemDescription, ItemList, ItemMedia, ItemTitle } from '~/components/ui/item';

/** `ItemMedia variant='icon'`; an Avatar for people. */
export function ItemWithMedia() {
  return (
    <Card className='w-full max-w-xl'>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent className='overflow-hidden'>
        <ItemList>
          <Item>
            <ItemMedia variant='icon'>
              <FileTextIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Brand guidelines.pdf</ItemTitle>
              <ItemDescription>Uploaded on March 12</ItemDescription>
            </ItemContent>
          </Item>
          <Item>
            <ItemMedia variant='icon'>
              <FileTextIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Q2 roadmap.pdf</ItemTitle>
            </ItemContent>
          </Item>
        </ItemList>
      </CardContent>
    </Card>
  );
}
