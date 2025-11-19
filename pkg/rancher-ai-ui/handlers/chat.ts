import { Store } from 'vuex';
import { PANEL_POSITION, PRODUCT_NAME } from '../product';
import { Layout } from '@shell/types/window-manager';
import { BOTTOM, LEFT, RIGHT } from '@shell/utils/position';

class ChatHandler {
  panelId = PRODUCT_NAME;
  panelPosition = PANEL_POSITION;

  isOpen(store: Store<any>) {
    // wm/isOpen not working as expected here, can be restored when https://github.com/rancher/dashboard/issues/15941 is fixed
    return !!store.state.wm?.tabs?.find((tab: { id: string }) => tab.id === PRODUCT_NAME);
  }

  open(store: Store<any>) {
    const tabs = [...store.getters['wm/tabs']].filter((tab: any) => tab.id !== PRODUCT_NAME);

    tabs.forEach((tab) => {
      store.commit('wm/switchTab', {
        tabId:          tab.id,
        targetPosition: BOTTOM
      });
    });

    store.commit('wm/setPanelWidth', {
      position: PANEL_POSITION,
      width:    window.innerWidth / 3
    });

    store.dispatch('wm/open', {
      id:            PRODUCT_NAME,
      extensionId:   PRODUCT_NAME,
      label:         'Chat',
      component:     'ChatComponent',
      position:      PANEL_POSITION,
      layouts:       [
        Layout.default,
        Layout.home,
        Layout.plain,
      ],
      showHeader: false,
    }, { root: true });

    store.commit('wm/setLockedPositions', [RIGHT, LEFT, BOTTOM]);
  }

  close(store: Store<any>, id = PRODUCT_NAME) {
    store.commit('wm/closeTab', { id });
    this.restoreDefaultPositions(store);
  }

  restoreDefaultPositions(store: Store<any>) {
    store.commit('wm/setLockedPositions', []);
    store.commit('wm/setUserPin', BOTTOM);
  }
}

export default new ChatHandler();
