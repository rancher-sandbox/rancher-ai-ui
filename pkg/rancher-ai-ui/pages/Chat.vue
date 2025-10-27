<script lang="ts" setup>
import { onMounted, onBeforeUnmount, computed, nextTick } from 'vue';
import { AGENT_NAME, AGENT_NAMESPACE, AGENT_API_PATH } from '../product';
import { useConnectionComposable } from '../composables/useConnectionComposable';
import { useChatMessageComposable } from '../composables/useChatMessageComposable';
import { useContextComposable } from '../composables/useContextComposable';
import { useHeaderComposable } from '../composables/useHeaderComposable';
import { useAgentComposable } from '../composables/useAgentComposable';
import Header from '../components/panels/Header.vue';
import Messages from '../components/panels/Messages.vue';
import Context from '../components/panels/Context.vue';
import Console from '../components/panels/Console.vue';
import HooksHandler from '../handlers/hooks';

const { agent, error: agentError } = useAgentComposable();

const {
  messages,
  onopen,
  onmessage,
  sendMessage,
  updateMessage,
  confirmMessage,
  downloadMessages,
  resetMessages,
  selectContext,
  resetChatError,
  pendingConfirmation,
  error: messageError
} = useChatMessageComposable();

const {
  ws,
  connect,
  disconnect,
  error: wsError
} = useConnectionComposable({
  onopen,
  onmessage,
});

const { context } = useContextComposable();

const {
  resize,
  close: closePanel,
  restore,
} = useHeaderComposable();

// Agent errors are priority over websocket and message errors
const errors = computed(() => {
  if (agentError.value) {
    return [agentError.value];
  } else {
    return [
      wsError.value,
      messageError.value
    ].filter((e) => e);
  }
});

function close() {
  resetChatError();
  closePanel();
}

function resetChat() {
  resetMessages();
  disconnect();
  nextTick(() => {
    connect(AGENT_NAMESPACE, AGENT_NAME, AGENT_API_PATH);
  });
}

function handleKeydown(event: KeyboardEvent) {
  if (HooksHandler.isShowAllHooksKey(event)) {
    event.stopPropagation();
    event.preventDefault();
  }
}

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
  restore();
}
</script>

<template>
  <div
    class="chat-container"
    tabindex="0"
    @keydown="handleKeydown"
  >
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
        :errors="errors"
        :pending-confirmation="!!pendingConfirmation"
        @update:message="updateMessage"
        @confirm:message="confirmMessage($event, ws)"
        @send:message="sendMessage($event, ws)"
      />
      <Context
        :value="context"
        :disabled="errors.length > 0"
        @select="selectContext"
      />
      <Console
        :disabled="!ws || ws.readyState === 3 || errors.length > 0 || !!pendingConfirmation"
        @input:content="sendMessage($event, ws)"
        @download:chat="downloadMessages"
        @reset:chat="resetChat"
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
  background: var(--box-bg);
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
</style>

<style lang='scss'>
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
