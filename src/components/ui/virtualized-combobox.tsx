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
  /** The leading column for an item, in place of the selection check (e.g. a plus on a create row); `undefined` keeps the check. */
  indicator?: (item: T) => React.ReactNode;
  className?: string;
  estimateSize?: number;
  overscan?: number;
  /** Keys the size cache by item, not index: a row never inherits the size of whatever sat at its index before. */
  itemKey?: (item: T) => React.Key;
}

function VirtualizedComboboxList<T>({
  open,
  virtualizerRef,
  children,
  indicator,
  className,
  estimateSize = 36,
  overscan = 20,
  itemKey,
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
        indicator={indicator}
        estimateSize={estimateSize}
        overscan={overscan}
        itemKey={itemKey}
      />
    </ComboboxPrimitive.List>
  );
}

interface VirtualizedItemsProps<T> {
  open: boolean;
  virtualizerRef: React.RefObject<VirtualizerInstance | null>;
  renderItem: (item: T) => React.ReactNode;
  indicator?: (item: T) => React.ReactNode;
  estimateSize: number;
  overscan: number;
  itemKey?: (item: T) => React.Key;
}

function VirtualizedItems<T>({
  open,
  virtualizerRef,
  renderItem,
  indicator,
  estimateSize,
  overscan,
  itemKey,
}: VirtualizedItemsProps<T>) {
  const filteredItems = ComboboxPrimitive.useFilteredItems<T>();
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    enabled: open,
    count: filteredItems.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateSize,
    getItemKey: (index) => {
      const item = filteredItems[index];
      return itemKey && item !== undefined ? itemKey(item) : index;
    },
    overscan,
    // No paddingStart/End: the listbox's `p-1` is the one inset, on every side, so a row's `rounded-inner` stays
    // concentric with the popup. Scroll padding keeps a keyboard-scrolled row clear of the edge.
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
    <div
      role='presentation'
      ref={handleScrollRef}
      className='no-scrollbar max-h-72 overflow-x-hidden overflow-y-auto overscroll-contain'>
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
          const lead = indicator?.(item);
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
                // No height from the virtualizer: the row keeps its natural height and `measureElement` reads it. A
                // height from the cache would make a stale size measure itself again and never shrink back.
                transform: `translateY(${virtualItem.start}px)`,
              }}
              value={item}>
              {lead === undefined ? (
                <ComboboxPrimitive.ItemIndicator className='col-start-1 flex'>
                  <CheckIcon />
                </ComboboxPrimitive.ItemIndicator>
              ) : (
                <span className='col-start-1 flex'>{lead}</span>
              )}
              <div className='col-start-2 flex min-w-0 items-center gap-2 truncate'>{renderItem(item)}</div>
            </ComboboxPrimitive.Item>
          );
        })}
      </div>
    </div>
  );
}

export { useVirtualizedCombobox, VirtualizedComboboxList, type VirtualizerInstance };
