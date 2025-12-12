<script setup lang="ts">
import { computed, PropType, ref } from 'vue';
import { useStore } from 'vuex';
import ContextTag from '../context/ContextTag.vue';

const store = useStore();
const t = store.getters['i18n/t'];

const isCollapsed = ref(false);

const props = defineProps({
  links: {
    type:    Array as PropType<string[]>,
    default: () => ([]),
  },
});

const items = computed(() => {
  return props.links.map((value) => {
    const lastChunk = value?.split('/').pop() || '';
    const label = lastChunk
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return {
      label: label || 'Link',
      value
    };
  });
});

function openLink(url: string) {
  window.open(url, '_blank');
}

</script>

<template>
  <div class="chat-source-container">
    <div class="chat-msg-source-label">
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
      <template
        v-for="item in items"
        :key="item.value"
      >
        <context-tag
          :remove-enabled="false"
          :item="{ value: item.label }"
          type="user"
          class="chat-msg-source-tag"
          @click.native="openLink(item.value)"
        >
        </context-tag>
      </template>
    </div>
  </div>
</template>

<style lang='scss' scoped>
.chat-msg-source-label {
  display: flex;
  align-items: center;
  gap: 8px;
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
  margin-top: 8px;
}

.chat-msg-source-tag {
  height: auto;
  color: #9fabc6;
  border-radius: 8px;
  padding: 2px 8px;
  font-size: 0.75rem;
  border: 1px solid #9fabc6;
  cursor: pointer;
}
</style>
