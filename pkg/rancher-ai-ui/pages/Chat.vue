<script lang="ts" setup>
import { onMounted, onBeforeUnmount } from 'vue';
import {
  AGENT_NAME, AGENT_NAMESPACE, AGENT_API_PATH, AI_AGENT_NAME, AI_AGENT_VERSION
} from '../product';
import { useConnectionHandler } from '../composables/useConnectionHandler';
import { useChatMessageHandler } from '../composables/useChatMessageHandler';
import { useContextHandler } from '../composables/useContextHandler';
import { Role } from '../types';
import Messages from '../components/panels/Messages.vue';
import Input from '../components/panels/Input.vue';

function useChat() {
  const chatId = 'default';

  const {
    messages,
    onopen,
    onmessage,
    onclose,
    addMessage,
    updateMessage,
    error: chatError
  } = useChatMessageHandler({ chatId });

  const {
    ws,
    connect,
    disconnect,
    error: wsError
  } = useConnectionHandler({
    onopen,
    onmessage,
    onclose,
  });

  const {
    context,
    selectContext,
    formattedContext
  } = useContextHandler();

  function sendMessage(content: string) {
    if (content) {
      ws.value?.send(formattedContext.value + content);

      addMessage({
        role: Role.User,
        content,
      });
    }
  }

  onMounted(() => connect(AGENT_NAMESPACE, AGENT_NAME, AGENT_API_PATH));
  onBeforeUnmount(disconnect);

  return {
    ws,
    wsError,
    messages,
    context,
    chatError,
    sendMessage,
    updateMessage,
    selectContext,
  };
}

const {
  ws, messages, context, wsError, chatError, sendMessage, updateMessage, selectContext
} = useChat();
</script>

<template>
  <div class="chat-container">
    <Messages
      :messages="messages"
      @update:message="updateMessage"
    />
    <Input
      :context="context"
      :agent="{
        name: AI_AGENT_NAME,
        version: AI_AGENT_VERSION
      }"
      :disabled="!ws || ws.readyState === 3 || !!wsError || !!chatError"
      :error="wsError || chatError"
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
