// Adapted from Base UI useTestInteractions (MIT). No production interaction engine dependency.
export type InteractionProps = Record<string, unknown>;
export interface TestElementProps {
  reference?: InteractionProps;
  floating?: InteractionProps;
  trigger?: InteractionProps;
  item?: InteractionProps | ((props: InteractionProps) => InteractionProps);
}
type Part = keyof TestElementProps;
const isEvent = (key: string) => /^on[A-Z]/.test(key);

/** Getter inputs are evaluated live, including when an already-composed event handler fires. */
export function createTestInteractions(read: () => readonly (TestElementProps | void)[] = () => []) {
  function merge(part: Part, user?: InteractionProps): InteractionProps {
    const sources = () => [
      ...(part === 'floating' ? [{ tabIndex: -1, 'data-base-ui-focusable': '' }] : []),
      ...read().map((entry) => {
        const value = entry?.[part];
        return typeof value === 'function' ? (user ? value(user) : undefined) : value;
      }).filter((entry): entry is InteractionProps => !!entry),
      user ?? {},
    ];
    const keys = () => {
      const current = sources();
      return [...new Set(current.flatMap((source) => Object.keys(source)))].filter((key) =>
        (part !== 'item' || (key !== 'active' && key !== 'selected')) &&
        (!isEvent(key) || current.some((source) => typeof source[key] === 'function')),
      );
    };
    const handlers = new Map<string, (...args: unknown[]) => unknown>();
    return new Proxy({}, {
      ownKeys: keys,
      has: (_, key) => typeof key === 'string' && keys().includes(key),
      getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
      get: (_, key) => {
        if (typeof key !== 'string' || !keys().includes(key)) return undefined;
        if (!isEvent(key)) {
          let result: unknown;
          for (const source of sources()) if (key in source) result = Reflect.get(source, key, source);
          return result;
        }
        if (!handlers.has(key)) handlers.set(key, (...args) => {
          let first: unknown;
          for (const source of sources()) {
            const handler = Reflect.get(source, key, source);
            if (typeof handler !== 'function') continue;
            const result: unknown = handler(...args);
            if (first === undefined && result !== undefined) first = result;
          }
          return first;
        });
        return handlers.get(key);
      },
    });
  }
  return {
    getReferenceProps: (user?: InteractionProps) => merge('reference', user),
    getFloatingProps: (user?: InteractionProps) => merge('floating', user),
    getTriggerProps: (user?: InteractionProps) => merge('trigger', user),
    getItemProps: (user?: InteractionProps) => merge('item', user),
  };
}
