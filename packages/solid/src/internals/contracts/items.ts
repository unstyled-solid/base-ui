import type { Cleanup, ElementAccessor } from './core';

export interface ItemRegistry<Key, Item> {
  /** Live getter of the last immutable published snapshot. */
  readonly items: ReadonlyMap<Key, Item>;
  /** Immediate imperative registry, including this turn's registrations. */
  readonly liveItems: ReadonlyMap<Key, Item>;
  /** Cleanup must not unregister a newer registration at the same key. */
  registerItem(key: Key, item: Item): Cleanup;
}
export type CompositeMetadata<CustomMetadata> = { index: number } & CustomMetadata;
export interface ItemMetadata {
  readonly disabled?: boolean | undefined;
  readonly label?: string | null | undefined;
  readonly index?: number | null | undefined;
}
export interface ItemRegistration<Metadata = unknown> extends ItemMetadata {
  readonly element: ElementAccessor;
  readonly textElement?: ElementAccessor | undefined;
  readonly metadata?: Metadata | undefined;
}
/** Source null/undefined distinctions retained for composite-owned registration. */
export interface CompositeListRegistration<Metadata> {
  metadata: Metadata | null;
  index: number | null;
  label: string | null | undefined;
  textRef: ElementAccessor | undefined;
}
