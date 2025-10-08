<script setup lang="ts">
import {
  computed, nextTick, onBeforeUnmount, ref, type PropType
} from 'vue';
import { useStore } from 'vuex';
import { Message, Role as RoleEnum } from '../../types';
import Thinking from './Thinking.vue';
import Action from './Action.vue';
import UserAvatar from './avatar/UserAvatar.vue';
import SystemAvatar from './avatar/SystemAvatar.vue';
import IconOrSvg from '@shell/components/IconOrSvg';
import iconDoc from '../../assets/explain.svg';

const store = useStore();
const t = store.getters['i18n/t'];

const props = defineProps({
  message: {
    type:    Object as PropType<Message>,
    default: () => ({} as Message),
  }
});

const emit = defineEmits(['update:message', 'enable:autoscroll']);

const isThinking = computed(() => props.message.role === RoleEnum.Assistant && props.message.thinking);
const showCopySuccess = ref(false);
const timeoutCopy = ref<any>(null);
const timeoutAutoscroll = ref<any>(null);

function handleCopy() {
  if (!props.message.messageContent && !props.message.thinkingContent) {
    return;
  }

  let text = '';

  switch (props.message.role) {
  case RoleEnum.User:
  case RoleEnum.System:
    text = props.message.messageContent || '';
    break;
  case RoleEnum.Assistant:
    if (props.message.showThinking) {
      text = props.message.thinkingStreamedResponse || '';
    }
    text += (props.message.messageStreamedResponse || '');
  default:
    break;
  }

  navigator.clipboard.writeText(text);
  showCopySuccess.value = true;
  if (timeoutCopy.value) {
    clearTimeout(timeoutCopy.value);
  }
  timeoutCopy.value = setTimeout(() => {
    showCopySuccess.value = false;
  }, 1000);
}

function handleShowThinking(message: Message) {
  message.showThinking = !message.showThinking;

  emit('enable:autoscroll', false);
  nextTick(() => {
    emit('update:message', message);
  });
  if (timeoutAutoscroll.value) {
    clearTimeout(timeoutAutoscroll.value);
  }
  timeoutAutoscroll.value = setTimeout(() => {
    emit('enable:autoscroll', true);
  }, 500);
}

onBeforeUnmount(() => {
  if (timeoutCopy.value) {
    clearTimeout(timeoutCopy.value);
  }
  if (timeoutAutoscroll.value) {
    clearTimeout(timeoutAutoscroll.value);
  }
});
</script>

