import { IconFileText } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemList,
  ItemListSkeleton,
  ItemMedia,
  ItemTitle,
} from '~/components/ui/item';

const DOCUMENTS = [
  { id: 'brand', name: 'Brand guidelines.pdf', uploaded: 'Uploaded on March 12' },
  { id: 'roadmap', name: 'Q2 roadmap.pdf', uploaded: 'Uploaded on March 14' },
  { id: 'invoice', name: 'Invoice 2024-0193.pdf', uploaded: 'Uploaded on March 20' },
];

/** `ItemListSkeleton` in the list's place, with the rows' `media` and `description`: the card keeps its height. */
export function ItemLoading() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [loading]);
  return (
    <Card className='w-full max-w-xl'>
      <CardHeader
        actions={
          <Button size='xs' onClick={() => setLoading(true)} disabled={loading}>
            Reload
          </Button>
        }>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent className='overflow-hidden' aria-busy={loading}>
        {loading ? (
          <ItemListSkeleton rows={DOCUMENTS.length} media='icon' />
        ) : (
          <ItemList aria-label='Documents'>
            {DOCUMENTS.map((document) => (
              <Item key={document.id}>
                <ItemMedia variant='icon'>
                  <IconFileText />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{document.name}</ItemTitle>
                  <ItemDescription>{document.uploaded}</ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </ItemList>
        )}
      </CardContent>
    </Card>
  );
}
