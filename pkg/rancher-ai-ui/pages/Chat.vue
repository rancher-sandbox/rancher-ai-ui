<script lang="ts" setup>
import { onMounted, onBeforeUnmount } from 'vue';
import {
  AGENT_NAME, AGENT_NAMESPACE, AGENT_API_PATH,
  PANEL_POSITION,
  PRODUCT_NAME
} from '../product';
import { useConnectionHandler } from '../composables/useConnectionHandler';
import { useChatMessageHandler } from '../composables/useChatMessageHandler';
import { useContextHandler } from '../composables/useContextHandler';
import { useHeaderHandler } from '../composables/useHeaderHandler';
import { useAgentHandler } from '../composables/useAgentHandler';
import Header from '../components/panels/Header.vue';
import Messages from '../components/panels/Messages.vue';
import Context from '../components/panels/Context.vue';
import Input from '../components/panels/Input.vue';
import Banner from '@components/Banner/Banner.vue';

const chatPanelId = PRODUCT_NAME;
const chatId = 'default';
const expandThinking = false;

const { agent } = useAgentHandler();

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
    <div
      class="resize-bar"
      @mousedown.prevent.stop="resize"
      @touchstart.prevent.stop="resize"
    />
    <div class="chat-panel">
      <Header
        :agent="agent"
        @close="close"
      />
      <Messages
        :messages="messages"
        @update:message="updateMessage"
      />
      <div
        v-if="wsError || chatError"
        class="errors"
      >
        <Banner
          color="error"
          :label="wsError || chatError"
        />
      </div>
      <Context
        :value="context"
        :disabled="!!wsError || !!chatError"
        @select="selectContext"
      />
      <Input
        :disabled="!ws || ws.readyState === 3 || !!wsError || !!chatError"
        :error="{ message: 'testetstets'}"
        @input:content="sendMessage($event, ws)"
      />
    </div>
  </div>
</template>

<style lang='scss' scoped>
.chat-container {
  display: flex;
  flex-direction: row;
  height: calc(100vh - 55px);
  position: relative;
  z-index: 20;
}

.chat-panel {
  width: 100%;
  background: #f3f4f6;
  /* box-shadow: 0 4px 24px 0 rgba(0,0,0,0.10); */
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  font-family: 'Inter', Arial, sans-serif;
}

.resize-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  cursor: ew-resize;
  background: transparent;
  transition: background 0.2s;
  z-index: 20;
  opacity: 0;

  &:hover {
    background: var(--primary);
    opacity: 1;
  }
}

.errors {
  margin: 0 12px;
}
</style>
