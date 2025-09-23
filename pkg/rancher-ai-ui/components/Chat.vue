<script lang="ts">

export default {
  name: 'ChatComponent',

  mounted() {
    console.log('Chat component mounted', (this as any).$store); // eslint-disable-line no-console
  },
};

</script>

<template>
  <div class="chat-component">
    <h1 class="content">
      Chat Component
    </h1>
  </div>
</template>
