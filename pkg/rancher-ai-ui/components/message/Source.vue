<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const t = store.getters['i18n/t'];

const isCollapsed = ref(true);

</script>

<template>
  <div class="chat-source-container">
    <div class="chat-msg-source-label">
      <i class="icon icon-sources" />
      <span>{{ t('ai.message.source.label') }}</span>
      <i
        class="icon icon-sm"
        :class="{
          'icon icon-chevron-up text-label': !isCollapsed,
          'icon icon-chevron-down text-label': isCollapsed
        }"
        @click="isCollapsed = !isCollapsed"
      />
    </div>
    <div
      v-if="!isCollapsed"
      class="chat-msg-source-tags"
    >
      <span class="chat-msg-source-tag">Cluster Management Guide</span>
      <span class="chat-msg-source-tag">Best Practices</span>
    </div>
  </div>
</template>

<style lang='scss' scoped>
.chat-msg-source-label {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #9fabc6;

  span {
    font: 9px sans-serif;
    font-weight: 500;
  }
}

.chat-msg-source-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.chat-msg-source-tag {
  color: #9fabc6;
  border-radius: 8px;
  padding: 2px 8px;
  font-size: 0.75rem;
  border: 1px solid #9fabc6;
}
</style>