import { Context } from 'types';
import { PRODUCT_NAME } from '../product';
import { CoreStoreSpecifics, CoreStoreConfig } from '@shell/core/types';

interface State {
  context: Context[];
}

const getters = {
  default: (state: State, getters: any, rootState: any, rootGetters: any) => {
    const all = rootGetters['ui-context/all'] || [];

    return all.filter((c: Context) => !c.hookId);
  },

  hooked: (state: State) => {
    return state.context || [];
  },

  all: (state: State, getters: any, rootState: any, rootGetters: any) => {
    const all = [
      ...(rootGetters['ui-context/all'] || []).filter((c: Context) => !c.hookId),
      ...state.context
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