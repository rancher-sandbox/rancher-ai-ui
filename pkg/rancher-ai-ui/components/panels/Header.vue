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
    <div class="chat-header-left">
      <div>
        <div class="chat-title">
          <h2>
            {{ t('ai.title') }}
          </h2>
        </div>
        <div class="chat-subtitle">
          <span v-if="props.agent">
            {{ t('ai.agent.label', {
              name: props.agent.name,
              model: props.agent.model,
              separator: props.agent.model && props.agent.version ? ':' : '',
              version: props.agent.version
            }, true) }}
          </span>
          <span v-else>
            {{ t('ai.agent.unknown') }}
          </span>
        </div>
      </div>
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
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  height: 24px;

  h2 {
    font-weight: 600;
    font-size: 1rem;
    color: var(--on-active);
    margin: 0;
  }
}

.chat-subtitle {
  height: 18px;
  margin: 2px 0 0 0;
  span {
    font-size: 0.8rem;
    color: var(--on-active);
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
</style>
