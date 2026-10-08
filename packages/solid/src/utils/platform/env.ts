import { navigatorData } from './shared';
export const env = { get jsdom() { return /jsdom|happydom/.test(navigatorData.lowerUserAgent); } };
