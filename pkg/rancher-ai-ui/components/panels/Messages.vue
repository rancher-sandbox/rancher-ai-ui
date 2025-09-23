<script lang="ts" setup>
import {
  ref, computed, watch, nextTick, onMounted, onBeforeUnmount
} from 'vue';
import type { PropType } from 'vue';
import { Message } from '../../types';
import MessageComponent from '../message/index.vue';

const props = defineProps({
  messages: {
    type:    Array as PropType<Message[]>,
    default: () => [],
  }
});

const messagesContainer = ref<HTMLDivElement | null>(null);
const autoScrollEnabled = ref(true);

const sortedMessages = computed(() => {
  return [...props.messages]
    .filter((m) => m.content)
    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
});

function handleScroll() {
  const container = messagesContainer.value;

  if (!container) {
    return;
  }
  autoScrollEnabled.value =
    container.scrollTop + container.clientHeight >= container.scrollHeight - 2;
}

watch(
  () => props.messages,
  () => {
    nextTick(() => {
      if (messagesContainer.value && autoScrollEnabled.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    });
  },
  {
    immediate: true,
    deep:      true
  }
);

onMounted(() => {
  if (messagesContainer.value) {
    messagesContainer.value.addEventListener('scroll', handleScroll);
  }
});

onBeforeUnmount(() => {
  if (messagesContainer.value) {
    messagesContainer.value.removeEventListener('scroll', handleScroll);
  }
});
</script>

<template>
  <div
    ref="messagesContainer"
    class="messages-container"
  >
    <MessageComponent
      v-for="(message, i) in sortedMessages"
      :key="i"
      :message="message"
    />
  </div>
</template>

<style lang='scss' scoped>
.messages-container {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-right: 0.5rem;
}

.messages-container::-webkit-scrollbar-thumb {
  background-color: #4b5563;
  border-radius: 4px;
}
</style>
