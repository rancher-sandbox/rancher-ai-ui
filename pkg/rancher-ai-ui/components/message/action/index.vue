<script setup lang="ts">
import { MessageActionLink } from '../../../types';
import { type PropType } from 'vue';
import { useStore } from 'vuex';
import Link from './Link.vue';

const store = useStore();
const t = store.getters['i18n/t'];

const props = defineProps({
  actions: {
    type:    Array as PropType<MessageActionLink[]>,
    default: () => ([] as MessageActionLink[]),
  },
});
</script>

<template>
  <div class="chat-actions-container">
    <div class="chat-msg-action-title">
      <i class="icon icon-quick-action" />
      <span>{{ t('ai.message.relatedResources.label') }}</span>
    </div>
    <div class="chat-msg-action-tags">
      <div
        v-for="(action, index) in props.actions"
        :key="index"
        class="mt-2 chat-msg-actions"
      >
        <Link :value="action" />
      </div>
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
</style>