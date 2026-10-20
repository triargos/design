import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { useVirtualizer } from '@tanstack/react-virtual';
import { CheckIcon } from 'lucide-react';
import * as React from 'react';

import { comboboxItemClassName } from '~/components/ui/combobox';

type VirtualizerInstance = ReturnType<typeof useVirtualizer<HTMLDivElement, Element>>;

/**
 * State for `Combobox virtualized` + `VirtualizedComboboxList`: spread `root` on the `Combobox`, `list` on the list.
 * Base UI cannot scroll a row it has not rendered into view; `onItemHighlighted` asks the virtualizer to.
 */
function useVirtualizedCombobox() {
  const [open, setOpen] = React.useState(false);
  const virtualizerRef = React.useRef<VirtualizerInstance | null>(null);

  const onItemHighlighted = (item: unknown, { reason, index }: ComboboxPrimitive.Root.HighlightEventDetails) => {
    const virtualizer = virtualizerRef.current;
    if (item === undefined || !virtualizer) return;
    const isStart = index === 0;
    const isEnd = index === virtualizer.options.count - 1;
    if (reason === 'none' || (reason === 'keyboard' && (isStart || isEnd))) {
      queueMicrotask(() => virtualizer.scrollToIndex(index, { align: isEnd ? 'start' : 'end' }));
    }
  };

  return {
    root: { open, onOpenChange: setOpen, onItemHighlighted },
    list: { open, virtualizerRef },
  };
}

const ROW_ESTIMATE = 36;
const OVERSCAN = 20;

interface VirtualizedComboboxListProps<T> {
  open: boolean;
  virtualizerRef: React.RefObject<VirtualizerInstance | null>;
  children: (item: T) => React.ReactNode;
  /** The leading column for an item, in place of the selection check (e.g. a plus on a create row); `undefined` keeps the check. */
  indicator?: (item: T) => React.ReactNode;
  /** Keys the size cache by item, not index: a row never inherits the size of whatever sat at its index before. */
  itemKey?: (item: T) => React.Key;
}

function VirtualizedComboboxList<T>({
  open,
  virtualizerRef,
  children,
  indicator,
  itemKey,
}: VirtualizedComboboxListProps<T>) {
  const filteredItems = ComboboxPrimitive.useFilteredItems<T>();
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    enabled: open,
    count: filteredItems.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_ESTIMATE,
    getItemKey: itemKey && ((index) => itemKey(filteredItems[index]!)),
    overscan: OVERSCAN,
    // No paddingStart/End: the listbox's `p-1` is the one inset, on every side, so a row's `rounded-inner` stays
    // concentric with the popup. Scroll padding keeps a keyboard-scrolled row clear of the edge.
    scrollPaddingEnd: 4,
    scrollPaddingStart: 4,
  });

  React.useImperativeHandle(virtualizerRef, () => virtualizer);

  // Stable (the virtualizer instance is), so the list is measured once per mount, not on every render.
  const handleScrollRef = React.useCallback(
    (element: HTMLDivElement | null) => {
      scrollRef.current = element;
      if (element) virtualizer.measure();
    },
    [virtualizer],
  );

  return (
    <ComboboxPrimitive.List data-slot='combobox-list' className='overflow-hidden p-1 data-empty:p-0'>
      {filteredItems.length > 0 && (
        <div
          role='presentation'
          ref={handleScrollRef}
          className='no-scrollbar max-h-72 overflow-x-hidden overflow-y-auto overscroll-contain'>
          <div role='presentation' style={{ height: virtualizer.getTotalSize(), position: 'relative', width: '100%' }}>
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const item = filteredItems[virtualItem.index]!;
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
                    // No height from the virtualizer: the row keeps its natural height and `measureElement` reads it.
                    // A height from the cache would make a stale size measure itself again and never shrink back.
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
                  {/* One line: a virtualized row cannot widen the popup. */}
                  <div className='col-start-2 flex min-w-0 items-center gap-2 truncate'>{children(item)}</div>
                </ComboboxPrimitive.Item>
              );
            })}
          </div>
        </div>
      )}
    </ComboboxPrimitive.List>
  );
}

export { useVirtualizedCombobox, VirtualizedComboboxList };
