import { expect } from 'vitest';
import { browserCase } from '../../test/sourceCase';
import { visuallyHidden } from './visuallyHidden';
for (const [scrollerDirection, contentDirection] of [['ltr', 'ltr'], ['ltr', 'rtl'], ['rtl', 'ltr'], ['rtl', 'rtl']]) {
  browserCase({ source: 'packages/utils/src/visuallyHidden.test.tsx', case: `does not overflow ${scrollerDirection} scroller with ${contentDirection} content`, environment: 'browser', issue: 'bsolid-dom-browser-replay', adaptation: 'Native fixture with Solid CSS properties and explicit pixel units, replacing React renderer' }, () => {
    const scroller = document.createElement('div'); scroller.dir = scrollerDirection;
    scroller.style.cssText = 'width:100px;height:100px;overflow:auto';
    const content = document.createElement('div'); content.dir = contentDirection; content.style.transform = 'translateY(20px)';
    const input = document.createElement('input'); input.type = 'radio';
    for (const [name, value] of Object.entries(visuallyHidden)) input.style.setProperty(name, String(value));
    content.append(input); scroller.append(content); document.body.append(scroller);
    try { expect(scroller.scrollWidth).toBe(scroller.clientWidth); } finally { scroller.remove(); }
  });
}
