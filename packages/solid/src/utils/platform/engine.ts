import { navigatorData } from './shared';
export const engine = {
  get webkit(): boolean { return typeof CSS !== 'undefined' && !!CSS.supports?.('-webkit-backdrop-filter:none'); },
  get gecko(): boolean { return !engine.webkit && navigatorData.lowerUserAgent.includes('firefox'); },
  get blink(): boolean { return !engine.webkit && navigatorData.lowerUserAgent.includes('chrom'); },
};
