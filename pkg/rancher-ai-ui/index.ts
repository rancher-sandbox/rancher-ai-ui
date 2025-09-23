import { importTypes } from '@rancher/auto-import';
import { ActionLocation, IPlugin } from '@shell/core/types';
import extensionRouting from './routing/extension-routing';
import { defineAsyncComponent } from 'vue';
import { WORKLOAD_TYPES } from '@shell/config/types';
import { AGENT_NAME, AGENT_NAMESPACE } from './product';
import { NotificationLevel } from '@shell/types/notifications';

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
  plugin.register('component', 'ChatComponent', defineAsyncComponent(() => import('./components/Chat.vue')) as Function);

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
            const aiAgent = await store.dispatch('management/find', { type: WORKLOAD_TYPES.DEPLOYMENT, id: `${ AGENT_NAMESPACE }/${ AGENT_NAME }` });

            return !!aiAgent;
          } catch (error) {
            console.warn('[Rancher AI]: \'rancher-ai-agent\' deployment not found');
          }
        } else {
          console.warn('[Rancher AI]: Deployment schema not found');
        }

        return false;
      },
      invoke() {
        store.dispatch('wm/secondary/open', {
          id:            'rancher-ai-ui-chat',
          label:         'Chat',
          componentName: 'ChatComponent',
          extensionId:   'rancher-ai-ui',
        }, { root: true });
      }
    }
  );
}
