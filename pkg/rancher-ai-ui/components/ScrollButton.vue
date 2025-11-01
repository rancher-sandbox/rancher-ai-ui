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
  <div class="scroll-button">
    <button
      class="scroll-button-btn role-tertiary"
      type="button"
      role="button"
      @click="emit('scroll', props.direction)"
    >
      <i :class="['icon', `icon-chevron-${ props.direction }`, 'text-label']" />
    </button>
  </div>
</template>

<style scoped lang="scss">
.scroll-button-btn {
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

.scroll-button-btn:hover,
.scroll-button-btn:focus {
  transform: translateY(-1px);

  .icon {
  }
}

.scroll-button-btn:active {
  transform: translateY(0);
}

.scroll-button {
  pointer-events: auto;
}
</style>
