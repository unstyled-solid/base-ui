// Live-docs regression. Reuses an existing server; owns only its Chromium browser.
// Run: rtk proxy node packages/solid/src/tooltip/Tooltip.docs-hover.live.mjs
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const origin = process.env.DOCS_TEST_URL ?? 'http://127.0.0.1:5173';
const browser = await chromium.launch();
const diagnostics = [];
const errors = [];
const evidence = [];
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.setDefaultTimeout(7000);
  page.on('console', message => {
    if (['warning', 'error'].includes(message.type())) {
      diagnostics.push(message.text());
      console.error(message.text());
    }
  });
  page.on('pageerror', error => { errors.push(error.stack ?? String(error)); });
  await page.goto(`${origin}/solid/components/tooltip`);
  const demo = page.locator('[data-demo-id="tooltip/hero"] [data-demo]');
  await demo.waitFor();
  for (const [index, name] of ['Bold', 'Italic', 'Underline', 'Bold'].entries()) {
    const trigger = demo.getByRole('button', { name, exact: true });
    await trigger.evaluate(node => {
      window.__tooltipHoverEvidence = { node, events: [], started: performance.now() };
      const record = event => window.__tooltipHoverEvidence.events.push({
        type: event.type, trusted: event.isTrusted, target: event.target.tagName,
        pointerType: event.pointerType, elapsed: performance.now() - window.__tooltipHoverEvidence.started,
      });
      const types = ['pointerenter', 'mouseenter', 'mousemove'];
      types.forEach(type => node.addEventListener(type, record));
      window.__tooltipHoverEvidence.cleanup = () => types.forEach(type => node.removeEventListener(type, record));
    });
    await trigger.locator('svg').hover();
    // Pinned React TooltipPopup does not supply role="tooltip". Locate the
    // popup itself (not its presentation positioner) independently of that role.
    const popup = page.locator('[data-base-ui-focusable][data-side]').filter({ hasText: new RegExp(`^${name}$`) });
    await popup.waitFor();
    const popupNode = await popup.elementHandle();
    await page.waitForFunction(node => Number(getComputedStyle(node).opacity) === 1, popupNode);
    await popupNode.dispose();
    assert.ok(await popup.isVisible());
    const rect = await popup.boundingBox();
    assert.ok(rect?.width > 0 && rect?.height > 0);
    const result = await popup.evaluate((node, name) => {
      const recorded = window.__tooltipHoverEvidence;
      const trigger = recorded.node;
      const rect = trigger.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
      const style = getComputedStyle(node);
      recorded.cleanup();
      return {
        name, events: recorded.events, sameTrigger: trigger === document.getElementById(trigger.id),
        triggerOpen: trigger.hasAttribute('data-popup-open'), hitInsideTrigger: trigger.contains(hit),
        role: node.getAttribute('role'), describedBy: trigger.getAttribute('aria-describedby'), instant: node.getAttribute('data-instant'),
        style: { opacity: style.opacity, display: style.display, visibility: style.visibility, pointerEvents: style.pointerEvents },
        rect: node.getBoundingClientRect().toJSON(),
      };
    }, name);
    assert.ok(result.sameTrigger && result.triggerOpen && result.hitInsideTrigger);
    assert.ok(result.events.some(event => event.type === 'mouseenter' && event.trusted));
    assert.ok(result.events.some(event => event.type === 'mousemove' && event.trusted));
    assert.equal(result.role, null);
    assert.equal(result.describedBy, null);
    assert.equal(result.instant, index === 0 ? null : 'delay');
    evidence.push(result);
    await page.mouse.move(0, 0);
    await popup.waitFor({ state: 'hidden' });
    assert.equal(await trigger.getAttribute('data-popup-open'), null);
  }
  console.log(JSON.stringify({ interactionPassed: true, passed: errors.length === 0 && diagnostics.length === 0,
    origin, evidence, diagnostics, errors }, null, 2));
  assert.equal(errors.length, 0, 'Unexpected page errors; see evidence above');
  assert.equal(diagnostics.length, 0, 'Unexpected runtime diagnostics; see evidence above');
} finally {
  await browser.close();
}
