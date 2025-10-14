import { warn } from './log';

/**
 * Utility function to validate MCP action resource format.
 * Resource type must be type of ActionResource
 *
 * @param value The value to validate
 * @returns True if the value is a valid MCP action resource, false otherwise
 */
export function validateActionResource(value: any): boolean {
  const requiredFields = ['kind', 'namespace', 'name', 'cluster', 'type'];

  if (!value || typeof value !== 'object') {
    warn('Invalid MCP resource format:', value);

    return false;
  }

  for (const field of requiredFields) {
    if (value[field] === undefined || value[field] === null) {
      warn(`Missing required field '${ field }' in MCP response:`, value);

      return false;
    }
  }

  return true;
}