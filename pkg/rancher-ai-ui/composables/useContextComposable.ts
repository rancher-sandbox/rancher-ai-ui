import { ref, computed, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import type { Context } from '../types';

export function useContextComposable() {
  const store = useStore();

  const context = computed(() => store.getters['rancher-ai-ui/context/all']);

  const selectedContext = ref<Context[]>([]);

  function selectContext(context: Context[]) {
    selectedContext.value = context;
  }

  onBeforeUnmount(() => {
    store.commit('rancher-ai-ui/context/reset');
  });

  return {
    context,
    selectContext,
    selectedContext
  };
}
