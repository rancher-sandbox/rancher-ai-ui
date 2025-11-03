<script setup lang="ts">
import { onMounted, ref, type PropType } from 'vue';
import { useStore } from 'vuex';
import { warn } from '../../../utils/log';
import RcButton from '@components/RcButton/RcButton.vue';
import { MessageActionRelatedResource } from '../../../types';
import { ActionType } from '../../../types';

const store = useStore();

const props = defineProps({
  value: {
    type:    Object as PropType<MessageActionRelatedResource>,
    default: () => ({} as MessageActionRelatedResource),
  }
});

const to = ref<any>(null);
const tooltip = ref<string>('');

function goTo() {
  if (to.value.detailLocation) {
    store.state.$router.push({
      ...to.value.detailLocation,
      params: {
        ...(to.value.detailLocation.params || {}),
        /**
         * TODO:
         * We are assuming that the product is 'explorer' here because
         * RelatedResource actions are only for resources that exist in the cluster explorer, at this time.
         *
         * 1. The productId should be dynamic and based on where the resource is located, ex: Fleet -> get Gitrepos
         */
        product: 'explorer',
        cluster: props.value?.resource?.cluster || to.value.detailLocation.params?.cluster, // Preserve cluster param
      }
    });
  }
}

onMounted(async() => {
  if (!!props.value.resource.detailLocation) {
    to.value = props.value.resource;
  } else {
    const {
      cluster, type, namespace, name
    } = props.value.resource;

    const inStore = store.getters['currentProduct'].inStore || 'management';

    try {
      to.value = await store.dispatch(`${ inStore }/find`, {
        cluster,
        type,
        id: namespace ? `${ namespace }/${ name }` : name
      });
    } catch (e) {
      warn('RelatedResource - Could not find related resource', e);
      to.value = null;
    }
  }
});

</script>

<template>
  <div v-if="props.value.type === ActionType.Button">
    <RcButton
      v-clean-tooltip="tooltip"
      small
      secondary
      :disabled="!to"
      @click="goTo"
    >
      <span class="rc-button-label">
        {{ props.value.label }}
      </span>
    </RcButton>
  </div>
  <span v-if="props.value.type === ActionType.Link">
    <a
      v-if="to"
      v-clean-tooltip="tooltip"
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
.rc-button-label {
  word-break: break-word;
  white-space: pre-line;
  list-style-position: inside;
}
.link {
  cursor: pointer;
}
</style>