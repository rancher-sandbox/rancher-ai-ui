import Settings from '../pages/Settings.vue';
import { PRODUCT_NAME } from '../product';

const routes = [
  {
    path:      `/c/:cluster/settings/${ PRODUCT_NAME }`,
    component: Settings,
    name:      `c-cluster-settings-${ PRODUCT_NAME }`
  },
];

export default routes;