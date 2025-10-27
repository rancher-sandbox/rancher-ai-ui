<script setup lang="ts">
import { type PropType } from 'vue';
import { Context } from '../../types';

const props = defineProps({
  item: {
    type: Object as PropType<Context>,
    default() {
      return {};
    },
  },
  removeEnabled: {
    type:    Boolean,
    default: true,
  },
});

const emit = defineEmits(['remove']);
</script>

<template>
  <div
    v-clean-tooltip="props.item.description"
    class="vs__selected tag"
  >
    <div class="tag-content">
      <i :class="props.item.icon" />
      <span>
        {{ props.item.value }}
      </span>
    </div>
    <button
      v-if="props.removeEnabled"
      type="button"
      class="vs__deselect"
      @click="emit('remove', props.item)"
    />
  </div>
</template>

<style lang='scss' scoped>
.tags {
  display: flex;
  flex-wrap: wrap;
  max-width: 100%;
  align-items: center;
  gap: 5px;
  color: var(--active-nav);
}

.tag {
  display: flex;
  flex-direction: row;
  gap: 5px;
  height: 25px;
  line-height: 1;
  margin-right: 5px;
  margin-left: 0;
  padding: 0 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;

  .tag-content {
    display: flex;
    justify-content: center;
    gap: 5px;
  }

  .vs__deselect {
    margin: 0;
  }
}

.vs__selected {
  border: solid 1px var(--active-nav);
  color: var(--active-nav);
}
</style>
