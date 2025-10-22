import { ActionType, MessageActionLink, MessageActionConfirmation, Tag } from '../types';
import { validateActionResource } from './validator';

export function formatMessageLinkActions(value: string, actionType = ActionType.Button): MessageActionLink[] {
  value = value.replaceAll(Tag.McpResultStart, '').replaceAll(Tag.McpResultEnd, '').replace(/'/g, '"');

  if (value) {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed.flatMap((item) => formatMessageLinkActions(JSON.stringify(item), actionType));
      }

      if (!validateActionResource(parsed)) {
        return [];
      }

      const names = Array.isArray(parsed.name) ? parsed.name : [parsed.name];

      return names.map((name: string) => ({
        type:     actionType,
        label:    `${ parsed.kind }: ${ name }`,
        resource: {
          kind:      parsed.kind,
          type:      parsed.type,
          name,
          namespace: parsed.namespace,
          cluster:   parsed.cluster,
        },
      }));
    } catch (e) {
      console.error('Failed to parse MCP response:', e); /* eslint-disable-line no-console */
    }
  }

  return [];
}

export function formatConfirmationAction(value: string): MessageActionConfirmation | null {
  value = value.replaceAll(Tag.ConfirmationStart, '').replaceAll(Tag.ConfirmationEnd, '').replace(/'/g, '"');

  if (value) {
    try {
      const parsed = JSON.parse(value);

      return parsed;
    } catch (e) {
      console.error('Failed to parse confirmation response:', e); /* eslint-disable-line no-console */
    }
  }

  return null;
}