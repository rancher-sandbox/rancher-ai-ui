import { ref, computed, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import type { Context } from '../types';

export function useContextHandler() {
  const store = useStore();

  const context = computed(() => {
    // Get default context from v-ui-context directives
    const defaultContext = store.getters['rancher-ai-ui/context/all'];

    // Get active namespaces from the store as context options
    const namespaces = store.getters['namespaces']() || {};
    const activeNamespaces = Object.keys(namespaces)
      .filter((k) => !!namespaces[k])
      .map((value) => ({
        tag:         'namespace',
        value,
        description: 'Namespace',
        icon:        'icon-namespace'
      }));

    return [
      ...defaultContext,
      ...(activeNamespaces?.[0] ? [activeNamespaces[0]] : []), // To fix, we are limiting results, it should include all active namespaces
    ];
  });

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
