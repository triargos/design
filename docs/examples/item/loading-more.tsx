import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Item, ItemContent, ItemTitle, ItemList } from '~/components/ui/item';

const PAGE = 20;
const TOTAL = 100;

const page = (from: number) =>
  Array.from({ length: PAGE }, (_, index) => ({
    id: String(from + index),
    title: `Invoice INV-${String(from + index + 1).padStart(4, '0')}`,
  }));

/** `hasMore` + `onLoadMore`: near the end, the next page loads; `isLoadingMore` shows the loader. */
export function ItemLoadingMore() {
  const [items, setItems] = useState(() => page(0));
  const [loading, setLoading] = useState(false);
  const loadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setItems((current) => [...current, ...page(current.length)]);
      setLoading(false);
    }, 800);
  };
  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>
          {items.length} of {TOTAL} invoices
        </CardTitle>
      </CardHeader>
      <CardContent className='overflow-hidden'>
        <ItemList
          virtualized
          className='h-80'
          items={items}
          itemKey={(item) => item.id}
          estimatedItemSize={44}
          hasMore={items.length < TOTAL}
          isLoadingMore={loading}
          onLoadMore={loadMore}>
          {(item) => (
            <Item>
              <ItemContent>
                <ItemTitle>{item.title}</ItemTitle>
              </ItemContent>
            </Item>
          )}
        </ItemList>
      </CardContent>
    </Card>
  );
}
