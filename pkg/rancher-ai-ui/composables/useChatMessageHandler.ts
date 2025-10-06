import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useContextHandler } from './useContextHandler';
import {
  Message, ContentType, Role, Tag, Context
} from '../types';
import { formatMessageActions } from '../utils/format';

export function useChatMessageHandler(options: {
  chatId: string,
  expandThinking: boolean
}) {
  const store = useStore();
  const t = store.getters['i18n/t'];

  const messages = computed(() => Object.values(store.getters['rancher-ai-ui/chat/getMessages'](options.chatId)) as Message[]);
  const currThinkingMsg = ref<Message>({} as Message);
  const currResultMsg = ref<Message>({} as Message);
  const error = ref<object | null>(null);

  const { selectContext, selectedContext } = useContextHandler();

  function sendMessage(prompt: string, ws: WebSocket) {
    if (prompt) {
      ws.send(formatMessage(prompt, selectedContext.value));

      addMessage({
        role:    Role.User,
        content: prompt,
      });
    }
  }

  function formatMessage(prompt: string, selectedContext: Context[]) {
    const context = selectedContext.reduce((acc, ctx) => ({
      ...acc,
      [ctx.tag]: ctx.value
    }), {});

    return JSON.stringify({
      prompt,
      context
    });
  }

  async function addMessage(message: Message) {
    return await store.dispatch('rancher-ai-ui/chat/addMessage', {
      chatId: options.chatId,
      message
    });
  }

  function updateMessage(message: Message) {
    store.commit('rancher-ai-ui/chat/updateMessage', {
      chatId: options.chatId,
      message
    });
  }

  function getMessage(messageId: string) {
    return store.getters['rancher-ai-ui/chat/getMessage']({
      chatId: options.chatId,
      messageId
    });
  }

  function onopen() {
    addMessage({
      role:    Role.System,
      content: t('ai.message.system.welcome'),
    });
  }

  async function onmessage(event: MessageEvent) {
    const data = event.data;

    try {
      switch (data) {
      case Tag.MessageStart:
        break;
      case Tag.ThinkingStart: {
        const thinkingMsgId = await addMessage({
          role:        Role.Assistant,
          content:     '',
          contentType: ContentType.Thinking,
          isExpanded:  options.expandThinking,
          completed:   false
        });

        currThinkingMsg.value = getMessage(thinkingMsgId);
        break;
      }
      case Tag.ThinkingEnd: {
        currThinkingMsg.value.content = currThinkingMsg.value.content?.replace(/[\r\n]+$/, '');
        currThinkingMsg.value.completed = true;
        const resultMsgId = await addMessage({
          role:        Role.Assistant,
          content:     '',
          contentType: ContentType.Result,
          completed:   false
        });

        currResultMsg.value = getMessage(resultMsgId);
        break;
      }
      case Tag.MessageEnd:
        currResultMsg.value.content = currResultMsg.value.content?.replace(/[\r\n]+$/, '');
        currResultMsg.value.completed = true;
        break;
      default:
        if (currThinkingMsg.value.completed === false) {
          if (!currThinkingMsg.value.content && data.trim() === '') {
            break;
          }
          currThinkingMsg.value.content += data;
          break;
        }
        if (currResultMsg.value.completed === false) {
          if (!currResultMsg.value.content && data.trim() === '') {
            break;
          }

          if (data.startsWith(Tag.McpResultStart) && data.endsWith(Tag.McpResultEnd)) {
            currResultMsg.value.actions = formatMessageActions(data);

            currResultMsg.value.content += 'List of resources: \n';
            break;
          }

          currResultMsg.value.content += data;
          break;
        }
        break;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error processing messages:', err);
      error.value = { message: 'Error processing messages. Please close the chat and try again.' };
    }
  }

  async function onclose() {
    addMessage({
      role:    Role.System,
      content: t('ai.message.system.disconnected'),
    });
  }

  return {
    onopen,
    onclose,
    onmessage,
    messages,
    sendMessage,
    addMessage,
    updateMessage,
    selectContext,
    error
  };
}