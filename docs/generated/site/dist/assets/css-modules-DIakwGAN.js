var e=`// Adapted from Base UI (MIT), 19511bb171f3b360b006c94cf6d07e53cb446505.
import { createSignal, onCleanup, onSettled, For } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { Autocomplete } from 'baseui-solid2/autocomplete';
import { createVirtualizer, type DemoVirtualizer } from '../../virtualizer';
import styles from './index.module.css';

export default function ExampleVirtualizedAutocomplete() {
  const virtualizerRef: { current: DemoVirtualizer | null } = { current: null };

  return (
    <Autocomplete.Root
      virtualized
      items={virtualizedItems}
      openOnInputClick
      itemToStringValue={getItemLabel}
      onItemHighlighted={(item, { reason, index }) => {
        const virtualizer = virtualizerRef.current;

        if (!item || !virtualizer) {
          return;
        }

        const isStart = index === 0;
        const isEnd = index === virtualizer.options.count - 1;
        // \`imperative-action\` can jump anywhere in the list, so it always needs a scroll:
        // unlike the arrow keys it can target an item that is not currently rendered.
        const shouldScroll =
          reason === 'none' ||
          reason === 'imperative-action' ||
          (reason === 'keyboard' && (isStart || isEnd));

        if (shouldScroll) {
          queueMicrotask(() => {
            virtualizer.scrollToIndex(index, { align: isEnd ? 'start' : 'end' });
          });
        }
      }}
    >
      <label class={styles.Label}>
        Search 10,000 items
        <Autocomplete.Input class={styles.Input} />
      </label>

      <Autocomplete.Portal>
        <Autocomplete.Positioner class={styles.Positioner} sideOffset={4}>
          <Autocomplete.Popup class={styles.Popup}>
            <Autocomplete.Empty>
              <div class={styles.Empty}>No items found.</div>
            </Autocomplete.Empty>
            <Autocomplete.List class={styles.List}>
              <VirtualizedList virtualizerRef={virtualizerRef} />
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}

function VirtualizedList({
  virtualizerRef,
}: {
  virtualizerRef: { current: DemoVirtualizer | null };
}) {
  const filteredItems = Autocomplete.useFilteredItems<VirtualizedItem>();

  const [scrollElement, setScrollElement] = createSignal<HTMLDivElement | null>(null);

  const virtualizer = createVirtualizer({
    count: () => filteredItems().length,
    getScrollElement: scrollElement,
    estimateSize: () => 32,
    overscan: 20,
    paddingStart: 4,
    paddingEnd: 4,
    scrollPaddingEnd: 4,
    scrollPaddingStart: 4,
  });

  virtualizerRef.current = virtualizer;
  onCleanup(() => { virtualizerRef.current = null; });

  const handleScrollElementRef = (
    (element: HTMLDivElement | null) => {
      setScrollElement(element);
    }
  );

  const totalSize = () => virtualizer.getTotalSize();


  return (
    <div
      role="presentation"
      hidden={filteredItems().length === 0}
      ref={handleScrollElementRef}
      class={styles.Scroller}
      style={{ '--total-size': \`\${totalSize()}px\` } as JSX.CSSProperties}
    >
      <div
        role="presentation"
        class={styles.VirtualizedPlaceholder}
        style={{ height: \`\${totalSize()}px\` }}
      >
        <For each={virtualizer.getVirtualItems()} keyed={(row) => row.key}>{(virtualItem) => {
          const item = () => filteredItems()[virtualItem().index];
          let element: HTMLDivElement | undefined;
          onSettled(() => {
            if (element) virtualizer.measureElement(element);
            return () => virtualizer.measureElement(null);
          });
          return (
            <Autocomplete.Item
              index={virtualItem().index}
              data-index={virtualItem().index}
              ref={(node) => { element = node; }}
              value={item()}
              class={styles.Item}
              aria-setsize={filteredItems().length}
              aria-posinset={virtualItem().index + 1}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: \`\${virtualItem().size}px\`,
                transform: \`translateY(\${virtualItem().start}px)\`,
              }}
            >
              {item()?.name}
            </Autocomplete.Item>
          );
        }}</For>
      </div>
    </div>
  );
}

interface VirtualizedItem {
  id: string;
  name: string;
}

function getItemLabel(item: VirtualizedItem | null) {
  return item ? item.name : '';
}

const virtualizedItems: VirtualizedItem[] = Array.from({ length: 10000 }, (_, index) => {
  const id = String(index + 1);
  const indexLabel = id.padStart(4, '0');
  return { id, name: \`Item \${indexLabel}\` };
});
`;export{e as default};