import MarkdownIt from 'markdown-it';
import {
  ActionType, MessageActionLink, MessageConfirmationAction, Tag, Context
} from '../types';
import { validateActionResource } from './validator';

const md = new MarkdownIt({
  html:        true,
  breaks:      true,
  linkify:     true,
  typographer: true,
});

export function formatMessageContent(message: string) {
  const raw = md.render(message ?? '');

  // remove trailing <br> tags and trailing whitespace/newlines
  return raw.replace(/(?:(?:<br\s*\/?>)|\r?\n|\s)+$/gi, '');
}

export function formatMessageWithContext(prompt: string, selectedContext: Context[]) {
  const context = selectedContext.reduce((acc, ctx) => ({
    ...acc,
    [ctx.tag]: ctx.value
  }), {});

  return JSON.stringify({
    prompt,
    context
  });
}

export function formatMessageLinkActions(value: string, actionType = ActionType.Button): MessageActionLink[] {
  value = value.replaceAll(Tag.McpResultStart, '').replaceAll(Tag.McpResultEnd, '').replace(/'([^']*)'/g, '"');

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
        label:    `View ${ parsed.kind }: ${ name }`,
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

export function formatConfirmationAction(value: string): MessageConfirmationAction | null {
  value = value.replaceAll(Tag.ConfirmationStart, '').replaceAll(Tag.ConfirmationEnd, '').replace(/'([^']*)'/g, '"');

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

export function formatSuggestionActions(suggestionActions: string[], remaining: string): { suggestionActions: string[]; remaining: string } {
  const re = /<suggestion\b[^>]*>([\s\S]*?)<\/suggestion>/i;
  const match = remaining?.match(re);

  if (match) {
    const inner = match[1]; // first suggestion text

    suggestionActions.push(inner.trim());
    remaining = remaining.replace(match[0], '').trim();

    if (remaining) {
      return formatSuggestionActions(suggestionActions, remaining);
    }
  }

  return {
    suggestionActions,
    remaining
  };
}
