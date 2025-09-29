<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from '@shell/composables/useI18n';
import {
  AGENT_NAME, AGENT_NAMESPACE, AGENT_API_PATH, AI_AGENT_NAME, AI_AGENT_VERSION
} from '../product';
import { Message, ContentType, Role, Tag } from '../types';
import Messages from './panels/Messages.vue';
import Input from './panels/Input.vue';
import type { Context } from '../types';

const store = useStore();
const { t } = useI18n(store);

function useChat() {
  const ws = ref<WebSocket | null>(null);
  const messages = ref<Message[]>([]);
  const error = ref('');

  const context = computed(() => store.getters['ui-context/all']);
  const selectedContext = ref<Context[]>([]);
  const formattedContext = ref('');

  function connect() {
    const url = `wss://${ window.location.host }/api/v1/namespaces/${ AGENT_NAMESPACE }/services/http:${ AGENT_NAME }:80/proxy/${ AGENT_API_PATH }`;

    try {
      const socket = new WebSocket(url);

      socket.onopen = onopen;
      socket.onmessage = onmessage;
      socket.onclose = onclose;
      socket.onerror = (e) => {
        // eslint-disable-next-line no-console
        console.error('WebSocket error: ', e);
        error.value = 'WebSocket error occurred. Please try again later.';
      };

      ws.value = socket;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('WebSocket connection error: ', e);
      error.value = 'Failed to connect to the server. Please try again later.';
    }
  }

  function disconnect() {
    if (ws.value) {
      ws.value.close();
      ws.value = null;
    }
  }

  function onopen() {
    messages.value.push({
      role:    Role.System,
      content: t('ai.message.system.welcome'),
    });
  }

  function onmessage(event: MessageEvent) {
    const data = event.data;

    try {
      const inProgressMsgs = messages.value.filter((m) => m.role === Role.Assistant && !m.completed);

      const lastResultMsg = inProgressMsgs.findLast((m) => m.contentType === ContentType.Result) || {} as Message;
      const lastThinkingMsg = inProgressMsgs.findLast((m) => m.contentType === ContentType.Thinking) || {} as Message;

      switch (data) {
      case Tag.MessageStart:
        break;
      case Tag.ThinkingStart:
        // Start a new thinking message
        messages.value.push({
          role:        Role.Assistant,
          content:     '',
          contentType: ContentType.Thinking,
          completed:   false
        });
        break;
      case Tag.ThinkingEnd:
        // Finalize thinking message and move to messages
        lastThinkingMsg.content = lastThinkingMsg.content?.replace(/[\r\n]+$/, '');
        lastThinkingMsg.completed = true;

        // Prepare for the result message
        messages.value.push({
          role:        Role.Assistant,
          content:     '',
          contentType: ContentType.Result,
          completed:   false
        });
        break;
      case Tag.MessageEnd:
        // Finalize result message and move to messages
        lastResultMsg.content = lastResultMsg.content?.replace(/[\r\n]+$/, '');
        lastResultMsg.completed = true;
        break;
      default:
        // Thinking message will always come before result message
        if (lastThinkingMsg.completed === false) {
          if (!lastThinkingMsg.content && data.trim() === '') {
            break;
          }

          lastThinkingMsg.content += data;
          break;
        }
        // Append to the current result message - thinking should be done by now
        if (lastResultMsg.completed === false) {
          // Remove initial empty messages
          if (!lastResultMsg.content && data.trim() === '') {
            break;
          }

          lastResultMsg.content += data;
          break;
        }
        break;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error processing message:', err);
      error.value = 'Error processing message. Please close the chat and try again.';
    }
  }

  function onclose() {
    messages.value.push({
      role:    Role.System,
      content: t('ai.message.system.disconnected'),
    });

    ws.value = null;
  }

  function sendMessage(content: string) {
    if (content) {
      ws.value?.send(formattedContext.value + content);

      messages.value.push({
        role:    Role.User,
        content,
        context: selectedContext.value,
      });
    }
  }

  function selectContext(context: Context[]) {
    selectedContext.value = context;

    if (context.length === 0) {
      formattedContext.value = '';

      return;
    }

    const contextText = selectedContext.value.map((c) => `${ c.tag } : ${ c.value } - is ${ c.description }`).join('\n');

    formattedContext.value = `Context:\n${ contextText }\n\n`;
  }

  onMounted(connect);
  onBeforeUnmount(disconnect);

  return {
    ws,
    messages,
    context,
    error,
    sendMessage,
    selectContext,
  };
}

const {
  ws, messages, context, error, sendMessage, selectContext
} = useChat();
</script>

<template>
  <div class="chat-container">
    <Messages :messages="messages" />
    <Input
      :context="context"
      :agent="{
        name: AI_AGENT_NAME,
        version: AI_AGENT_VERSION
      }"
      :disabled="!ws || !!error"
      :error="error"
      @select:context="selectContext"
      @send:message="sendMessage"
    />
  </div>
</template>

<style lang='scss' scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 90px);
  padding: 16px;
}
</style>
