import { IPlugin } from '@shell/core/types';
import { RIGHT } from '@shell/utils/position';

export const PRODUCT_NAME = 'rancher-ai-ui';
export const BLANK_CLUSTER = '_';

export const AGENT_NAMESPACE = 'cattle-ai-agent-system';
export const AGENT_NAME = 'rancher-ai-agent';
export const AGENT_API_PATH = 'agent/ws';

export const AGENT_CONFIG_SECRET_NAME = 'llm-config';

export const PANEL_POSITION = RIGHT;

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