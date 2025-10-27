import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useContextComposable } from './useContextComposable';
import { ConfirmationStatus, Message, Role, Tag } from '../types';
import {
  formatMessageWithContext, formatMessageRelatedResourcesActions, formatConfirmationAction, formatSuggestionActions, formatFileMessages
} from '../utils/format';
import { downloadFile } from '@shell/utils/download';
import { NORMAN } from '@shell/config/types';

const CHAT_ID = 'default';
const EXPAND_THINKING = false;

export function useChatMessageComposable() {
  const store = useStore();
  const t = store.getters['i18n/t'];

  const messages = computed(() => Object.values(store.getters['rancher-ai-ui/chat/messages'](CHAT_ID)) as Message[]);
  const currentMsg = ref<Message>({} as Message);
  const error = computed(() => store.getters['rancher-ai-ui/chat/error'](CHAT_ID));

  const pendingConfirmation = computed(() => {
    return messages.value.find((msg) => msg.confirmation?.status === ConfirmationStatus.Pending);
  });

  const { selectContext, selectedContext } = useContextComposable();

  function sendMessage(prompt: string, ws: WebSocket) {
    if (prompt) {
      ws.send(formatMessageWithContext(prompt, selectedContext.value));

      addMessage({
        role:           Role.User,
        messageContent: prompt,
        contextContent: selectedContext.value
      });
    }
  }

  async function addMessage(message: Message) {
    return await store.dispatch('rancher-ai-ui/chat/addMessage', {
      chatId: CHAT_ID,
      message
    });
  }

  function updateMessage(message: Message) {
    store.commit('rancher-ai-ui/chat/updateMessage', {
      chatId: CHAT_ID,
      message
    });
  }

  function confirmMessage(result: boolean, ws: WebSocket) {
    const msg = JSON.stringify({ prompt: result ? 'yes' : 'no' });

    ws.send(msg);

    updateMessage({
      ...currentMsg.value,
      confirmation: {
        action: currentMsg.value.confirmation?.action || null,
        status: result ? ConfirmationStatus.Confirmed : ConfirmationStatus.Canceled
      },
    });
  }

  function getMessage(messageId: string) {
    return store.getters['rancher-ai-ui/chat/message']({
      chatId: CHAT_ID,
      messageId
    });
  }

  function onopen() {
    if (messages.value.length > 0) {
      return;
    }

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
          showThinking:             EXPAND_THINKING,
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
            currentMsg.value.relatedResourcesActions = formatMessageRelatedResourcesActions(data);
            break;
          }

          if (data.startsWith(Tag.ConfirmationStart) && data.endsWith(Tag.ConfirmationEnd)) {
            const confirmationAction = formatConfirmationAction(data);

            if (confirmationAction) {
              currentMsg.value.confirmation = {
                action: confirmationAction,
                status: ConfirmationStatus.Pending,
              };
              currentMsg.value.thinking = false;
              currentMsg.value.completed = true;

              break;
            }
          }

          currentMsg.value.messageContent += data;

          if (currentMsg.value.messageContent?.includes(Tag.SuggestionsStart) && currentMsg.value.messageContent?.includes(Tag.SuggestionsEnd)) {
            const { suggestionActions, remaining } = formatSuggestionActions(currentMsg.value.suggestionActions || [], currentMsg.value.messageContent);

            currentMsg.value.suggestionActions = suggestionActions;
            currentMsg.value.messageContent = remaining;
            break;
          }

          break;
        }
        break;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error processing messages:', err);
      store.commit('rancher-ai-ui/chat/setError', {
        chatId: CHAT_ID,
        error:  { key: 'ai.error.message.processing' }
      });
    }
  }

  function resetChatError() {
    store.commit('rancher-ai-ui/chat/setError', {
      chatId: CHAT_ID,
      error:  null
    });
  }

  function downloadMessages() {
    const principal = store.getters['rancher/byId'](NORMAN.PRINCIPAL, store.getters['auth/principalId']) || {};

    downloadFile(
      `Rancher-liz-chat-${ CHAT_ID }_${ new Date().toISOString().slice(0, 10) }.txt`,
      formatFileMessages(principal, messages.value)
    );
  }

  function resetMessages() {
    store.commit('rancher-ai-ui/chat/resetMessages', CHAT_ID);
  }

  onMounted(() => {
    store.commit('rancher-ai-ui/chat/init', CHAT_ID);
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
    downloadMessages,
    resetMessages,
    pendingConfirmation,
    error
  };
}