<template>
  <div
    class="chat-message"
    :class="[{
      'chat-message-user': props.message.role === RoleEnum.User,
    }]"
  >
    <component
      :is="props.message.role === RoleEnum.User ? UserAvatar : SystemAvatar"
      class="chat-msg-avatar"
    />
    <div class="chat-msg-content">
      <div
        class="chat-msg-bubble"
        :class="[{
          'chat-msg-bubble-user': props.message.role === RoleEnum.User,
          'chat-msg-bubble-assistant': props.message.role !== RoleEnum.User,
        }]"
      >
        <div class="chat-msg-bubble-actions">
          <button
            v-if="props.message.role === RoleEnum.Assistant"
            v-clean-tooltip="t('ai.message.actions.tooltip.showThinking')"
            class="bubble-action-btn btn header-btn role-tertiary"
            type="button"
            role="button"
            @click="handleShowThinking(props.message)"
          >
            <i class="icon icon-gear" />
          </button>
          <button
            v-clean-tooltip="t('ai.message.actions.tooltip.copy')"
            class="bubble-action-btn btn header-btn role-tertiary"
            type="button"
            role="button"
            @click="handleCopy"
          >
            <i
              :class="{
                'icon icon-checkmark': showCopySuccess,
                'icon icon-copy': !showCopySuccess
              }"
            />
          </button>
        </div>
        <div class="chat-msg-text">
          <div v-if="isThinking">
            <Thinking />
          </div>
          <span v-if="props.message.showThinking">
            <br v-if="isThinking">
            <span
              v-if="props.message.thinkingContent"
              v-clean-html="props.message.thinkingContent"
            />
            <br>
          </span>
          <div v-if="props.message.completed && !props.message.thinking && !props.message.messageContent">
            <span v-if="props.message.actions?.length">
              {{ t('ai.message.assistant.empty.messageActions') }}
            </span>
            <span v-else>
              {{ t('ai.message.assistant.empty.messageNoActions') }}
            </span>
          </div>
          <span
            v-if="props.message.messageContent"
            v-clean-html="props.message.messageContent"
          />
        </div>
      </div>
      <!-- TODO: replace with actual source when available -->
      <div
        v-if="props.message.source || (props.message.role === RoleEnum.Assistant && props.message.messageContent)"
        class="chat-msg-section"
      >
        <div class="chat-msg-section-title">
          <IconOrSvg
            :src="iconDoc"
            class="icon icon-action-source"
          />
          <span>{{ t('ai.message.source.label') }}</span>
        </div>
        <div class="chat-msg-tags">
          <span class="chat-tag">Cluster Management Guide</span>
          <span class="chat-tag">Best Practices</span>
        </div>
      </div>
      <div
        v-if="props.message.actions?.length"
        class="chat-msg-section"
      >
        <div class="chat-msg-section-title chat-msg-section-title-actions">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
          >
            <path
              d="M13 10V3L4 14h7v7l9-11h-7Z"
              fill="#3d98d3"
            />
          </svg>
          <span>{{ t('ai.message.quickActions.label') }}</span>
        </div>
        <div class="chat-msg-tags chat-msg-section-tags-actions">
          <div
            v-for="(action, index) in props.message.actions"
            :key="index"
            class="mt-2 chat-msg-actions"
          >
            <Action
              :value="action"
            />
          </div>
        </div>
      </div>
      <div
        v-if="props.message.timestamp"
        class="chat-msg-timestamp"
      >
        {{ props.message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
      </div>
    </div>
  </div>
</template>

<style lang='scss' scoped>
.chat-message {
  display: flex;
  gap: 8px;
}

.chat-msg-content {
  margin-right: 40px;
}

.chat-message-user {
  flex-direction: row-reverse;

  .chat-msg-content {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    margin: 0;
  }

  .chat-msg-text {
    color: #fff;
  }
}

.chat-msg-bubble {
  position: relative;
  max-width: 450px;
  background: var(--body-bg);
  border-radius: 12px;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.04);
  padding: 12px;
  font-size: 0.95rem;
  display: flex;
  flex-direction: column;
  gap: 6px;

  /* Hide actions by default, show on hover */
  &:hover .chat-msg-bubble-actions {
    opacity: 1;
    pointer-events: auto;
  }
}

.chat-msg-bubble-user {
  background: var(--primary);
  color: #fff;
  border: 1px solid #3d98d3;
}

.chat-msg-bubble-actions {
  position: absolute;
  top: -15px;
  right: -15px;
  display: flex;
  gap: 5px;
  z-index: 2;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}

.bubble-action-btn {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 2px 4px;
  box-shadow: 0 1px 4px 0 rgba(0,0,0,0.04);
  cursor: pointer;
  transition: border 0.15s, box-shadow 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  min-height: 24px;
  width: 24px;
  height: 24px;
}

.bubble-action-btn .icon {
  font-size: 14px;
  width: 14px;
  height: 14px;
}

.bubble-action-btn.header-btn {
  padding: 2px;
  min-width: 20px;
  min-height: 20px;
  width: 25px;
  height: 25px;
}

.bubble-action-btn.header-btn .icon {
  font-size: 12px;
  width: 12px;
  height: 12px;
}

.bubble-action-btn:hover {
  border-color: #3d98d3;
  box-shadow: 0 2px 8px 0 rgba(61,152,211,0.10);
}

.chat-msg-text {
  color: var(--body-text);
  word-break: break-word;
  white-space: pre-line;
  list-style-position: inside;
}

.chat-msg-section {
  margin-top: 8px;
}

.chat-msg-section-title {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #9fabc6;

  span {
    font: 9px sans-serif;
    font-weight: 500;
  }

  &.chat-msg-section-title-actions {
    span {
       color: var(--primary);
    }
  }
}

.chat-msg-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.chat-msg-section-tags-actions {
  margin-top: 4px;
}

.chat-tag {
  background: #e0e7ef;
  color: #334155;
  border-radius: 8px;
  padding: 2px 8px;
  font-size: 0.75rem;
  border: 1px solid #cbd5e1;
}

.chat-msg-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.chat-msg-timestamp {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 8px;
  margin-bottom: 8px;
  align-self: flex-end;
}

.icon-action-source {
  width: 16px;
  height: 16px;
  min-width: 16px;
  min-height: 16px;
  display: inline-block;
  vertical-align: middle;
}
</style>
