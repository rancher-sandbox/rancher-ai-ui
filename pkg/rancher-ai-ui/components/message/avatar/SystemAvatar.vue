<script setup lang="ts">
// @ts-expect-error FIXME: Cannot find module '../../../assets/liz-icon.svg'... Remove this comment to see the full error message
import lizIcon from '../../../assets/liz-icon.svg';

</script>
<template>
  <div class="system-msg-avatar">
    <img
      class="img-svg"
      :src="lizIcon"
    />
  </div>
</template>

<style lang='scss' scoped>
.system-msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--body-bg);
  border: 1px solid var(--border);
  color: #22c55e;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>