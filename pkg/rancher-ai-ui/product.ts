import { IPlugin } from '@shell/core/types';

export const PRODUCT_NAME = 'rancher-ai-ui';
export const BLANK_CLUSTER = '_';

export const AGENT_NAMESPACE = 'cattle-ai-agent-system';
export const AGENT_NAME = 'rancher-ai-agent';
export const AGENT_API_PATH = 'agent/ws';

export const AI_AGENT_NAME = 'Ollama';
export const AI_AGENT_VERSION = 'qwen3:1.7b';

export function init($plugin: IPlugin, store: any) {
  const { product } = $plugin.DSL(store, PRODUCT_NAME);

  product({
    icon:    'gear',
    inStore: 'management',
    weight:  100,
    to:      {
      name:   `${ PRODUCT_NAME }-c-cluster`,
      path:   `/${ PRODUCT_NAME }/c/:cluster/dashboard`,
      params: {
        product: PRODUCT_NAME,
        cluster: BLANK_CLUSTER,
        pkg:     PRODUCT_NAME,
      },
    },
  });
}