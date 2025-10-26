<script lang="ts" setup>
import {
  ref, computed, defineProps, defineEmits, nextTick,
  onMounted,
  watch,
  onUpdated
} from 'vue';
import { useStore } from 'vuex';
import RcButton from '@components/RcButton/RcButton.vue';
import { useInputComposable } from '../../composables/useInputComposable';
import Options from '../options/index.vue';

const store = useStore();
const t = store.getters['i18n/t'];

const props = defineProps({
  disabled: {
    type:    Boolean,
    default: false,
  },
});

const emit = defineEmits(['input:content', 'download:chat', 'reset:chat', 'show:help']);

const { inputText, updateInput, cleanInput } = useInputComposable();

const promptTextarea = ref<HTMLTextAreaElement | null>(null);

const text = computed(() => {
  if (props.disabled) {
    return '';
  }

  return inputText.value;
});

function onInputMessage(event: Event) {
  updateInput((event?.target as HTMLTextAreaElement)?.value);
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

  emit('input:content', cleanInput(text.value));

  updateInput('');
}

function autoResizePrompt(height?: number) {
  const textarea = promptTextarea.value;

  if (textarea) {
    textarea.style.overflow = parseInt(textarea.style.height) > 90 ? 'auto' : 'hidden';
    textarea.style.height = 'auto';
    textarea.style.height = `${ height || textarea.scrollHeight }px`;
  }
}

onMounted(() => {
  nextTick(() => {
    promptTextarea.value?.focus();
  });
});

onUpdated(() => {
  nextTick(() => {
    promptTextarea.value?.focus();
  });
});

watch(promptTextarea, (el) => {
  if (el) {
    nextTick(() => el.focus());
  }
}, {});

watch(() => text.value, () => {
  nextTick(() => {
    autoResizePrompt();
  });
}, {});
</script>

<template>
  <div
    class="chat-console-row"
    :class="{ disabled: props.disabled }"
  >
    <div class="chat-options">
      <Options
        :disabled="props.disabled"
        @download:chat="emit('download:chat')"
        @reset:chat="emit('reset:chat')"
        @show:help="emit('show:help')"
      />
    </div>
    <textarea
      ref="promptTextarea"
      class="chat-input"
      rows="1"
      :value="text"
      :placeholder="props.disabled ? '' : t('ai.prompt.placeholder')"
      :disabled="props.disabled"
      autocomplete="off"
      @input="onInputMessage"
      @keydown="handleTextareaKeydown"
    ></textarea>
    <div class="chat-input-send">
      <RcButton
        small
        :disabled="!text || props.disabled"
        @click="sendContent"
        @keydown.enter="sendContent"
      >
        <i class="icon icon-lg icon-send" />
      </RcButton>
    </div>
  </div>
</template>

<style lang='scss' scoped>
.chat-console-row {
  display: flex;
  align-items: end;
  gap: 8px;
  padding: 16px 16px 16px 12px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  border-top: 1px solid var(--border);
  min-height: 70px;
}

.chat-options {
  margin-bottom: 4px;
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
  overflow: auto;
  min-height: 36px;
  max-height: 90px;
}

.chat-input:focus {
  border: solid 1.5px var(--secondary-border, var(--primary));
}

.chat-input-send {
  .btn {
    height: 36px;
  }
}
</style>
