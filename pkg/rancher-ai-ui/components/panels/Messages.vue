<script lang="ts" setup>
import {
  ref, computed, watch, nextTick, onMounted, onBeforeUnmount
} from 'vue';
import type { PropType } from 'vue';
import { useStore } from 'vuex';
import { Message, FormattedMessage, Role, ChatError } from '../../types';
import MessageComponent from '../message/index.vue';
import { formatMessageContent } from '../../utils/format';

const store = useStore();
const t = store.getters['i18n/t'];

const props = defineProps({
  messages: {
    type:    Array as PropType<Message[]>,
    default: () => [],
  },
  errors: {
    type:    Array as PropType<ChatError[]>,
    default: () => [],
  },
  pendingConfirmation: {
    type:    Boolean,
    default: false,
  }
});

const emit = defineEmits(['update:message', 'confirm:message', 'send:message']);

const messagesView = ref<HTMLDivElement | null>(null);
const autoScrollEnabled = ref(true);

const formattedMessages = computed<FormattedMessage[]>(() => {
  return [...props.messages]
    .filter((m) => m.messageContent ||
      m.thinkingContent ||
      m.confirmation ||
      m.suggestionActions?.length
    )
    .map((m) => ({
      ...m,
      formattedMessageContent:  m.role === Role.Assistant || !!m.summaryContent ? formatMessageContent(m.messageContent || '') : m.messageContent,
      formattedThinkingContent: m.role === Role.Assistant ? formatMessageContent(m.thinkingContent || '') : '',
    }))
    .sort((a, b) => ((Number(a.timestamp) || 0) - (Number(b.timestamp) || 0)) || (`${ a.id  }`).localeCompare(`${ b.id  }`));
});

const errorMessages = computed<FormattedMessage[]>(() => {
  return props.errors.map((error) => ({
    role:                    Role.System,
    formattedMessageContent: error.message || t(error.key),
    timestamp:               new Date(),
    completed:               true,
    isError:                 true,
    actions:                 error.action ? [error.action] : []
  }));
});

const disabled = computed(() => props.errors.length > 0);

function handleScroll() {
  const container = messagesView.value;

  if (!container) {
    return;
  }

  autoScrollEnabled.value = container.scrollTop + container.clientHeight >= container.scrollHeight - 2;
}

watch(
  () => props.messages,
  (messages) => {
    nextTick(() => {
      const toScroll = autoScrollEnabled.value || (messages && messages[messages.length - 1]?.role === Role.User);

      if (messagesView.value && toScroll) {
        messagesView.value.scrollTop = messagesView.value.scrollHeight;
      }
    });
  },
  {
    immediate: true,
    deep:      true
  }
);

const stopErrorWatcher = watch(
  () => props.errors,
  (neu, old) => {
    nextTick(() => {
      if (messagesView.value && (neu || []).length > (old || []).length) {
        messagesView.value.scrollTop = messagesView.value.scrollHeight;
        stopErrorWatcher();
      }
    });
  },
  {
    immediate: true,
    deep:      true
  }
);

onMounted(() => {
  if (messagesView.value) {
    messagesView.value.addEventListener('scroll', handleScroll);
  }
});

onBeforeUnmount(() => {
  if (messagesView.value) {
    messagesView.value.removeEventListener('scroll', handleScroll);
  }
});
</script>

<template>
  <div
    ref="messagesView"
    class="chat-messages"
  >
    <MessageComponent
      v-for="(message, i) in formattedMessages"
      :key="i"
      :message="message"
      :disabled="disabled"
      :pending-confirmation="pendingConfirmation"
      @update:message="emit('update:message', message)"
      @confirm:message="emit('confirm:message', $event)"
      @send:message="emit('send:message', $event)"
    />
    <MessageComponent
      v-for="(error, i) in errorMessages"
      :key="i"
      :message="error"
    />
  </div>
</template>

<style lang='scss' scoped>
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 10px 0 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
