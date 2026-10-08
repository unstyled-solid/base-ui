export function createFormatErrorMessage(baseUrl: string, prefix: string): (code: number, ...args: string[]) => string {
  return function formatErrorMessage(code: number, ...args: string[]): string {
    const url = new URL(baseUrl);
    url.searchParams.set('code', code.toString());
    args.forEach((arg) => url.searchParams.append('args[]', arg));
    return `${prefix} error #${code}; visit ${url} for the full message.`;
  };
}
/** For generated error-minifier imports; use literal Error messages in source. */
const formatErrorMessage = createFormatErrorMessage('https://base-ui.com/production-error', 'Base UI');
export default formatErrorMessage;
