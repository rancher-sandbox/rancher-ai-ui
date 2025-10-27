import { Context, Message, Role } from '../../types';

export interface MessageTemplateFill {
  message: Message;
  payload: string;
}

export const enum ContextTag {
  SortableTableRow = '__sortable-table-row', // eslint-disable-line no-unused-vars
  DetailsState = '__details-state', // eslint-disable-line no-unused-vars
}

class TemplateMessageFactory {
  fill(ctx: Context, globalCtx: Context[]): Message {
    let messageContent = 'Hey Liz, please analyse the resource';
    let summaryContent = '';
    const contextContent = globalCtx || [];

    switch (ctx.tag) {
    case ContextTag.SortableTableRow:
    case ContextTag.DetailsState:
      const resource = ctx.value as any;

      summaryContent = `Hey Liz, please analyse ${ resource.kind }: <code>${ resource.name }</code> and troubleshoot any problems.`;
      messageContent = `Explain what the '${ resource.state }' state means for the ${ resource.kind }: ${ resource.name }.`;

      if (resource.state !== 'active' && resource.state !== 'running' && resource.state !== 'ready') {
        messageContent += `
  - Identify the cause of the issue: analyze the resource status and the associated events and determine the most likely reason it is in this state.
  - Provide a numbered list of actions to fix the issue.`;
      } else {
        messageContent += `
  - Confirm that this is the expected state and what it implies.`;
      }

      if (contextContent.findIndex((c) => c.tag === resource?.kind?.toLowerCase() && c.value === resource?.name) === -1) {
        contextContent.push({
          tag:         resource?.kind?.toLowerCase(),
          description: resource?.kind,
          icon:        ctx.icon,
          value:       resource?.name
        });
      }
      break;
    default:
      break;
    }

    return {
      role: Role.User,
      messageContent,
      summaryContent,
      contextContent,
    };
  }
}

export default new TemplateMessageFactory();