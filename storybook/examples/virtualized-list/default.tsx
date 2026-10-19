import { useState } from 'react';

import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { Item, ItemContent, ItemDescription, ItemTitle } from '~/components/ui/item';
import { ScrollElementContext } from '~/components/ui/layout-slots';
import { VirtualizedList } from '~/components/ui/virtualized-list';

const NOTIFICATIONS = Array.from({ length: 1000 }, (_, index) => ({
  id: String(index),
  title: `Nachricht ${index + 1}`,
  description: index % 3 === 0 ? 'Elternbrief der Klasse 3b' : 'Termin bestätigt',
}));

/**
 * Only the rows in view render, measured as they mount. It scrolls the element in `ScrollElementContext`: the page
 * in the app (MainLayout), a box here.
 */
export function VirtualizedListDefault() {
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);
  return (
    <InsetCard className='w-full max-w-md'>
      <InsetCardHeader>
        <InsetCardTitle>1.000 Nachrichten</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='overflow-hidden'>
        <div ref={setScrollElement} className='h-80 overflow-y-auto'>
          <ScrollElementContext value={scrollElement}>
            <VirtualizedList
              items={NOTIFICATIONS}
              keyExtractor={(item) => item.id}
              estimatedItemSize={60}
              showSeparators
              renderItem={(item) => (
                <Item>
                  <ItemContent>
                    <ItemTitle>{item.title}</ItemTitle>
                    <ItemDescription>{item.description}</ItemDescription>
                  </ItemContent>
                </Item>
              )}
            />
          </ScrollElementContext>
        </div>
      </InsetCardContent>
    </InsetCard>
  );
}
