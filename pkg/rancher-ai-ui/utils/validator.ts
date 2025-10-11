/**
 * Utility function to validate MCP action resource format.
 * Resource type must be type of ActionResource
 *
 * @param value The value to validate
 * @returns True if the value is a valid MCP action resource, false otherwise
 */
export function validateActionResource(value: any): boolean {
  const requiredFields = ['kind', 'namespace', 'name', 'cluster'];

  if (!value || typeof value !== 'object') {
    console.warn('[Rancher AI] Invalid MCP resource format:', value); /* eslint-disable-line no-console */

    return false;
  }

  for (const field of requiredFields) {
    if (value[field] === undefined || value[field] === null) {
      console.warn(`[Rancher AI]Missing required field '${ field }' in MCP response:`, value); /* eslint-disable-line no-console */

      return false;
    }
  }

  return true;
}