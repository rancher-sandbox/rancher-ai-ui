import { useStore } from 'vuex';
import { BOTTOM } from '@shell/utils/position';
// @ts-expect-error missing shell export
import useTabsHandler from '@shell/components/nav/WindowManager/composables/useTabsHandler.ts';
// @ts-expect-error missing shell export
import useDimensionsHandler from '@shell/components/nav/WindowManager/composables/useDimensionsHandler.ts';
// @ts-expect-error missing shell export
import useResizeHandler from '@shell/components/nav/WindowManager/composables/useResizeHandler.ts';

export function useHeaderHandler(props: { panelId: string, panelPosition: any }) {
  const store = useStore();

  const { onTabClose } = useTabsHandler();

  const { setDimensions } = useDimensionsHandler({ position: props.panelPosition });

  const { mouseResizeXStart } = useResizeHandler({
    position: props.panelPosition,
    setDimensions
  });

  function resize(event: MouseEvent | TouchEvent) {
    mouseResizeXStart(event);
  }

  function close() {
    onTabClose(props.panelId);
    store.commit('wm/setLockedPositions', []);
    setDefaultPosition();
  }

  function setDefaultPosition() {
    store.commit('wm/setUserPin', BOTTOM);
  }

  return {
    resize,
    close,
    setDefaultPosition
  };
}
