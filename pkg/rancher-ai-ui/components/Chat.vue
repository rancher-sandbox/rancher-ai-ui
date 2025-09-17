<script lang="ts">

export default {
  name: 'ChatComponent',

  mounted() {
    console.log('Chat component mounted', (this as any).$store);
  },
};

</script>

<template>
  <div class="chat-component">
    <h1 class="content">Chat Component</h1>
  </div>
</template>

<style lang='scss' scoped>
</style>