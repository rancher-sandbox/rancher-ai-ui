<script setup lang="ts">
import { onMounted, ref, type PropType } from 'vue';
import { useStore } from 'vuex';
import RcButton from '@components/RcButton/RcButton.vue';
import { MessageAction } from '../../types';
import { ActionType } from '../../types';

const store = useStore();

const props = defineProps({
  value: {
    type:    Object as PropType<MessageAction>,
    default: () => ({} as MessageAction),
  }
});

const to = ref<any>(null);

function goTo() {
  (store as any).$router.push(to.value.detailLocation);
}

onMounted(async() => {
  if (!!props.value.resource.detailLocation) {
    to.value = props.value.resource;
  } else {
    const {
      cluster, type, namespace, name
    } = props.value.resource;

    to.value = await store.dispatch('management/find', {
      cluster,
      type,
      id: `${ namespace }/${ name }`
    });
  }
});

</script>

<template>
  <div v-if="props.value.type === ActionType.Button">
    <RcButton
      small
      secondary
      :disabled="!to"
      @click="goTo"
    >
      {{ props.value.label }}
    </RcButton>
  </div>
  <span v-if="props.value.type === ActionType.Link">
    <a
      v-if="to"
      class="link"
      @click="goTo"
    >
      {{ props.value.label }}
    </a>
    <span v-else>
      {{ props.value.label }}
      <template v-if="!props.value">
        <span class="text-muted">&mdash;</span>
      </template>
    </span>
  </span>
</template>

<style lang='scss' scoped>
.link {
  cursor: pointer;
}
</style>