import { importTypes } from '@rancher/auto-import';
import { ActionLocation, IPlugin } from '@shell/core/types';
import extensionRouting from './routing/extension-routing';
import { defineAsyncComponent } from 'vue';

// Init the package
export default function(plugin: IPlugin, { store }: any): void {
  if (!plugin.environment.isPrime) {
    console.warn('[Rancher AI]: Rancher Prime subscription required');
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
  plugin.register('component', 'ChatComponent', defineAsyncComponent(() =>
    import('./components/Chat.vue')
  ));

  // Open chat window action
  plugin.addAction(
    ActionLocation.HEADER,
    {},
    {
      tooltipKey: 'action.openChat',
      tooltip: 'Rancher AI Chat',
      shortcut: 'shift alt i',
      icon: 'icon-comment',
      invoke() {
        store.dispatch('wm/secondary/open', {
          id:        'chat',
          label:     'chat',
          icon:      'terminal',
          config: {
            componentName: 'ChatComponent',
            extensionId:   'rancher-ai-ui',
          },
          attrs:     {
            // cluster: {},
            // pod:     {}
          }
        }, { root: true });
      }
    }
  );
}
