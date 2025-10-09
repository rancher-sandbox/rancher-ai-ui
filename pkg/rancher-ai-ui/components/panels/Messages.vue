<script lang="ts" setup>
import {
  ref, computed, watch, nextTick, onMounted, onBeforeUnmount
} from 'vue';
import type { PropType } from 'vue';
import { useStore } from 'vuex';
import MarkdownIt from 'markdown-it';
import { Message, FormattedMessage, Role, ChatError } from '../../types';
import MessageComponent from '../message/index.vue';

const store = useStore();
const t = store.getters['i18n/t'];

const props = defineProps({
  messages: {
    type:    Array as PropType<Message[]>,
    default: () => [],
  },
  disabled: {
    type:    Boolean,
    default: false,
  },
  error: {
    type:    Object as PropType<ChatError | null>,
    default: null,
  }
});

const emit = defineEmits(['update:message']);

const chatMessages = ref<HTMLDivElement | null>(null);
const autoScrollEnabled = ref(true);

const md = new MarkdownIt({
  html:        true,
  breaks:      true,
  linkify:     true,
  typographer: true,
});

const formattedMessages = computed<FormattedMessage[]>(() => {
  return [...props.messages]
    .filter((m) => m.messageContent || m.thinkingContent)
    .map((m) => ({
      ...m,
      formattedMessageContent:  m.role === Role.Assistant ? md.render(m.messageContent || '') : m.messageContent,
      formattedThinkingContent: m.role === Role.Assistant ? md.render(m.thinkingContent || '') : '',
    }))
    .sort((a, b) => ((Number(a.timestamp) || 0) - (Number(b.timestamp) || 0)) || (`${ a.id  }`).localeCompare(`${ b.id  }`));
});

const errorMessage = computed<FormattedMessage | null>(() => {
  if (props.error) {
    return {
      role:                    Role.System,
      formattedMessageContent: t(props.error.key),
      timestamp:               new Date(),
      completed:               true,
      isError:                 true,
    };
  }

  return null;
});

function handleScroll() {
  const container = chatMessages.value;

  if (!container) {
    return;
  }

  autoScrollEnabled.value = container.scrollTop + container.clientHeight >= container.scrollHeight - 2;
}

watch(
  () => props.messages,
  () => {
    nextTick(() => {
      if (chatMessages.value && autoScrollEnabled.value) {
        chatMessages.value.scrollTop = chatMessages.value.scrollHeight;
      }
    });
  },
  {
    immediate: true,
    deep:      true
  }
);

onMounted(() => {
  if (chatMessages.value) {
    chatMessages.value.addEventListener('scroll', handleScroll);
  }
});

onBeforeUnmount(() => {
  if (chatMessages.value) {
    chatMessages.value.removeEventListener('scroll', handleScroll);
  }
});
</script>

<template>
  <div
    ref="chatMessages"
    class="chat-messages"
  >
    <MessageComponent
      v-for="(message, i) in formattedMessages"
      :key="i"
      :message="message"
      :disabled="disabled"
      @update:message="emit('update:message', message)"
      @enable:autoscroll="autoScrollEnabled = $event"
    />
    <MessageComponent
      v-if="errorMessage"
      :message="errorMessage"
    />
  </div>
</template>

<style lang='scss' scoped>
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 8px 0 8px;
  background: #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
