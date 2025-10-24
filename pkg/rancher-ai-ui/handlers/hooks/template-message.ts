import { Store } from 'vuex';
import { Context, Message, Role } from '../../types';
import { formatMessageWithContext } from '../../utils/format';

export interface MessageTemplateFill {
  message: Message;
  payload: string;
}

export const enum ContextTag {
  SortableTableRow = '__sortable-table-row', // eslint-disable-line no-unused-vars
  DetailsState = '__details-state', // eslint-disable-line no-unused-vars
}

class TemplateMessageFactory {
  fill(store: Store<any>, context: Context): MessageTemplateFill {
    let messageContent = 'Hey Liz, please analyse the resource';
    let summaryContent = '';

    switch (context.tag) {
    case ContextTag.SortableTableRow:
    case ContextTag.DetailsState:
      const resource = context.value as any;

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
      break;
    default:
      break;
    }

    const payload = formatMessageWithContext(
      messageContent,
      store.getters['rancher-ai-ui/context/all']
    );

    return {
      message: {
        role: Role.User,
        messageContent,
        summaryContent
      },
      payload,
    };
  }
}

export default new TemplateMessageFactory();