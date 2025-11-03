<script setup lang="ts">
import { MessageActionRelatedResource } from '../../../types';
import { computed, type PropType } from 'vue';
import { useStore } from 'vuex';
import RelatedResource from './RelatedResource.vue';

const THRESHOLD = 14; // Maximum number of actions is 7 rows of 2 buttons each = 14

const store = useStore();
const t = store.getters['i18n/t'];

const props = defineProps({
  actions: {
    type:    Array as PropType<MessageActionRelatedResource[]>,
    default: () => ([] as MessageActionRelatedResource[]),
  },
});

const actions = computed(() => {
  if (props.actions.length > THRESHOLD) {
    return props.actions.slice(0, THRESHOLD);
  }

  return props.actions;
});

</script>

<template>
  <div class="chat-actions-container">
    <div class="chat-msg-action-title">
      <span>{{ t('ai.message.relatedResources.label') }}</span>
    </div>
    <div class="chat-msg-actions-container">
      <div class="chat-msg-action-tags">
        <div
          v-for="(action, index) in actions"
          :key="index"
          class="mt-2 chat-msg-actions"
        >
          <RelatedResource :value="action" />
        </div>
      </div>
      <span
        v-if="props.actions.length > THRESHOLD"
        class="chat-msg-actions-more"
      >
        {{ t('ai.message.relatedResources.more', { count: props.actions.length - THRESHOLD }, true) }}
      </span>
    </div>
  </div>
</template>

<style lang='scss' scoped>
.chat-msg-action-title {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--on-secondary);

  span {
    font: 9px sans-serif;
    font-weight: 500;
  }
}

.chat-msg-actions-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chat-msg-action-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.chat-msg-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.chat-msg-actions-more {
  color: #94a3b8;
}
</style>
