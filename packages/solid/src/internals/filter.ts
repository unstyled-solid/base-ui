// Adapted from Base UI (MIT), pinned source recorded in tracking/foundations/filter.json.
import { stringifyLocale } from '../utils/stringifyLocale';
import { stringifyAsLabel } from './resolveValueLabel';

const filterCache = new Map<string, Filter>();
const nativeComparators = new WeakMap<Filter | Filter['contains'], (a: string, b: string) => number>();

function createContainsMatcher(compare: (a: string, b: string) => number, query: string) {
  if (query.length > 3) {
    const windows = new Map<string, boolean>();
    return (text: string) => {
      if (text.includes(query)) return true;
      // A single window needs neither slicing nor a substring-cache insertion.
      // In particular selection fills the input with a full label; collecting
      // every other full label in the window map adds work without sliding.
      if (text.length === query.length) return compare(text, query) === 0;
      for (let i = 0; i <= text.length - query.length; i++) {
        const window = text.slice(i, i + query.length);
        let result = windows.get(window);
        if (result === undefined) {
          result = compare(window, query) === 0;
          windows.set(window, result);
        }
        if (result) return true;
      }
      return false;
    };
  }
  // Up to three UTF-16 units fit exactly in a Number (48 bits). Cache the
  // same Intl comparisons without allocating/hashing a substring on every hit.
  // This is not a character-wise collation approximation: misses still compare
  // the entire original window, including contractions and surrogate halves.
  // Choose the key/storage strategy once. Sharing a loop across all lengths
  // makes each window branch between byte-table and Map reads and between
  // integer and double keys just as a user types the next character.
  if (query.length === 1) {
    const characters = new Uint8Array(65536);
    return (text: string) => {
      if (text.includes(query)) return true;
      for (let i = 0; i < text.length; i++) {
        const key = text.charCodeAt(i);
        let result = characters[key];
        if (result === 0) {
          result = compare(text.charAt(i), query) === 0 ? 2 : 1;
          characters[key] = result;
        }
        if (result === 2) return true;
      }
      return false;
    };
  }
  if (query.length === 2) {
    // Direct addressing for the bounded ASCII window domain avoids hashing
    // on every repeated window. This caches exact whole-window Intl answers;
    // it does not assume ASCII collation or normalize the query/label.
    const ascii = new Uint8Array(128 * 128);
    const pairs = new Map<number, boolean>();
    return (text: string) => {
      if (text.includes(query)) return true;
      for (let i = 0; i < text.length - 1; i++) {
        const first = text.charCodeAt(i);
        const second = text.charCodeAt(i + 1);
        if ((first | second) < 128) {
          const key = (first << 7) | second;
          let result = ascii[key];
          if (result === 0) {
            result = compare(text.slice(i, i + 2), query) === 0 ? 2 : 1;
            ascii[key] = result;
          }
          if (result === 2) return true;
          continue;
        }
        const key = (first << 16) | second;
        let result = pairs.get(key);
        if (result === undefined) {
          result = compare(text.slice(i, i + 2), query) === 0;
          pairs.set(key, result);
        }
        if (result) return true;
      }
      return false;
    };
  }
  // Allocate a 16KiB page only for leading units actually encountered. A full
  // three-unit table would clear 2MiB on every keystroke, even for tiny lists.
  const ascii: (Uint8Array | undefined)[] = [];
  const triples = new Map<number, boolean>();
  return (text: string) => {
    if (text.includes(query)) return true;
    for (let i = 0; i < text.length - 2; i++) {
      const first = text.charCodeAt(i);
      const second = text.charCodeAt(i + 1);
      const third = text.charCodeAt(i + 2);
      if ((first | second | third) < 128) {
        const page = ascii[first] ?? (ascii[first] = new Uint8Array(128 * 128));
        const key = (second << 7) | third;
        let result = page[key];
        if (result === 0) {
          result = compare(text.slice(i, i + 3), query) === 0 ? 2 : 1;
          page[key] = result;
        }
        if (result === 2) return true;
        continue;
      }
      const key = first * 4294967296 + second * 65536 + third;
      let result = triples.get(key);
      if (result === undefined) {
        result = compare(text.slice(i, i + 3), query) === 0;
        triples.set(key, result);
      }
      if (result) return true;
    }
    return false;
  };
}

