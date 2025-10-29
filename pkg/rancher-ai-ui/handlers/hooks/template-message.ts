import { Context, Message, Role } from '../../types';

export interface MessageTemplateFill {
  message: Message;
  payload: string;
}

export const enum ContextTag {
  SortableTableRow = '__sortable-table-row', // eslint-disable-line no-unused-vars
  DetailsState = '__details-state', // eslint-disable-line no-unused-vars
  StatusBanner = '__details-state-banner', // eslint-disable-line no-unused-vars
}

class TemplateMessageFactory {
  fill(ctx: Context, globalCtx: Context[]): Message {
    let messageContent = 'Hey Liz, please analyse the resource';
    let summaryContent = '';

    const resource = ctx.value as any;

    // Add resource as context
    const resourceCtx = [{
      tag:         resource?.kind?.toLowerCase(),
      description: resource?.kind,
      icon:        ctx.icon,
      value:       resource?.name
    }];

    // Add resource's namespace as context if available
    const resourceNamespaceCtx = resource?.namespace ? [{
      tag:         'namespace',
      description: 'Namespace',
      icon:        'icon-namespace',
      value:       resource?.namespace
    }] : [];

    switch (ctx.tag) {
    case ContextTag.SortableTableRow:
    case ContextTag.DetailsState:
      summaryContent = `Hey Liz, please analyse ${ resource.kind }: <strong>${ resource.name }</strong> and troubleshoot any problems.`;
      messageContent = `Explain what the '${ resource.state }' state means for the ${ resource.kind }: ${ resource.name }.`;

      if (resource.state !== 'active' && resource.state !== 'running' && resource.state !== 'ready') {
        messageContent += `
  - Identify the cause of the issue: analyze the resource status and the associated events and determine the most likely reason it is in this state.
  - Provide a numbered list of actions to fix the issue.`;
      } else {
        messageContent += `
  - Confirm that this is the expected state and what it implies.`;
      }
      break;
    case ContextTag.StatusBanner:
      const { label, color } = resource.bannerProps || {};

      summaryContent = `Hey Liz, please analyse the <strong>"${ label }"</strong> message and troubleshoot ${ color === 'error' ? 'the error' : 'any problems' }.`;
      messageContent = `Explain what the '${ resource.state }' state means for the ${ resource.kind }: ${ resource.name }.`;

      if (resource.state !== 'active' && resource.state !== 'running' && resource.state !== 'ready') {
        messageContent += `
  - Identify the cause of the issue: analyze the resource status and the associated events and determine the most likely reason it is in this state.
  - Provide a numbered list of actions to fix the issue.`;
      } else {
        messageContent += `
  - Confirm that this is the expected state and what it implies.`;
      }
      break;
    default:
      break;
    }

    const contextContent = [
      ...(globalCtx || []),
      ...resourceCtx,
      ...resourceNamespaceCtx
    ].filter((item, index, self) => index === self.findIndex((c) => c.tag === item.tag && c.value === item.value));

    return {
      role: Role.User,
      messageContent,
      summaryContent,
      contextContent,
    };
  }
}

export default new TemplateMessageFactory();