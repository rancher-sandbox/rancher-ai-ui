<script setup lang="ts">
import { type PropType } from 'vue';
import { useStore } from 'vuex';
import RcButton from '@components/RcButton/RcButton.vue';
import { MessageActionSuggestion } from '../../../types';

const store = useStore();
const t = store.getters['i18n/t'];

const props = defineProps({
  suggestions: {
    type:    Array as PropType<MessageActionSuggestion[]>,
    default: () => ([] as MessageActionSuggestion[]),
  }
});

const emit = defineEmits(['select']);
</script>

<template>
  <div class="suggestions-container">
    <div class="suggestions-header">
      {{ t('ai.message.suggestions.label') }}
    </div>
    <div
      v-for="(suggestion, index) in props.suggestions"
      :key="index"
    >
      <RcButton
        tertiary
        small
        @click="() => emit('select', suggestion)"
      >
        {{ suggestion }}
      </RcButton>
    </div>
  </div>
</template>

<style lang='scss' scoped>
.suggestions-header {
  margin-bottom: 8px;
}
</style>