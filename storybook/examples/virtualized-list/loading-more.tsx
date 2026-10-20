import { useState } from 'react';

import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { Item, ItemContent, ItemTitle } from '~/components/ui/item';
import { VirtualizedList } from '~/components/ui/virtualized-list';

const PAGE = 20;
const TOTAL = 100;

const page = (from: number) =>
  Array.from({ length: PAGE }, (_, index) => ({
    id: String(from + index),
    title: `Invoice INV-${String(from + index + 1).padStart(4, '0')}`,
  }));

/** `hasMore` + `onLoadMore`: near the end, the next page loads; `isLoadingMore` shows the loader. */
export function VirtualizedListLoadingMore() {
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
    <InsetCard className='w-full max-w-md'>
      <InsetCardHeader>
        <InsetCardTitle>
          {items.length} of {TOTAL} invoices
        </InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='overflow-hidden'>
        <VirtualizedList
          className='h-80'
          items={items}
          itemKey={(item) => item.id}
          estimatedItemSize={44}
          hasMore={items.length < TOTAL}
          isLoadingMore={loading}
          onLoadMore={loadMore}
          renderItem={(item) => (
            <Item>
              <ItemContent>
                <ItemTitle>{item.title}</ItemTitle>
              </ItemContent>
            </Item>
          )}
        />
      </InsetCardContent>
    </InsetCard>
  );
}
