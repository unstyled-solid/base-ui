/** The final browser runner supplies its real pointer driver; DOM events cannot reset it. */
export async function resetBrowserPointer(driver?: { unhover: (element: HTMLElement) => Promise<unknown> }) {
  if (/jsdom/.test(window.navigator.userAgent)) return;
  const pointer = driver ?? (await import('vitest/browser')).userEvent;
  await pointer.unhover(document.body);
}
