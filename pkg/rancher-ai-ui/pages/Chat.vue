<script lang="ts" setup>
import { onMounted, onBeforeUnmount } from 'vue';
import {
  AGENT_NAME, AGENT_NAMESPACE, AGENT_API_PATH, AI_AGENT_NAME, AI_AGENT_VERSION,
  PANEL_POSITION,
  PRODUCT_NAME
} from '../product';
import { useConnectionHandler } from '../composables/useConnectionHandler';
import { useChatMessageHandler } from '../composables/useChatMessageHandler';
import { useContextHandler } from '../composables/useContextHandler';
import { useHeaderHandler } from '../composables/useHeaderHandler';
import Header from '../components/panels/Header.vue';
import Messages from '../components/panels/Messages.vue';
import Input from '../components/panels/Input.vue';

const chatPanelId = PRODUCT_NAME;
const chatId = 'default';
const expandThinking = false;

const {
  messages,
  onopen,
  onmessage,
  onclose,
  sendMessage,
  updateMessage,
  selectContext,
  error: chatError
} = useChatMessageHandler({
  chatId,
  expandThinking
});

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

const { context } = useContextHandler();

const {
  resize,
  close,
  setDefaultPosition,
} = useHeaderHandler({
  panelId:       chatPanelId,
  panelPosition: PANEL_POSITION
});

onMounted(() => {
  connect(AGENT_NAMESPACE, AGENT_NAME, AGENT_API_PATH);
  // Ensure disconnection on browser refresh/close
  window.addEventListener('beforeunload', unmount);
});

onBeforeUnmount(() => {
  unmount();
  window.removeEventListener('beforeunload', unmount);
});

function unmount() {
  disconnect();
  setDefaultPosition();
}
</script>

<template>
  <div class="chat-container">
    <Header
      @resize="resize"
      @close="close"
    />
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
      @input:content="sendMessage($event, ws)"
    />
  </div>
</template>

<style lang='scss' scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: calc(100vh - 55px);
  padding: 16px;
}
</style>
