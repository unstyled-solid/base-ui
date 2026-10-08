import { renderToString, isServer } from '@solidjs/web';
import { describe, expect, it } from 'vitest';
import { PartContext } from '../test/context';
import { TestRoot, Item, List } from '../test/host';
import { FilterDropdownInput as Input } from '../input/FilterDropdownInput';
import { FilterDropdownEmpty as Empty } from '../empty/FilterDropdownEmpty';

describe('FilterDropdown SSR', () => {
  it('renders native searchbox semantics without a premature empty announcement', () => {
    expect(isServer).toBe(true);
    const html = renderToString(() => <PartContext empty value="can"><Input /><Empty>No matches</Empty></PartContext>);
    expect(html).toContain('role="searchbox"');
    expect(html).toContain('value="can"');
    expect(html).not.toContain('No matches');
    expect(html).not.toContain('aria-expanded');
  });
  it('keeps discoverable items and excludes Empty before client registration', () => {
    const html = renderToString(() => <TestRoot open value="can"><Input /><Empty>No matches</Empty><List><Item>Canada</Item><Item>Mexico</Item></List></TestRoot>);
    expect(html).toContain('Canada');
    expect(html).toContain('Mexico');
    expect(html).not.toContain('No matches');
  });
});
