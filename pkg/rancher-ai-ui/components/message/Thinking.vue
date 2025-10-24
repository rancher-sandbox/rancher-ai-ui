<script setup lang="ts">
import {
  ref, computed, onMounted,
  onBeforeUnmount
} from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const t = store.getters['i18n/t'];

const now = ref(Date.now());

let interval: any;

const props = defineProps({
  label: {
    type:    String,
    default: '',
  },
});

const dots = computed(() => {
  const cycle = Math.floor((now.value / 500) % 4);

  return '.'.repeat(cycle);
});

onMounted(() => {
  interval = setInterval(() => {
    now.value = Date.now();
  }, 500);
});

onBeforeUnmount(() => {
  if (interval) {
    clearInterval(interval);
  }
});
</script>

<template>
  <div class="thinking-message">
    <span>
      {{ props.label || t('ai.message.assistant.thinking.inProgress') }}
    </span>
    <div class="dots">
      <span>
        {{ dots }}
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.thinking-message {
  .dots {
    display: inline-flex;
    width: 12px;
  }
}
</style>
