import { computed } from 'vue';
import { useStore } from 'vuex';

export function useConnectionHandler(options: {
  onopen: () => void
  onmessage: (event: MessageEvent) => Promise<void>, // eslint-disable-line no-unused-vars
  onclose: (event: CloseEvent) => void, // eslint-disable-line no-unused-vars
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
      onclose
    });
  }

  function disconnect() {
    // Clear connection when websocket is disconnected and chat is manually closed
    if (!store.getters['wm/secondary/isOpen'] && ws.value?.readyState !== WebSocket.OPEN) {
      store.commit('rancher-ai-ui/connection/close');
    }
  }

  return {
    ws,
    error,
    connect,
    disconnect
  };
}
