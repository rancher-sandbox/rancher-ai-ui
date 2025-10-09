<script lang="ts" setup>
import {
  ref, computed, defineProps, defineEmits, nextTick,
  onMounted
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
    autoResizePrompt();
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
  <div
    class="chat-input-row"
    :class="{ disabled: props.disabled }"
  >
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
    <div class="chat-input-console">
      <RcButton
        small
        :disabled="!cleanMessage || props.disabled"
        @click="sendContent"
        @keydown.enter="sendContent"
      >
        <i class="icon icon-lg icon-send" />
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
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  border-top: 1px solid var(--border);
  min-height: 70px;
}

.chat-input {
  flex: 1;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 1rem;
  outline: none;
  color: var(--input-text);
  transition: border 0.2s;
  width: auto;
  outline-offset: 0;
  resize: none;
  overflow: hidden;
  min-height: 36px;
  max-height: 200px;
}

.chat-input:focus {
  border: solid 1.5px var(--secondary-border, var(--primary));
}
</style>
