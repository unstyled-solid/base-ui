export class PopupTriggerMap {
  private readonly ids = new Map<string, Element>();
  private readonly reverse = new WeakMap<Element, string>();
  add(id: string, element: Element): void {
    const previousId = this.reverse.get(element);
    if (process.env.NODE_ENV !== 'production' && previousId !== undefined && previousId !== id) throw new Error('Base UI: A trigger element cannot be registered under multiple IDs in PopupTriggerMap. Remove its previous registration before registering a new ID.');
    const previous = this.ids.get(id);
    if (previous && previous !== element) this.reverse.delete(previous);
    this.ids.set(id, element); this.reverse.set(element, id);
  }
  delete(id: string): void { const element = this.ids.get(id); if (element) this.reverse.delete(element); this.ids.delete(id); }
  get size(): number { return this.ids.size; }
  getById(id: string): Element | undefined { return this.ids.get(id); }
  hasElement(element: Element): boolean { for (const current of this.ids.values()) if (current === element) return true; return false; }
  hasMatchingElement(predicate: (element: Element) => boolean): boolean { for (const element of this.ids.values()) if (predicate(element)) return true; return false; }
  entries(): IterableIterator<[string, Element]> { return this.ids.entries(); }
  elements(): IterableIterator<Element> { return this.ids.values(); }
}
