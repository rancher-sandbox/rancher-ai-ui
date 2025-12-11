import { useStore } from 'vuex';
import { onMounted, ref } from 'vue';
import { base64Decode } from '@shell/utils/crypto';
import YAML from 'yaml';
import { warn } from '../utils/log';
import { AGENT_NAMESPACE, AGENT_NAME, AGENT_CONFIG_SECRET_NAME, PRODUCT_NAME } from '../product';
import { SECRET, WORKLOAD_TYPES } from '@shell/config/types';
import { ActionType, Agent, ChatError } from '../types';

/**
 * Composable for managing the AI agent state.
 *
 * The Agent information is used to determine which AI model is being used (shown in the Console panel)
 * and to handle any errors related to the agent's availability or configuration.
 *
 * @returns Composable for managing the AI agent state.
 */
export function useAgentComposable() {
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
      AWS_SECRET_ACCESS_KEY,
      AWS_BEARER_TOKEN_BEDROCK,
      MODEL
    } = data;

    if (OLLAMA_URL) {
      agent.name = t('ai.agent.models.ollama');
    } else if (GOOGLE_API_KEY) {
      agent.name = t('ai.agent.models.gemini');
    } else if (OPENAI_API_KEY) {
      agent.name = t('ai.agent.models.openai');
    } else if (AWS_SECRET_ACCESS_KEY || AWS_BEARER_TOKEN_BEDROCK) {
      agent.name = t('ai.agent.models.bedrock');
    }

    if (agent.name) {
      try {
        const parsedModel = YAML.parse(base64Decode(MODEL || ''));

        agent.model = parsedModel || 'unknown';
      } catch (err) {
        warn('Error parsing agent model version', err);
      }

      return agent;
    }

    return null;
  }

  async function checkAgentAvailability() {
    if (!store.getters['management/canList'](WORKLOAD_TYPES.DEPLOYMENT)) {
      error.value = { key: 'ai.error.agent.deployment.noPermission' };
    } else {
      try {
        const agent = await store.dispatch('management/find', {
          type: WORKLOAD_TYPES.DEPLOYMENT,
          id:   `${ AGENT_NAMESPACE }/${ AGENT_NAME }`
        });

        if (agent && agent.state !== 'active') {
          error.value = {
            key:    'ai.error.agent.deployment.notActive',
            action: {
              label:    t('ai.agent.goToDeployment'),
              type:     ActionType.Button,
              resource: {
                cluster:   'local',
                type:      WORKLOAD_TYPES.DEPLOYMENT,
                namespace: AGENT_NAMESPACE,
                name:      AGENT_NAME
              }
            }
          };
        }
      } catch (e) {
        warn('\'rancher-ai-agent\' deployment not found', e);
        error.value = {
          key:    'ai.error.agent.deployment.notFound',
          action: {
            label:    t('ai.agent.goToInstall'),
            type:     ActionType.Button,
            resource: { detailLocation: { name: 'c-cluster-apps-charts' } } // TODO: add params to open AI chart directly
          }
        };
      }
    }

    return !error.value;
  }

  async function getAgentConfigs() {
    if (!store.getters['management/canList'](SECRET)) {
      error.value = { key: 'ai.error.agent.secret.noPermission' };

      return;
    }

    try {
      const secret = await store.dispatch('management/find', {
        type:    SECRET,
        id:      `${ AGENT_NAMESPACE }/${ AGENT_CONFIG_SECRET_NAME }`
      });

      if (secret?.data) {
        agent.value = decodeAgentConfigs(secret.data);
      }
    } catch (e) {
      warn('Error fetching agent configuration secret:', e);
    }

    if (!agent.value) {
      error.value = {
        key:    'ai.error.agent.secret.missingConfig',
        action: {
          label:    t('ai.settings.goToSettings'),
          type:     ActionType.Button,
          resource: { detailLocation: { name: `c-cluster-settings-${ PRODUCT_NAME }` } }
        }
      };
    }
  }

  onMounted(async() => {
    const available = await checkAgentAvailability();

    if (available) {
      getAgentConfigs();
    }
  });

  return {
    agent,
    error
  };
}
