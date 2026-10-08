/** Omit component-only keys without snapshotting native props or changing getter receivers. */
export function elementProps<T extends object>(props: T, keys: readonly PropertyKey[]) {
  const omitted = new Set<PropertyKey>(['render', 'class', 'style', 'ref', ...keys]);
  return new Proxy(props, {
    ownKeys: target => Reflect.ownKeys(target).filter(key => !omitted.has(key)),
    getOwnPropertyDescriptor: (target, key) => omitted.has(key) ? undefined : { configurable: true, enumerable: true },
    get: (target, key) => omitted.has(key) ? undefined : Reflect.get(target, key, target),
    has: (target, key) => !omitted.has(key) && key in target,
  });
}
