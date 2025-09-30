<script setup lang="ts">
import {
  ref, computed, onMounted, onUnmounted, watch
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
  completed: {
    type:    Boolean,
    default: false,
  }
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

watch(() => props.completed, (value) => {
  if (!value && interval) {
    clearInterval(interval);
  }
});

onUnmounted(() => {
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
      <span v-if="!props.completed">
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
