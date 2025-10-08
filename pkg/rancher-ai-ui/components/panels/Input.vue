<script lang="ts" setup>
import {
  ref, computed, defineProps, defineEmits, nextTick,
  onMounted, type PropType
} from 'vue';
import { useStore } from 'vuex';
import RcButton from '@components/RcButton/RcButton.vue';
const store = useStore();
const t = store.getters['i18n/t'];

const props = defineProps({
  disabled: {
    type:    Boolean,
    default: false,
  },
  error: {
    type:    [Object, String] as PropType<object | string>,
    default: null,
  },
});

const emit = defineEmits(['input:content']);

const message = ref('');
const promptTextarea = ref<HTMLTextAreaElement | null>(null);

onMounted(() => {
  nextTick(() => {
    if (promptTextarea.value) {
      promptTextarea.value.focus();
    }
  });
});

const cleanMessage = computed(() => {
  return (message.value || '')
    .split('\n')
    .filter((line) => line.trim() !== '')
    .join('\n')
    .trim();
});

function onInputMessage(event: Event) {
  message.value = (event?.target as HTMLTextAreaElement)?.value;
  autoResizePrompt();
}

function handleTextareaKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    sendContent(event);
  }
}

function sendContent(event: Event) {
  event.preventDefault();
  event.stopPropagation();

  emit('input:content', cleanMessage.value);

  message.value = '';

  nextTick(() => {
    autoResizePrompt(36);
  });
}

function autoResizePrompt(height?: number) {
  const textarea = promptTextarea.value;

  if (textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = `${ height || textarea.scrollHeight }px`;
  }
}
</script>

<template>
  <div class="chat-input-row">
    <textarea
      ref="promptTextarea"
      class="chat-input"
      rows="1"
      :value="props.disabled ? '' : message"
      :placeholder="props.disabled ? '' : t('ai.prompt.placeholder')"
      :disabled="props.disabled"
      autocomplete="off"
      @input="onInputMessage"
      @keydown="handleTextareaKeydown"
    ></textarea>
    <div
      :class="{
        disabled: props.disabled
      }"
    >
      <RcButton
        small
        :disabled="!cleanMessage || props.disabled"
        @click="sendContent"
        @keydown.enter="sendContent"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <rect
            x="0"
            y="0"
            width="24"
            height="24"
            rx="8"
            fill="#2563eb"
          />
          <path
            d="M3 11.5L20 4L12 21L10.5 14.5L3 11.5Z"
            stroke="#fff"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
          />
        </svg>
      </RcButton>
    </div>
  </div>
</template>

<style lang='scss' scoped>
.chat-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  border-top: 1px solid #e5e7eb;
  min-height: 70px;
}

.chat-input {
  flex: 1;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 1rem;
  outline: none;
  background: #f8fafc;
  color: #334155;
  transition: border 0.2s;
  width: auto;
  outline-offset: 0;
  resize: none;
  overflow: hidden;
  max-height: 200px;
}

.chat-input:focus {
  border: 1.5px solid #3d98d3;
  background: #fff;
}

.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
