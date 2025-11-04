import { useStore } from 'vuex';
import Chat from '../handlers/chat';
// @ts-expect-error missing shell export
import useTabsHandler from '@shell/components/nav/WindowManager/composables/useTabsHandler.ts';
// @ts-expect-error missing shell export
import useDimensionsHandler from '@shell/components/nav/WindowManager/composables/useDimensionsHandler.ts';
// @ts-expect-error missing shell export
import useResizeHandler from '@shell/components/nav/WindowManager/composables/useResizeHandler.ts';

/**
 * Composable for managing the AI chat header actions.
 *
 * This uses some components from the shell's WindowManager to handle tab closing,
 * dimension setting, and resizing.
 * @returns Composable for managing the AI chat header actions.
 */
export function useHeaderComposable() {
  const store = useStore();

  const { onTabClose } = useTabsHandler();

  const { setDimensions } = useDimensionsHandler({ position: Chat.panelPosition });

  const { mouseResizeXStart } = useResizeHandler({
    position: Chat.panelPosition,
    setDimensions
  });

  function resize(event: MouseEvent | TouchEvent) {
    mouseResizeXStart(event);
  }

  function close() {
    onTabClose(Chat.panelId);
    Chat.close(store);
  }

  function restore() {
    Chat.restoreDefaultPositions(store);
  }

  return {
    resize,
    close,
    restore
  };
}
