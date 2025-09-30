<script setup lang="ts">
import { computed, type PropType } from 'vue';
import { Message, ContentType, Role as RoleEnum } from '../../types';
import RcButton from '@components/RcButton/RcButton.vue';
import Thinking from './Thinking.vue';

const props = defineProps({
  message: {
    type:    Object as PropType<Message>,
    default: () => ({} as Message),
  }
});

const emit = defineEmits(['update:message']);

const isThinking = computed(() => props.message.role === RoleEnum.Assistant && props.message.contentType === ContentType.Thinking);

function toggleShowMessage(message: Message) {
  message.isExpanded = !message.isExpanded;

  emit('update:message', message);
}
</script>

<template>
  <div
    class="message-container"
    :class="[{
      'user-message': props.message.role === RoleEnum.User,
      'other-message': props.message.role !== RoleEnum.User,
      'thinking-message': isThinking
    }]"
  >
    <div
      v-if="isThinking"
      class="header"
    >
      <Thinking
        :completed="props.message.completed"
      />
      <RcButton
        small
        ghost
        class="expand-button"
        @click="toggleShowMessage(props.message)"
      >
        <i
          class="icon"
          :class="{
            ['icon-chevron-up']: props.message.isExpanded,
            ['icon-chevron-down']: !props.message.isExpanded
          }"
        />
      </RcButton>
    </div>
    <div
      v-if="props.message.isExpanded || !isThinking"
      class="body"
      :class="{['expanded']: isThinking && props.message.isExpanded }"
    >
      <span
        class="message-text"
      >
        {{ props.message.content }}
      </span>
      <span
        v-if="props.message.timestamp"
        class="message-timestamp"
      >
        {{ props.message.timestamp }}
      </span>
    </div>
  </div>
</template>

<style lang='scss' scoped>
.message-container {
  display: flex;
  flex-direction: column;
  border-radius: 0.5rem;
  padding: 0.75rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  word-break: break-word;
  white-space: pre-wrap;

  .header {
    display: flex;
    align-items: center;

    .expand-button {
      min-height: 15px;
    }
  }

  .body {
    .message-text {
      font-size: 0.875rem;
      font-weight: 500;
    }

    .message-timestamp {
      font-size: 0.75rem;
      text-align: right;
      margin-top: 0.25rem;
      opacity: 0.75;
    }

    &.expanded {
      margin-top: 16px;
    }
  }
}

.user-message {
  align-self: flex-end;
  background-color: var(--primary);
  color: white;
  margin-left: auto;
  border-top-right-radius: 0.1rem;
}

.other-message {
  align-self: flex-start;
  background-color: #374151;
  color: white;
  margin-right: auto;
  border-top-left-radius: 0.1rem;
}

.thinking-message {
  background-color: #676785;
}
</style>
