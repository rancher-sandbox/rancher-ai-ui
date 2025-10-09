<script setup lang="ts">
import { useStore } from 'vuex';
import { NORMAN } from '@shell/config/types';
import { computed } from 'vue';

const store = useStore();
const t = store.getters['i18n/t'];

const userIcon = computed(() => {
  const principal = store.getters['rancher/byId'](NORMAN.PRINCIPAL, store.getters['auth/principalId']) || {};

  return principal?.avatarSrc;
});
</script>

<template>
  <div class="user-msg-avatar">
    <img
      v-if="userIcon"
      :src="userIcon"
      class="round-avatar"
      width="20"
      height="20"
      :alt="t('nav.alt.userAvatar')"
    >
    <i
      v-else
      class="icon icon-user"
    />
  </div>
</template>

<style lang='scss' scoped>
.user-msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #e5e7eb;
}

.round-avatar {
  border: 0;
  border-radius: 50%;
}
</style>