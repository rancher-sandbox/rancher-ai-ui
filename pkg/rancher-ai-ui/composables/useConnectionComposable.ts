import { computed } from 'vue';
import { useStore } from 'vuex';

export function useConnectionComposable(options: {
  onopen: (event: { target: WebSocket }) => void // eslint-disable-line no-unused-vars
  onmessage: (event: MessageEvent) => Promise<void>, // eslint-disable-line no-unused-vars
  onclose?: (event: CloseEvent) => void, // eslint-disable-line no-unused-vars
}) {
  const store = useStore();

  const ws = computed(() => store.getters['rancher-ai-ui/connection/ws']);
  const error = computed(() => store.getters['rancher-ai-ui/connection/error']);

  async function connect(
    agentNamespace: string,
    agentName: string,
    agentApiPath: string
  ) {
    const url = `wss://${ window.location.host }/api/v1/namespaces/${ agentNamespace }/services/http:${ agentName }:80/proxy/${ agentApiPath }`;

    const { onopen, onmessage, onclose } = options;

    await store.dispatch('rancher-ai-ui/connection/open', {
      url,
      onopen,
      onmessage,
      onclose: onclose || (() => {
        store.commit('rancher-ai-ui/connection/setError', { key: 'ai.error.websocket.disconnected' });
      })
    });
  }

  function disconnect(args: { showError?: boolean } = { showError: true }) {
    if (args && args.showError !== undefined && !options.onclose && !args.showError) {
      ws.value.onclose = null;
    }

    store.commit('rancher-ai-ui/connection/close');
  }

  return {
    ws,
    error,
    connect,
    disconnect
  };
}
