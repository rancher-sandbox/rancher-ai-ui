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
  <div class="panel-container">
    <div
      class="resize-bar"
      @mousedown.prevent.stop="resize"
      @touchstart.prevent.stop="resize"
    />
    <div class="chat-container">
      <Header
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
  </div>
</template>

<style lang='scss' scoped>
.panel-container {
  display: flex;
  flex-direction: row;
  height: calc(100vh - 55px);
}

.chat-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  padding: 16px;
}

.chat-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  max-width: 100%;
  align-items: center;
  overflow-x: auto;
  padding-bottom: 4px;
}

.tag {
  max-width: 200px;
  height: 25px;
  line-height: 1;
  padding: 0 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: #f2f6fa;
  border-radius: 4px;
}

.resize-bar {
  width: 4px;
  height: 100%;
  cursor: ew-resize;
  background: transparent;
  transition: background 0.2s;
  z-index: 10;

  &:hover {
    background: var(--primary);
  }
}
</style>