/** One scan's fixed-query predicate. Cache comparisons, never item labels. */
export function createFilterMatcher<Item>(filter: Filter | ((item: Item, query: string, label?: (item: Item) => string) => boolean), query: string, itemToString?: (item: Item) => string): (item: Item) => boolean {
  const compare = nativeComparators.get(filter as Filter | Filter['contains']);
  if (!compare) return typeof filter === 'function'
    ? (item) => filter(item, query, itemToString)
    : (item) => filter.contains(item, query, itemToString);
  if (!query) return () => true;
  // The same substring/query pair is common across large lists. Its Intl
  // result is invariant; this map dies with the scan and retains no items.
  const matches = createContainsMatcher(compare, query);
  if (itemToString) return (item) => matches(item == null ? stringifyAsLabel(item) : itemToString(item) ?? '');
  return (item) => matches(stringifyAsLabel(item, itemToString));
}

export function getFilter(options: GetFilterParameters = {}): Filter {
  const { locale, ...restOptions } = options;
  const collatorOptions: Intl.CollatorOptions = {
    usage: 'search',
    sensitivity: 'base',
    ignorePunctuation: true,
    ...restOptions,
  };
  const cacheKey = `${stringifyLocale(locale)}|${JSON.stringify(collatorOptions)}`;
  const cachedFilter = filterCache.get(cacheKey);
  if (cachedFilter) {
    return cachedFilter;
  }
  const collator = new Intl.Collator(locale, collatorOptions);
  // Intl exposes a bound function through a getter. Resolve it once, not for
  // each of the hundreds of thousands of substring comparisons in a scan.
  const compare = collator.compare;
  // Autocomplete can wrap contains in its custom filter policy. Share the
  // same invariant comparison work there too, retaining only the latest query.
  // Capture the matcher before stringification: a converter may reenter this
  // filter with another query without changing the current call's matcher.
  let lastQuery: string | undefined;
  let lastMatch: ((window: string) => boolean) | undefined;
  const filter: Filter = {
    contains<Item>(item: Item, query: string, itemToString?: (item: Item) => string) {
      if (!query) {
        return true;
      }
      if (query !== lastQuery) {
        lastQuery = query;
        lastMatch = createContainsMatcher(compare, query);
      }
      const matches = lastMatch!;
      const itemString = stringifyAsLabel(item, itemToString);
      return matches(itemString);
    },
    startsWith<Item>(item: Item, query: string, itemToString?: (item: Item) => string) {
      if (!query) {
        return true;
      }
      const itemString = stringifyAsLabel(item, itemToString);
      return compare(itemString.slice(0, query.length), query) === 0;
    },
    endsWith<Item>(item: Item, query: string, itemToString?: (item: Item) => string) {
      if (!query) {
        return true;
      }
      const itemString = stringifyAsLabel(item, itemToString);
      const queryLength = query.length;
      return itemString.length >= queryLength &&
        compare(itemString.slice(itemString.length - queryLength), query) === 0;
    },
  };
  nativeComparators.set(filter, compare);
  nativeComparators.set(filter.contains, compare);
  filterCache.set(cacheKey, filter);
  return filter;
}

export interface GetFilterParameters extends Intl.CollatorOptions {
  /** The comparison locale. Defaults to the user's runtime locale. */
  locale?: Intl.LocalesArgument | undefined;
}

export interface Filter {
  /** Returns whether the item matches the query anywhere. */
  contains: <Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean;
  /** Returns whether the item starts with the query. */
  startsWith: <Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean;
  /** Returns whether the item ends with the query. */
  endsWith: <Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean;
}
