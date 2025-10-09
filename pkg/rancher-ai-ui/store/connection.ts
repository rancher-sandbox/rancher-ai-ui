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
  },
  setError(state: State, error: ConnectionError | null) {
    state.error = error;
  },
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
        commit('setError', { key: 'ai.error.websocket.generic' });
      };

      commit('open', ws);
      commit('setError', null);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('WebSocket connection error: ', e);
      commit('setError', { key: 'ai.error.websocket.connection' } );
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