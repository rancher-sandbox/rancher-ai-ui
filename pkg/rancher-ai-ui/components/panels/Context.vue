<script lang="ts" setup>
import { defineProps, type PropType } from 'vue';
import SelectContext from '../context/SelectContext.vue';
import { Context } from '../../types';

const props = defineProps({
  value: {
    type:    Array as PropType<Context[]>,
    default: () => ({} as Context[]),
  },
  disabled: {
    type:    Boolean,
    default: false,
  }
});

const emit = defineEmits(['select']);
</script>

<template>
  <div class="chat-context">
    <SelectContext
      v-if="!props.disabled"
      :options="value"
      :auto-select="value"
      @update="emit('select', $event)"
    />
  </div>
</template>

<style lang='scss' scoped>
.chat-context {
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
}
</style>
