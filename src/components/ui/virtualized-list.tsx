import { useVirtualizer } from '@tanstack/react-virtual';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import { Loader } from '~/components/ui/loader';

import { cn } from '~/lib/utils';

interface VirtualizedListProps<T> {
  readonly items: ReadonlyArray<T>;
  readonly itemKey: (item: T) => string;
  readonly renderItem: (item: T, index: number) => ReactNode;
  /** A row's height before it is measured. */
  readonly estimatedItemSize?: number;
  /** More items exist: near the end of the list, `onLoadMore` asks for them. */
  readonly hasMore?: boolean;
  /** Shows a loader after the last row. */
  readonly isLoadingMore?: boolean;
  readonly onLoadMore?: () => void;
  /** The scroll box; give it a height (`h-80`, or `min-h-0 flex-1` in a full-height column). */
  readonly className?: string;
}

/**
 * Rows of a long list, only those in view rendered and measured as they mount, hairlines between them as in
 * `ItemList`. It scrolls itself; with `hasMore` + `onLoadMore` it loads the next page near the end.
 */
export function VirtualizedList<T>({
  items,
  itemKey,
  renderItem,
  estimatedItemSize = 72,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  className,
}: VirtualizedListProps<T>) {
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => estimatedItemSize,
    getItemKey: (index) => itemKey(items[index]!),
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Re-observe when `hasMore` mounts the sentinel and after each page, so a sentinel still in view reports again.
  useEffect(() => {
    const element = sentinelRef.current;
    if (!element || !scrollElement) {
      setIsInView(false);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry!.isIntersecting), {
      root: scrollElement,
      rootMargin: '500px',
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [scrollElement, items.length, hasMore]);

  useEffect(() => {
    if (isInView && hasMore && !isLoadingMore) onLoadMore?.();
  }, [isInView, hasMore, isLoadingMore, onLoadMore]);

  return (
    <div ref={setScrollElement} className={cn('overflow-y-auto overscroll-contain', className)}>
      <div role='list' data-slot='item-list' className='relative w-full' style={{ height: virtualizer.getTotalSize() }}>
        <div
          className='absolute top-0 left-0 w-full'
          style={{ transform: `translateY(${virtualItems[0]?.start ?? 0}px)` }}>
          {virtualItems.map((virtualItem) => (
            <div
              key={virtualItem.key}
              role='listitem'
              ref={virtualizer.measureElement}
              data-index={virtualItem.index}
              className={cn(
                // As in `ItemList`: the row padding is `group`, and the hairline stops at it.
                '*:data-[slot=item]:px-group',
                virtualItem.index < items.length - 1 &&
                  'relative after:absolute after:right-group after:bottom-0 after:left-group after:h-px after:bg-border-subtle',
              )}>
              {renderItem(items[virtualItem.index]!, virtualItem.index)}
            </div>
          ))}
        </div>
      </div>

      {hasMore && <div ref={sentinelRef} className='h-px' />}

      {isLoadingMore && (
        <div className='flex justify-center py-4'>
          <Loader className='text-muted-foreground' size={20} />
        </div>
      )}
    </div>
  );
}
