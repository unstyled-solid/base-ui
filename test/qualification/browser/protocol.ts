/** Observation only: no component implementation or React/Solid state adapter. */
export interface Details {
  reason: string;
  event: Event | { type: string; nativeEvent?: Event };
  isCanceled?: boolean;
  cancel?: () => void;
}

export type Entry = { callback: string; value?: unknown; reason?: string; event?: string; canceled?: boolean };
declare global {
  interface Window {
    __qualification: { ready: boolean; log: Entry[]; dispose?: () => void };
  }
}

window.__qualification = { ready: false, log: [] };
export const scenario = new URL(location.href).searchParams.get('scenario');
export function record(callback: string, value?: unknown, details?: Details) {
  const event = details?.event;
  window.__qualification.log.push({
    callback,
    ...(value === undefined ? {} : { value }),
    ...(details ? {
      reason: details.reason,
      event: event && ('nativeEvent' in event ? event.nativeEvent?.type : event.type),
      canceled: details.isCanceled ?? false,
    } : {}),
  });
}
export function change(callback: string, cancel = false) {
  return (value: unknown, details: Details) => {
    if (cancel) details.cancel?.();
    record(callback, value, details);
  };
}
export function submitted(event: { preventDefault(): void; currentTarget: HTMLFormElement }) {
  event.preventDefault();
  record('submit', [...new FormData(event.currentTarget).entries()]);
}
