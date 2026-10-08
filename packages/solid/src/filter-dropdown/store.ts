export interface State {
  readonly visibleItemIds: ReadonlySet<symbol> | null;
  readonly registeredItemCount: number;
}
/** Read-through native model; no subscription or React store lifecycle. */
export interface FilterDropdownModel { readonly state: State }
export const selectors = {
  isEmpty: (state: State) => state.visibleItemIds === null ? state.registeredItemCount === 0 : state.visibleItemIds.size === 0,
  isItemVisible: (state: State, id: symbol) => state.visibleItemIds === null || state.visibleItemIds.has(id),
};
