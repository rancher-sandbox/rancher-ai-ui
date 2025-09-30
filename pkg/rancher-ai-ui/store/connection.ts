import { PRODUCT_NAME } from '../product';
import { CoreStoreSpecifics, CoreStoreConfig } from '@shell/core/types';
import { ConnectionError, ConnectionParams } from '../types';

interface State {
  ws: WebSocket | null;
  error: ConnectionError | null;
}

const getters = {
  ws:    (state: State) => state.ws,
  error: (state: State) => state.error,
};

const mutations = {
  open(state: State, ws: WebSocket) {
    if (state.ws) {
      return;
    }
    state.ws = ws;
  },
  close(state: State) {
    if (state.ws) {
      state.ws.close();
    }
    state.ws = null;
  }
};

const actions = {
  async open({ commit, state }: { commit: Function, state: State }, params: ConnectionParams) {
    if (state.ws) {
      return;
    }

    const {
      url, onopen, onmessage, onclose
    } = params;

    try {
      const ws = new WebSocket(url);

      ws.onopen = onopen || null;
      ws.onmessage = onmessage || null;
      ws.onclose = onclose || null;
      ws.onerror = (e) => {
        // eslint-disable-next-line no-console
        console.error('WebSocket error: ', e);
        state.error = { message: 'WebSocket error occurred. Please try again later.' };
      };

      commit('open', ws);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('WebSocket connection error: ', e);
      state.error = { message: 'Failed to connect to Rancher AI Agent. Please try again later.' };
    }
  },

  async close({ commit }: { commit: Function }) {
    commit('close');
  }
};

const factory = (): CoreStoreSpecifics => {
  return {
    state: (): State => {
      return {
        ws:    null,
        error: null
      };
    },
    getters:   { ...getters },
    mutations: { ...mutations },
    actions:   { ...actions },
  };
};
const config: CoreStoreConfig = { namespace: `${ PRODUCT_NAME }/connection` };

export default {
  specifics: factory(),
  config
};