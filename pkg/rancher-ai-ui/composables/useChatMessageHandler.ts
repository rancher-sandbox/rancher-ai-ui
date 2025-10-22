import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useContextHandler } from './useContextHandler';
import { Message, Role, Tag, Context } from '../types';
import { formatMessageLinkActions, formatConfirmationAction } from '../utils/format';

export function useChatMessageHandler(options: {
  chatId: string,
  expandThinking: boolean
}) {
  const store = useStore();
  const t = store.getters['i18n/t'];

  const messages = computed(() => Object.values(store.getters['rancher-ai-ui/chat/messages'](options.chatId)) as Message[]);
  const currentMsg = ref<Message>({} as Message);
  const error = computed(() => store.getters['rancher-ai-ui/chat/error'](options.chatId));

  const { selectContext, selectedContext } = useContextHandler();

  function sendMessage(prompt: string, ws: WebSocket) {
    if (prompt) {
      ws.send(formatMessage(prompt, selectedContext.value));

      addMessage({
        role:           Role.User,
        messageContent: prompt,
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

  function confirmMessage(confirmed: boolean, ws: WebSocket) {
    const msg = JSON.stringify({ prompt: confirmed ? 'yes' : 'no' });

    ws.send(msg);
  }

  function getMessage(messageId: string) {
    return store.getters['rancher-ai-ui/chat/message']({
      chatId: options.chatId,
      messageId
    });
  }

  function onopen() {
    addMessage({
      role:           Role.System,
      messageContent: t('ai.message.system.welcome'),
    });
  }

  async function onmessage(event: MessageEvent) {
    const data = event.data;

    try {
      switch (data) {
      case Tag.MessageStart:
        const msgId = await addMessage({
          role:                     Role.Assistant,
          thinkingContent: '',
          messageContent:  '',
          showThinking:             options.expandThinking,
          thinking:                 false,
          completed:                false
        });

        currentMsg.value = getMessage(msgId);
        break;
      case Tag.ThinkingStart: {
        currentMsg.value.thinking = true;
        break;
      }
      case Tag.ThinkingEnd: {
        currentMsg.value.thinking = false;
        break;
      }
      case Tag.MessageEnd:
        currentMsg.value.messageContent = currentMsg.value.messageContent?.replace(/[\r\n]+$/, '');
        currentMsg.value.thinking = false;
        currentMsg.value.completed = true;
        break;
      default:
        if (currentMsg.value.completed === false && currentMsg.value.thinking === true) {
          if (!currentMsg.value.thinkingContent && data.trim() === '') {
            break;
          }
          currentMsg.value.thinkingContent += data;
          break;
        }
        if (currentMsg.value.completed === false && currentMsg.value.thinking === false) {
          if (!currentMsg.value.messageContent && data.trim() === '') {
            break;
          }

          if (data.startsWith(Tag.McpResultStart) && data.endsWith(Tag.McpResultEnd)) {
            currentMsg.value.linkActions = formatMessageLinkActions(data);
            break;
          }

          if (data.startsWith(Tag.ConfirmationStart) && data.endsWith(Tag.ConfirmationEnd)) {
            currentMsg.value.confirmationAction = formatConfirmationAction(data);
            currentMsg.value.thinking = false;
            currentMsg.value.completed = true;
            break;
          }

          currentMsg.value.messageContent += data;
          break;
        }
        break;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error processing messages:', err);
      store.commit('rancher-ai-ui/chat/setError', {
        chatId: options.chatId,
        error:  { key: 'ai.error.message.processing' }
      });
    }
  }

  function resetChatError() {
    store.commit('rancher-ai-ui/chat/setError', {
      chatId: options.chatId,
      error:  null
    });
  }

  onMounted(() => {
    store.commit('rancher-ai-ui/chat/initChat', options.chatId);
  });

  return {
    onopen,
    onmessage,
    messages,
    sendMessage,
    addMessage,
    updateMessage,
    confirmMessage,
    selectContext,
    resetChatError,
    error
  };
}