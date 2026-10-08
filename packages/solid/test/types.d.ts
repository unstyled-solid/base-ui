declare module '*.module.css';
declare var BASE_UI_ANIMATIONS_DISABLED: boolean | undefined;
declare module 'virtual:harness-ssr' {
  const artifact: { isServer: boolean; bootstrap: string; records: { html: string; renderId: string; label: string }[] };
  export default artifact;
}
