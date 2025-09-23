<script lang="ts" setup>
import {
  ref, computed, defineProps, defineEmits, nextTick,
  onMounted
} from 'vue';
import { useStore } from 'vuex';
import { useI18n } from '@shell/composables/useI18n';
import { Agent } from '../../types';
import RcButton from '@components/RcButton/RcButton.vue';
import Banner from '@components/Banner/Banner.vue';

const store = useStore();
const { t } = useI18n(store);

const props = defineProps<{
  agent: Agent,
  disabled?: boolean,
  error?: string
}>();

const emit = defineEmits(['sendMessage', 'update:prompt']);

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
    sendMessage(event);
  }
}

function sendMessage(event: Event) {
  event.preventDefault();
  event.stopPropagation();

  emit('sendMessage', cleanMessage.value);

  message.value = '';

  nextTick(() => {
    autoResizePrompt(50);
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
  <div class="input-container">
    <div
      v-if="!!props.error"
      class="errors"
    >
      <Banner
        color="error"
        :label="props.error"
      />
    </div>
    <textarea
      ref="promptTextarea"
      class="prompt-panel"
      rows="1"
      :value="message"
      :placeholder="t('ai.prompt.placeholder')"
      :disabled="props.disabled"
      autocomplete="off"
      @input="onInputMessage"
      @keydown="handleTextareaKeydown"
    ></textarea>
    <div
      class="console-panel"
      :class="{
        disabled: props.disabled
      }"
    >
      <div class="options">
        <!-- Future options can be added here -->
        <div class="agent-model text-label">
          <span>{{ props.agent.name }} {{ props.agent.version }}</span>
          <i class="icon icon-sort-down" />
        </div>
      </div>
      <div class="send">
        <RcButton
          small
          secondary
          :disabled="!cleanMessage || props.disabled"
          @click="sendMessage"
          @keydown.enter="sendMessage"
        >
          {{ t('ai.prompt.send') }}
        </RcButton>
      </div>
    </div>
  </div>
</template>

<style lang='scss' scoped>
.input-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid var(--border);
  background-color: var(--body-bg);
  border-radius: var(--border-radius);
  padding: 12px;
  margin-top: 16px;
  margin-bottom: 90px;

  .prompt-panel {
    border: none;
    width: auto;
    padding: 0 0 8px 0;
    outline-offset: 0;
    resize: none;
    overflow: hidden;
    min-height: 50px;
    max-height: 200px;
  }

  .console-panel {
    display: flex;
    justify-content: space-between;
    align-items: end;
    margin-top: 8px;
    padding-top: 2px;

    .options {
      display: flex;
      align-items: center;
    }
  }
}

.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
