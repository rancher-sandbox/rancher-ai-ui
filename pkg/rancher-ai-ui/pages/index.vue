<script lang="ts" setup>
import { onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

onMounted(() => {
  // eslint-disable-next-line no-console
  console.log('Index page mounted', store);
});
</script>

<template>
  <div class="chat-config">
    <h1 class="content">
      Rancher AI Config page
    </h1>
  </div>
</template>

<style lang='scss' scoped>
.chat-config {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
</style>