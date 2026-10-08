declare module 'virtual:docs-demo-runtime' {
  export function mountDemo(host: HTMLElement, id: string): unknown | Promise<unknown>;
}
