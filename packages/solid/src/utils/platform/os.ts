import { navigatorData as data } from './shared';
export const os = {
  // iPadOS 13+ reports MacIntel; distinguish it from desktop macOS.
  get ios(): boolean { return /^i(os$|p)/.test(data.lowerPlatform) || (data.lowerPlatform === 'macintel' && data.maxTouchPoints > 1); },
  get android(): boolean { return data.lowerPlatform === 'android' || data.lowerUserAgent.includes('android'); },
  get mac(): boolean { return !os.ios && data.lowerPlatform.startsWith('mac'); },
  get windows(): boolean { return data.lowerPlatform.startsWith('win'); },
  get linux(): boolean { return !os.android && /^(linux|chrome os)/.test(data.lowerPlatform); },
  get apple(): boolean { return os.mac || os.ios; },
};
