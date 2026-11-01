import type { JSX } from '@solidjs/web';
import { createSignal, onSettled, runWithOwner, untrack } from 'solid-js';
import { LabelableContext, useLabelableContext, type LabelableContextValue } from './LabelableContext';
import { createBaseUiId } from '../createBaseUiId';
import { merge } from 'solid-js';
export interface LabelableProviderProps { children?: JSX.Element }
export interface LabelableProviderState {}
export function LabelableProvider(props: LabelableProviderProps): JSX.Element {
  const defaultId = createBaseUiId();
  const parent = useLabelableContext();
  const [selection, setSelection] = createSignal<string | null | undefined>(undefined);
  const [labelId, setLabelId] = createSignal<string | undefined>(undefined);
  const [fieldLabelId, setFieldLabelId] = createSignal<string | undefined>(undefined);
  const [fieldLabels, setFieldLabels] = createSignal<{ token: symbol; id: string }[]>([]);
  const [messageIds, setMessageIds] = createSignal<string[]>([]);
  const registrations = new Map<symbol, string | null>();
  const value: LabelableContextValue = {
    get controlId() { return selection() === undefined ? defaultId() : selection(); },
    registerControlId(source, id) {
      if (id === undefined) registrations.delete(source);
      else registrations.set(source, id);
      // The updater sees pending selection, even during same-turn registrations.
      setSelection((previous) => {
        if (!registrations.size) return previous;
        for (const current of registrations.values()) if (current === previous) return previous;
        return registrations.values().next().value;
      });
    },
    resetControlId() { if (!registrations.size) setSelection(undefined); },
    get labelId() { return labelId() ?? fieldLabelId(); },
    setLabelId,
    setFieldLabelId,
    registerFieldLabel(candidate) {
      // Capture this owner's candidate, not a previous owner's published ID.
      // RC20 can construct a keyed replacement before disposing its predecessor.
      const registration = { token: Symbol(), id: untrack(candidate) };
      onSettled(() => {
        setFieldLabels((current) => [...current, registration]);
        return () => runWithOwner(null, () => {
          setFieldLabels((current) => current.filter((entry) => entry.token !== registration.token));
        });
      });
      return () => labelId() ?? fieldLabels()[0]?.id ?? registration.id;
    },
    get messageIds() { return messageIds(); },
    setMessageIds,
    getDescriptionProps<P extends object>(external: P): P & { 'aria-describedby'?: string | undefined } {
      return merge(external, {
        get 'aria-describedby'() {
          const description = (external as P & { 'aria-describedby'?: string | false | undefined })['aria-describedby'];
          const ids = typeof description === 'string' ? description.split(' ') : [];
          return [...new Set([...ids, ...(parent?.messageIds ?? []), ...messageIds()])].join(' ') || undefined;
        },
      }) as P & { 'aria-describedby'?: string | undefined };
    },
  };
  return <LabelableContext value={value}>{props.children}</LabelableContext>;
}
export namespace LabelableProvider {
  export type Props = LabelableProviderProps;
  export type State = LabelableProviderState;
}
