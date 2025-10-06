<script lang="ts" setup>
import { defineEmits } from 'vue';
import { useStore } from 'vuex';
import RcButton from '@components/RcButton/RcButton.vue';

const store = useStore();
const t = store.getters['i18n/t'];

const emit = defineEmits([
  'resize',
  'close',
]);
</script>

<template>
  <div
    ref="headerContainer"
    class="header-container"
  >
    <div class="group">
      <div
        class="resizer resizer-x"
        role="button"
        tabindex="0"
        :aria-label="t('sideWindow.secondary.resize')"
        aria-expanded="true"
        @mousedown.prevent.stop="emit('resize', $event)"
        @touchstart.prevent.stop="emit('resize', $event)"
      >
        <i class="icon icon-code" />
      </div>
      <div class="tab-header">
        <span
          class="tab-label"
        >
          {{ t('ai.title') }}
        </span>
      </div>
    </div>
    <div
      class="actions"
    >
      <RcButton
        small
        ghost
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
.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 8px 2px 0;
  border-bottom: 1px solid var(--body-bg);

  .group {
    display: flex;
    align-items: center;
  }

  .tab-header {
    margin: 0 4px
  }

  .tab-label {
    padding: 0 4px;
    font-size: 16px;
    border-bottom: 1px solid var(--primary);
    padding-bottom: 2px;
  }

  .actions {
    padding-right: 4px;
  }
}

.resizer {
  width: var(--wm-tab-height);
  padding: 0 5px;
  margin: 0 0 0 1px;
  text-align: center;
  border-left: 1px solid var(--wm-border);
  border-right: 1px solid var(--wm-border);
  line-height: var(--wm-tab-height);
  height: calc(var(--wm-tab-height) + 1px);
  flex-grow: 0;
  cursor: col-resize;

  &:hover {
    background-color: var(--wm-closer-hover-bg);
  }
}
</style>
