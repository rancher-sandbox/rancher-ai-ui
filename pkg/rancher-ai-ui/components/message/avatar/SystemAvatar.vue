<script setup lang="ts">
import iconSuse from '../../../assets/suse-avatar.svg';

</script>
<template>
  <div class="system-msg-avatar">
    <img
      class="img-svg"
      :src="iconSuse"
    />
  </div>
</template>

<style lang='scss' scoped>
.system-msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  color: #22c55e;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #e5e7eb;
}
</style>