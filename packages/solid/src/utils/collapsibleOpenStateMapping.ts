export const triggerOpenStateMapping = { open: (value: boolean): Record<string, string> | null => value ? { 'data-panel-open': '' } : null };
export const collapsibleOpenStateMapping = { open: (value: boolean): Record<string, string> => value ? { 'data-open': '' } : { 'data-closed': '' } };
