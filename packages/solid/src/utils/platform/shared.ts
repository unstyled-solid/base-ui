interface NavigatorUAData {
  readonly brands: ReadonlyArray<{ brand: string; version: string }>;
  readonly mobile: boolean;
  readonly platform: string;
}
/** Lazy reads: importing DOM leaves never evaluates browser globals. */
export function readRawData() {
  if (typeof navigator === 'undefined') return { userAgent: '', platform: '', maxTouchPoints: 0 };
  if (process.env.NODE_ENV !== 'production') {
    const uaData = (navigator as Navigator & { userAgentData?: NavigatorUAData }).userAgentData;
    if (uaData && Array.isArray(uaData.brands)) {
      return {
        userAgent: uaData.brands.map(({ brand, version }) => `${brand}/${version}`).join(' '),
        platform: uaData.platform ?? navigator.platform ?? '',
        maxTouchPoints: navigator.maxTouchPoints ?? 0,
      };
    }
  }
  return { userAgent: navigator.userAgent, platform: navigator.platform ?? '', maxTouchPoints: navigator.maxTouchPoints ?? 0 };
}
export const navigatorData = {
  get lowerUserAgent() { return readRawData().userAgent.toLowerCase(); },
  get lowerPlatform() { return readRawData().platform.toLowerCase(); },
  get maxTouchPoints() { return readRawData().maxTouchPoints; },
};
