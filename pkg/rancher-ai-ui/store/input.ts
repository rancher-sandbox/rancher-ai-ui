import { PRODUCT_NAME } from '../product';
import { CoreStoreSpecifics, CoreStoreConfig } from '@shell/core/types';

interface State {
  text: string;
}

const getters = {
  text: (state: State) => {
    return state.text;
  },
};

const mutations = {
  text(state: State, text: string) {
    state.text = text;
  },
};

const actions = {};

const factory = (): CoreStoreSpecifics => {
  return {
    state: (): State => {
      return { text: '' };
    },
    getters:   { ...getters },
    mutations: { ...mutations },
    actions:   { ...actions },
  };
};
const config: CoreStoreConfig = { namespace: `${ PRODUCT_NAME }/input` };

export default {
  specifics: factory(),
  config
};