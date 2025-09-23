import Dashboard from '../pages/index.vue';
import { PRODUCT_NAME, BLANK_CLUSTER } from '../product';

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