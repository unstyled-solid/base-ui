var e=`import { createSignal, onCleanup, onSettled, untrack, For } from 'solid-js';
import type { ComponentProps, JSX } from '@solidjs/web';
import { Combobox } from 'baseui-solid2/combobox';
import { createVirtualizer, type Virtualizer } from '../../virtualizer';
import styles from './index.module.css';
export default function ExampleVirtualizedCombobox() {
    const virtualizerRef = { current: null } as {
        current: Virtualizer | null;
    };
    return (<Combobox.Root virtualized items={virtualizedItems} itemToStringLabel={getItemLabel} onItemHighlighted={(item, { reason, index }) => {
            const virtualizer = virtualizerRef.current;
            if (!item || !virtualizer) {
                return;
            }
            const isStart = index === 0;
            const isEnd = index === virtualizer.options.count - 1;
            // \`imperative-action\` can jump anywhere in the list, so it always needs a scroll:
            // unlike the arrow keys it can target an item that is not currently rendered.
            const shouldScroll = reason === 'none' ||
                reason === 'imperative-action' ||
                (reason === 'keyboard' && (isStart || isEnd));
            if (shouldScroll) {
                queueMicrotask(() => {
                    virtualizer.scrollToIndex(index, { align: isEnd ? 'start' : 'end' });
                });
            }
        }}>
      <label class={styles.Label}>
        Search 10,000 items
        <Combobox.Input class={styles.Input}/>
      </label>

      <Combobox.Portal>
        <Combobox.Positioner class={styles.Positioner} sideOffset={4}>
          <Combobox.Popup class={styles.Popup}>
            <Combobox.Empty>
              <div class={styles.Empty}>No items found.</div>
            </Combobox.Empty>
            <Combobox.List class={styles.List}>
              <VirtualizedList virtualizerRef={virtualizerRef}/>
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>);
}
function VirtualizedList(props: {
    virtualizerRef: {
        current: Virtualizer | null;
    };
}) {
    const virtualizerRef = props.virtualizerRef;
    const filteredItems = Combobox.useFilteredItems<VirtualizedItem>();
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
    const handleScrollElementRef = (element: HTMLDivElement | null) => {
        setScrollElement(element);
    };
    const totalSize = () => virtualizer.getTotalSize();
    return (<div role="presentation" hidden={filteredItems().length === 0} ref={handleScrollElementRef} class={styles.Scroller} style={{ '--total-size': \`\${totalSize()}px\` } as JSX.CSSProperties}>
      <div role="presentation" class={styles.VirtualizedPlaceholder} style={{ height: \`\${totalSize()}px\` }}>
        <For each={virtualizer.getVirtualItems()} keyed={(row) => row.key}>{(virtualItem) => {
            // Core's default key IS the index; this row owner cannot change index.
            const index = untrack(() => virtualItem().index);
            const item = () => filteredItems()[index];
            let element: HTMLDivElement | undefined;
            onSettled(() => {
                if (element) virtualizer.measureElement(element);
                return () => virtualizer.measureElement(null);
            });
            return <div role="presentation" style={{ display: 'contents' }}><Combobox.Item index={index} data-index={index} ref={(node) => { element = node; }} value={item()} class={styles.Item} aria-setsize={filteredItems().length} aria-posinset={index + 1} style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: \`\${virtualItem().size}px\`,
                    transform: \`translateY(\${virtualItem().start}px)\`,
                }}>
              <Combobox.ItemIndicator class={styles.ItemIndicator}>
                <CheckIcon />
              </Combobox.ItemIndicator>
              <span class={styles.ItemText}>{item()?.name}</span>
            </Combobox.Item></div>;
        }}</For>
      </div>
    </div>);
}
function CheckIcon(props: ComponentProps<'svg'>) {
    return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" {...props} style={typeof props.style === 'string' ? \`display:block;\${props.style}\` : { display: 'block', ...(typeof props.style === 'object' ? props.style : {}) }}>
      <path d="m2.5 8.5 4 4 7-9"/>
    </svg>);
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