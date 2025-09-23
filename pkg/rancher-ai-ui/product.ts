import { IPlugin } from '@shell/core/types';

export function init($plugin: IPlugin, store: any) {
  const PRODUCT_NAME = 'rancher-ai-ui';
  const BLANK_CLUSTER = '_';

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