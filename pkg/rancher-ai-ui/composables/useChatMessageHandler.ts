import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from '@shell/composables/useI18n';
import { Message, ContentType, Role, Tag } from '../types';

export function useChatMessageHandler(options: {
  chatId: string,
}) {
  const store = useStore();
  const { t } = useI18n(store);

  const messages = computed(() => Object.values(store.getters['rancher-ai-ui/chat/getMessages'](options.chatId)) as Message[]);
  const currThinkingMsg = ref<Message>({} as Message);
  const currResultMsg = ref<Message>({} as Message);
  const error = ref('');

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
          isExpanded:  true,
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
          currResultMsg.value.content += data;
          break;
        }
        break;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error processing messages:', err);
      error.value = 'Error processing messages. Please close the chat and try again.';
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
    addMessage,
    updateMessage,
    error
  };
}