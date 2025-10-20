import { ref, computed, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import type { Context } from '../types';

const enum ContextTag {
  CLUSTER   = 'cluster', // eslint-disable-line no-unused-vars
  NAMESPACE = 'namespace', // eslint-disable-line no-unused-vars
}

export function useContextHandler() {
  const store = useStore();
  const t = store.getters['i18n/t'];

  const context = computed(() => {
    // Get current cluster from the store
    const currentCluster = store.getters['currentCluster'];

    const activeCluster = currentCluster ? [{
      tag:         ContextTag.CLUSTER,
      value:       currentCluster.name,
      description: t('ai.context.resources.cluster'),
      icon:        'icon-cluster'
    }] : [];

    // Get active namespaces from the store
    const namespaces = store.getters['namespaces']() || {};
    const activeNamespaces = Object.keys(namespaces)
      .filter((k) => !!namespaces[k])
      .map((value) => ({
        tag:         ContextTag.NAMESPACE,
        value,
        description: t('ai.context.resources.namespace'),
        icon:        'icon-namespace'
      }));

    // Get current page context from the store
    const currentPageContext = (store.getters['rancher-ai-ui/context/all'] || []).filter((ctx: Context) => {
      return ctx.tag !== ContextTag.CLUSTER && ctx.tag !== ContextTag.NAMESPACE;
    });

    return [
      ...activeCluster,
      ...(activeNamespaces?.[0] ? [activeNamespaces[0]] : []), // To fix, we are limiting results, it should include all active namespaces
      ...currentPageContext,
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
