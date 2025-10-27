import { Context } from 'types';
import { PRODUCT_NAME } from '../product';
import { CoreStoreSpecifics, CoreStoreConfig } from '@shell/core/types';

export const enum ContextTag {
  CLUSTER   = 'cluster', // eslint-disable-line no-unused-vars
  NAMESPACE = 'namespace', // eslint-disable-line no-unused-vars
}

interface State {
  context: Context[];
}

const getters = {
  default: (state: State, getters: any, rootState: any, rootGetters: any) => {
    const all = rootGetters['ui-context/all'] || [];

    return all.filter((c: Context) => !c.hookId);
  },

  transient: (state: State) => {
    return state.context || [];
  },

  all: (state: State, getters: any, rootState: any, rootGetters: any) => {
    const t = rootGetters['i18n/t'];

    // Get current cluster from the store
    const currentCluster = rootGetters['currentCluster'];

    const activeCluster = currentCluster ? [{
      tag:         ContextTag.CLUSTER,
      value:       currentCluster.name,
      valueLabel:  currentCluster.nameDisplay || currentCluster.name,
      description: t('ai.context.resources.cluster'),
      icon:        'icon-cluster'
    }] : [];

    // Get active namespaces from the store
    const namespaces = rootGetters['namespaces']() || {};
    const activeNamespaces = Object.keys(namespaces)
      .filter((k) => !!namespaces[k])
      .map((value) => ({
        tag:         ContextTag.NAMESPACE,
        value,
        description: t('ai.context.resources.namespace'),
        icon:        'icon-namespace'
      }));

    const all = [
      ...activeCluster,
      ...(activeNamespaces?.[0] ? [activeNamespaces[0]] : []), // To fix, we are limiting results, it should include all active namespaces
      ...getters.default,
      ...state.context,
    ];

    const unique = all.filter((item, index, self) => index === self.findIndex((c) => c.tag === item.tag && c.value === item.value)
    );

    return unique;
  }
};

const mutations = {
  add: (state: State, context: Context[]) => {
    const toAdd = Array.isArray(context) ? context : [context];

    toAdd.forEach((context) => {
      if (!state.context.find((c) => c.tag === context.tag && c.value === context.value)) {
        state.context.push(context);
      }
    });
  },

  reset(state: State) {
    state.context = [];
  }
};

const actions = {};

const factory = (): CoreStoreSpecifics => {
  return {
    state: (): State => {
      return { context: [] };
    },
    getters:   { ...getters },
    mutations: { ...mutations },
    actions:   { ...actions },
  };
};
const config: CoreStoreConfig = { namespace: `${ PRODUCT_NAME }/context` };

export default {
  specifics: factory(),
  config
};