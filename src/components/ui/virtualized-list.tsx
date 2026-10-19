import { useVirtualizer } from '@tanstack/react-virtual';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import { useScrollElement } from '~/components/ui/layout-slots';
import { Loader } from '~/components/ui/loader';

import { cn } from '~/lib/utils';

interface VirtualizedListProps<T> {
  items: ReadonlyArray<T>;
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string;

  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;

  estimatedItemSize?: number;
  overscan?: number;

  emptyState?: ReactNode;
  loadingIndicator?: ReactNode;
  className?: string;
  showSeparators?: boolean;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  keyExtractor,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  estimatedItemSize = 72,
  overscan = 5,
  emptyState,
  loadingIndicator,
  className,
  showSeparators = false,
}: VirtualizedListProps<T>) {
  const scrollElement = useScrollElement();

  const virtualizer = useVirtualizer({
    count: scrollElement ? items.length : 0,
    getScrollElement: () => scrollElement,
    estimateSize: () => estimatedItemSize,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Not framer-motion's useInView: it doesn't re-run when ref.current changes from null
  // to an element, so items.length and hasMore re-setup the observer.
  useEffect(() => {
    const element = sentinelRef.current;
    if (!element) {
      setIsInView(false);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry!.isIntersecting), {
      root: scrollElement ?? undefined,
      rootMargin: '500px',
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [scrollElement, items.length, hasMore]);

  useEffect(() => {
    if (isInView && hasMore && !isLoadingMore) {
      onLoadMore?.();
    }
  }, [isInView, hasMore, isLoadingMore, onLoadMore]);

  if (items.length === 0 && !isLoadingMore) {
    return emptyState ?? null;
  }

  return (
    <div className={className}>
      <div className='relative w-full' style={{ height: virtualizer.getTotalSize() }}>
        <div
          className='absolute top-0 left-0 w-full'
          style={{
            transform: `translateY(${virtualItems[0]?.start ?? 0}px)`,
          }}>
          {virtualItems.map((virtualItem) => {
            const item = items[virtualItem.index];
            if (!item) return null;
            const isLast = virtualItem.index === items.length - 1;

            return (
              <div
                key={keyExtractor(item)}
                ref={virtualizer.measureElement}
                data-index={virtualItem.index}
                className={cn(
                  showSeparators &&
                    !isLast &&
                    'relative after:absolute after:right-4 after:bottom-0 after:left-4 after:h-px after:bg-border',
                )}>
                {renderItem(item, virtualItem.index)}
              </div>
            );
          })}
        </div>
      </div>

      {hasMore && <div ref={sentinelRef} className='h-px' />}

      {isLoadingMore && (
        <div className='flex justify-center py-4'>
          {loadingIndicator ?? <Loader className='text-muted-foreground' size={20} />}
        </div>
      )}
    </div>
  );
}
