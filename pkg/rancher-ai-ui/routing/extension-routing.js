import Dashboard from '../pages/index.vue';

const BLANK_CLUSTER = '_';
const PRODUCT_NAME = 'rancher-ai-ui';

const routes = [
  {
    name:      `${ PRODUCT_NAME }-c-cluster`,
    path:      `/${ PRODUCT_NAME }/c/:cluster`,
    component: Dashboard,
    meta:      {
      product: PRODUCT_NAME,
      cluster: BLANK_CLUSTER,
      pkg:     PRODUCT_NAME,
    },
  },
];

export default routes;