import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// Browser mode already defines asymmetric DOM matchers with void returns. The
// jest-dom /vitest entry declares a conflicting second asymmetric interface.
// Register the actual matchers once, retaining its full ordinary assertion API.
expect.extend(matchers);
declare module 'vitest' {
  interface Assertion<T = any> extends TestingLibraryMatchers<any, T> {}
}
