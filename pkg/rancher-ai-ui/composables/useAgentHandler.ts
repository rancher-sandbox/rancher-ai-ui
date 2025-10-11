import { useStore } from 'vuex';
import { onMounted, ref } from 'vue';
import { base64Decode } from '@shell/utils/crypto';
import YAML from 'yaml';
import { AGENT_NAMESPACE, AGENT_NAME, AGENT_CONFIG_SECRET_NAME } from '../product';
import { SECRET, WORKLOAD_TYPES } from '@shell/config/types';
import { Agent, ChatError } from '../types';

export function useAgentHandler() {
  const store = useStore();
  const t = store.getters['i18n/t'];

  const agent = ref<Agent | null>(null);
  const error = ref<ChatError | null>(null);

  function decodeAgentConfigs(data: any): Agent | null {
    const agent = {} as Agent;

    const {
      OLLAMA_URL,
      GOOGLE_API_KEY,
      OPENAI_API_KEY,
      MODEL
    } = data;

    if (OLLAMA_URL) {
      agent.name = t('ai.agent.models.ollama');
    } else if (GOOGLE_API_KEY) {
      agent.name = t('ai.agent.models.google');
    } else if (OPENAI_API_KEY) {
      agent.name = t('ai.agent.models.openai');
    }

    if (agent.name) {
      try {
        const parsedModel = YAML.parse(base64Decode(MODEL || ''));

        const parts = parsedModel?.split(':') || [];

        if (parts.length > 1) {
          agent.model =   parts[0];
          agent.version = parts[1];
        }
      } catch (err) {
        console.error('Error parsing agent model version', err); // eslint-disable-line no-console
      }

      return agent;
    }

    return null;
  }

  async function checkAgentAvailability() {
    if (store.getters['management/schemaFor'](WORKLOAD_TYPES.DEPLOYMENT)) {
      try {
        const agent = await store.dispatch('management/find', {
          type: WORKLOAD_TYPES.DEPLOYMENT,
          id:   `${ AGENT_NAMESPACE }/${ AGENT_NAME }`
        });

        if (!agent || agent.state !== 'active') {
          error.value = { key: 'ai.error.agent.notActive' };
        }
      } catch (e) {
        console.warn('[Rancher AI] \'rancher-ai-agent\' deployment not found', e); // eslint-disable-line no-console
        error.value = { key: 'ai.error.agent.notFound' };
      }
    } else {
      console.warn('[Rancher AI] Deployment schema not found'); // eslint-disable-line no-console
    }
  }

  async function getAgentConfigs() {
    try {
      const secret = await store.dispatch('management/find', {
        type:    SECRET,
        id:      `${ AGENT_NAMESPACE }/${ AGENT_CONFIG_SECRET_NAME }`
      });

      if (secret?.data) {
        agent.value = decodeAgentConfigs(secret.data);
      }
    } catch (e) {
      console.warn('[Rancher AI] Error fetching agent configuration:', e); // eslint-disable-line no-console
    }
  }

  onMounted(() => {
    checkAgentAvailability();
    getAgentConfigs();
  });

  return {
    agent,
    error
  };
}
