import { defineAsyncComponent } from 'vue';
import { importTypes } from '@rancher/auto-import';
import { ActionLocation, IPlugin } from '@shell/core/types';
import extensionRouting from './routing/extension-routing';
import connectionStore from './store/connection';
import chatStore from './store/chat';
import { WORKLOAD_TYPES } from '@shell/config/types';
import { AGENT_NAME, AGENT_NAMESPACE, PRODUCT_NAME, PANEL_POSITION } from './product';
import { NotificationLevel } from '@shell/types/notifications';
import { BOTTOM, LEFT, RIGHT } from '@shell/utils/position';
import { Layout } from '@shell/types/window-manager';

// Init the package
export default function(plugin: IPlugin, { store }: any): void {
  if (!plugin.environment.isPrime) {
    console.warn('[Rancher AI]: Rancher Prime subscription required'); //eslint-disable-line no-console

    plugin.addNavHooks({
      onLogin: async(store: any) => {
        store.dispatch('notifications/add', {
          id:      'rancher-ai-requires-prime',
          level:   NotificationLevel.Error,
          // Note: Hard-coded strings due to issue where onLogin called before i18n loaded from extension
          title:   'Rancher AI Assistant requires Rancher Prime',
          message: 'The Rancher AI Assistant requires a Rancher Prime subscription. Please upgrade to Prime or uninstall this extension.'
        });
      }
    });

    return;
  }

  // Auto-import model, detail, edit from the folders
  importTypes(plugin);

  // Provide extension metadata from package.json
  // it will grab information such as `name` and `description`
  plugin.metadata = require('./package.json');

  // Load a product
  plugin.addProduct(require('./product'));

  // Add Vue Routes
  plugin.addRoutes(extensionRouting);

  // Register the Chat component in shell/components/SecondarySidePanel
  plugin.register('component', 'ChatComponent', defineAsyncComponent(() => import('./pages/Chat.vue')) as Function);

  // Open chat window action
  plugin.addAction(
    ActionLocation.HEADER,
    {},
    {
      tooltipKey: 'ai.action.openChat',
      shortcut: 'i',
      svg: require('./assets/chat-icon.svg'),
      enabled:    async () => {
        if (store.getters['management/schemaFor'](WORKLOAD_TYPES.DEPLOYMENT)) {
          try {
            const agent = await store.dispatch('management/find', { type: WORKLOAD_TYPES.DEPLOYMENT, id: `${ AGENT_NAMESPACE }/${ AGENT_NAME }` });

            return agent && agent.state === 'active';
          } catch (error) {
            console.warn('[Rancher AI]: \'rancher-ai-agent\' deployment not found');
          }
        } else {
          console.warn('[Rancher AI]: Deployment schema not found');
        }

        return false;
      },
      invoke() {
        const tabs = [...store.getters['wm/tabs']].filter((tab: any) => tab.id !== PRODUCT_NAME);

        tabs.forEach((tab) => {
          store.commit('wm/switchTab', { tabId: tab.id, targetPosition: BOTTOM });
        });

        store.commit('wm/setPanelWidth', { position: PANEL_POSITION, width: window.innerWidth / 3 });

        store.dispatch('wm/open', {
          id:            PRODUCT_NAME,
          extensionId:   PRODUCT_NAME,
          label:         'Chat',
          component:     'ChatComponent',
          position:      PANEL_POSITION,
          layouts:       [
            Layout.default,
            Layout.home
          ],
          showHeader:    false,
        }, { root: true });

        store.commit('wm/setLockedPositions', [RIGHT, LEFT, BOTTOM ]);
      }
    }
  );

  // Add stores
  plugin.addDashboardStore(connectionStore.config.namespace, connectionStore.specifics, connectionStore.config);
  plugin.addDashboardStore(chatStore.config.namespace, chatStore.specifics, chatStore.config);
}
