import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { useVirtualizer } from '@tanstack/react-virtual';
import { CheckIcon } from 'lucide-react';
import * as React from 'react';

import { comboboxItemClassName } from '~/components/ui/combobox';

type VirtualizerInstance = ReturnType<typeof useVirtualizer<HTMLDivElement, Element>>;

interface UseVirtualizedComboboxOptions {
  open: boolean;
  virtualizerRef: React.RefObject<VirtualizerInstance | null>;
}

function useVirtualizedCombobox({ open, virtualizerRef }: UseVirtualizedComboboxOptions) {
  const onItemHighlighted = React.useCallback(
    (item: unknown, { reason, index }: { reason: string; index: number }) => {
      const virtualizer = virtualizerRef.current;
      if (!item || !virtualizer) return;

      const isStart = index === 0;
      const isEnd = index === virtualizer.options.count - 1;
      const shouldScroll = reason === 'none' || (reason === 'keyboard' && (isStart || isEnd));

      if (shouldScroll) {
        queueMicrotask(() => {
          virtualizer.scrollToIndex(index, {
            align: isEnd ? 'start' : 'end',
          });
        });
      }
    },
    [virtualizerRef],
  );

  return { onItemHighlighted };
}

interface VirtualizedComboboxListProps<T> {
  open: boolean;
  virtualizerRef: React.RefObject<VirtualizerInstance | null>;
  children: (item: T) => React.ReactNode;
  className?: string;
  estimateSize?: number;
  overscan?: number;
}

function VirtualizedComboboxList<T>({
  open,
  virtualizerRef,
  children,
  className,
  estimateSize = 36,
  overscan = 20,
}: VirtualizedComboboxListProps<T>) {
  const listClassName = className
    ? `p-1 data-empty:p-0 overflow-hidden ${className}`
    : 'p-1 data-empty:p-0 overflow-hidden';

  return (
    <ComboboxPrimitive.List data-slot='combobox-list' className={listClassName}>
      <VirtualizedItems
        open={open}
        virtualizerRef={virtualizerRef}
        renderItem={children}
        estimateSize={estimateSize}
        overscan={overscan}
      />
    </ComboboxPrimitive.List>
  );
}

interface VirtualizedItemsProps<T> {
  open: boolean;
  virtualizerRef: React.RefObject<VirtualizerInstance | null>;
  renderItem: (item: T) => React.ReactNode;
  estimateSize: number;
  overscan: number;
}

function VirtualizedItems<T>({ open, virtualizerRef, renderItem, estimateSize, overscan }: VirtualizedItemsProps<T>) {
  const filteredItems = ComboboxPrimitive.useFilteredItems<T>();
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    enabled: open,
    count: filteredItems.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateSize,
    overscan,
    paddingStart: 4,
    paddingEnd: 4,
    scrollPaddingEnd: 4,
    scrollPaddingStart: 4,
  });

  React.useImperativeHandle(virtualizerRef, () => virtualizer);

  const handleScrollRef = React.useCallback(
    (element: HTMLDivElement | null) => {
      scrollRef.current = element;
      if (element) {
        virtualizer.measure();
      }
    },
    [virtualizer],
  );

  const totalSize = virtualizer.getTotalSize();

  if (!filteredItems.length) {
    return null;
  }

  return (
    <div role='presentation' ref={handleScrollRef} className='no-scrollbar max-h-72 overflow-y-auto overscroll-contain'>
      <div
        role='presentation'
        style={{
          height: totalSize,
          position: 'relative',
          width: '100%',
        }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = filteredItems[virtualItem.index];
          if (!item) return null;
          return (
            <ComboboxPrimitive.Item
              key={virtualItem.key}
              data-slot='combobox-item'
              index={virtualItem.index}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              aria-setsize={filteredItems.length}
              aria-posinset={virtualItem.index + 1}
              className={comboboxItemClassName}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: virtualItem.size,
                transform: `translateY(${virtualItem.start}px)`,
              }}
              value={item}>
              <ComboboxPrimitive.ItemIndicator className='col-start-1 flex'>
                <CheckIcon />
              </ComboboxPrimitive.ItemIndicator>
              <div className='col-start-2 flex min-w-0 items-center gap-2 truncate'>{renderItem(item)}</div>
            </ComboboxPrimitive.Item>
          );
        })}
      </div>
    </div>
  );
}

export { useVirtualizedCombobox, VirtualizedComboboxList, type VirtualizerInstance };
