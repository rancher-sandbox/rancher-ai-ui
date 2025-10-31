<script setup lang="ts">

const props = defineProps({
  direction: {
    type:    String,
    default: 'down',
  },
});

const emit = defineEmits(['scroll']);
</script>

<template>
  <div class="fast-scroll">
    <button
      class="fast-scroll-btn role-tertiary"
      type="button"
      role="button"
      @click="emit('scroll', props.direction)"
    >
      <i :class="['icon', `icon-chevron-${ props.direction }`, 'text-label']" />
    </button>
  </div>
</template>

<style scoped lang="scss">
.fast-scroll-btn {
  width: 20px;
  height: 20px;
  min-height: 0;
  padding: 0;
  border: 1px solid #9fabc6;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--body-bg);
  color: var(--body-text);

  cursor: pointer;
  outline: none;
}

.fast-scroll-btn:hover,
.fast-scroll-btn:focus {
  transform: translateY(-1px);

  .icon {
  }
}

.fast-scroll-btn:active {
  transform: translateY(0);
}

.fast-scroll {
  pointer-events: auto;
}
</style>
