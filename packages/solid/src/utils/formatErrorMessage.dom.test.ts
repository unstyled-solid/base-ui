import { expect, it } from 'vitest';
import formatErrorMessage, { createFormatErrorMessage } from './formatErrorMessage';
it('source default formatter with code only and repeated arguments', () => {
  expect(formatErrorMessage(123)).toBe('Base UI error #123; visit https://base-ui.com/production-error?code=123 for the full message.');
  expect(formatErrorMessage(456, 'arg1', 'arg2')).toBe('Base UI error #456; visit https://base-ui.com/production-error?code=456&args%5B%5D=arg1&args%5B%5D=arg2 for the full message.');
});
it('source custom URL and prefix, arguments and special characters', () => {
  expect(createFormatErrorMessage('https://example.com/errors', 'My Library')(789)).toBe('My Library error #789; visit https://example.com/errors?code=789 for the full message.');
  expect(createFormatErrorMessage('https://custom.dev/error-page', 'Custom UI')(100, 'foo', 'bar')).toBe('Custom UI error #100; visit https://custom.dev/error-page?code=100&args%5B%5D=foo&args%5B%5D=bar for the full message.');
  expect(createFormatErrorMessage('https://example.com/errors', 'Test')(1, 'hello world', 'foo&bar')).toBe('Test error #1; visit https://example.com/errors?code=1&args%5B%5D=hello+world&args%5B%5D=foo%26bar for the full message.');
});
