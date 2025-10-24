<script lang="ts" setup>
import { defineEmits, type PropType } from 'vue';
import { useStore } from 'vuex';
import { Agent } from '../../types';
import RcButton from '@components/RcButton/RcButton.vue';

const store = useStore();
const t = store.getters['i18n/t'];

const props = defineProps({
  agent: {
    type:     Object as PropType<Agent | null>,
    default:  null,
  }
});

const emit = defineEmits([
  'close',
]);
</script>

<template>
  <div class="chat-header">
    <div class="chat-title">
      <div class="chat-name">
        <i class="icon icon-ai icon-lg" />
        <span class="label">
          {{ t('ai.title') }}
        </span>
      </div>
      <span class="chat-model">
        {{ !!props.agent ? t('ai.agent.label', { name: props.agent.name, model: props.agent.model }, true) : t('ai.agent.unknown') }}
      </span>
    </div>
    <div class="chat-close-btn">
      <RcButton
        small
        ghost
        class="btn-close"
        @click="emit('close')"
        @keydown.enter.stop="emit('close')"
        @keydown.space.enter.stop="emit('close')"
      >
        <i
          class="icon icon-close"
        />
      </RcButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-header {
  background: var(--active-nav);
  color: var(--on-active);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-title {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  min-width: 0; /* allow children to shrink so text-overflow works */

  .chat-name {
    font-weight: 600;
    font-size: 1em;
    color: var(--on-active);
    margin: 0;
    margin-top: 4px;
    width: 60px;

    .icon {
      margin-right: 3px;
    }

    .label {
      font-size: 1.3em;
    }
  }

  .chat-model {
    font-size: 0.8rem;
    color: var(--on-active);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
    flex: 1 1 auto;
  }
}

.chat-close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
  .btn-close {
    margin: 0 8px;
  }
}

.chat-close-btn:hover {
  background: var(--active-hover);
}

.btn-close {
  margin: 0 !important;
}

.icon-close {
  width: 32px;
}
</style>
