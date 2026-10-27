import { useVirtualizer } from '@tanstack/react-virtual';
import * as React from 'react';

import { useLocale } from '~/components/ui/locale';
import { Spinner } from '~/components/ui/spinner';

/** Distance from the top of the scroll content of `scrollElement` to the top of `element`. */
function useOffsetInScrollElement(scrollElement: HTMLElement | null, element: HTMLElement | null) {
  const [offset, setOffset] = React.useState(0);
  React.useLayoutEffect(() => {
    if (!scrollElement || !element) return;
    const measure = () =>
      setOffset(
        element.getBoundingClientRect().top -
          scrollElement.getBoundingClientRect().top -
          scrollElement.clientTop +
          scrollElement.scrollTop,
      );
    measure();
    // Content above the rows (or a table's header) can change height after it loads.
    const observer = new ResizeObserver(measure);
    for (const child of scrollElement.children) observer.observe(child);
    return () => observer.disconnect();
  }, [scrollElement, element]);
  return offset;
}

interface VirtualRowsOptions<T> {
  readonly items: ReadonlyArray<T>;
  readonly itemKey: (item: T) => React.Key;
  readonly estimatedItemSize: number;
  /** The element that scrolls; `null` until it mounts. */
  readonly scroller: HTMLElement | null;
  /** The element the first row starts at, inside `scroller`. */
  readonly start: HTMLElement | null;
  readonly hasMore: boolean;
  readonly isLoadingMore: boolean;
  readonly onLoadMore: (() => void) | undefined;
}

/**
 * The rows in view of a long `ItemList` or `Table`, and paging: near the end (a sentinel 500px out), `onLoadMore`.
 * Render `<LoadMore>` with the returned `sentinelRef` after the rows.
 */
export function useVirtualRows<T>({
  items,
  itemKey,
  estimatedItemSize,
  scroller,
  start,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: VirtualRowsOptions<T>) {
  const scrollMargin = useOffsetInScrollElement(scroller, start);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scroller,
    estimateSize: () => estimatedItemSize,
    getItemKey: (index) => itemKey(items[index]!),
    overscan: 5,
    scrollMargin,
  });

  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const [nearEnd, setNearEnd] = React.useState(false);
  // Re-observe when `hasMore` mounts the sentinel and after each page, so a sentinel still in view reports again.
  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !scroller) {
      setNearEnd(false);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setNearEnd(entry!.isIntersecting), {
      root: scroller,
      rootMargin: '500px',
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [scroller, items.length, hasMore]);
  React.useEffect(() => {
    if (nearEnd && hasMore && !isLoadingMore) onLoadMore?.();
  }, [nearEnd, hasMore, isLoadingMore, onLoadMore]);

  return { virtualizer, scrollMargin, sentinelRef };
}

/** The sentinel `useVirtualRows` watches, and a spinner while the next page loads. */
export function LoadMore({
  sentinelRef,
  hasMore,
  isLoadingMore,
  label,
}: {
  readonly sentinelRef: React.Ref<HTMLDivElement>;
  readonly hasMore: boolean;
  readonly isLoadingMore: boolean;
  readonly label: string | undefined;
}) {
  const { labels } = useLocale();
  return (
    <>
      {hasMore && <div ref={sentinelRef} className='h-px' />}
      {isLoadingMore && (
        <div role='status' className='flex justify-center py-group'>
          <Spinner className='text-muted-foreground' size={20} />
          <span className='sr-only'>{label ?? labels.loadingMore}</span>
        </div>
      )}
    </>
  );
}
