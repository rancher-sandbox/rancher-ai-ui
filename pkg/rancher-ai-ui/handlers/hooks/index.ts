import { Context } from '../../types';
import { Store } from 'vuex';
import { watch } from 'vue';
import { HooksOverlay } from './overlay/index';

interface Target {
  target: HTMLElement;
  ctx: Context;
}

class HooksHandler {
  private targets: Set<Target> = new Set();
  private overlays: HooksOverlay[] = [];

  private static initialized = false;
  private static ctrlPressed = false;

  private toggleOverlays(store: Store<any>, target: HTMLElement, ctx: Context, show: boolean) {
    this.overlays.forEach((overlay) => {
      // Get the first element with the overlay selector class, including the target itself
      const el =
        target.classList.contains(overlay.getSelector()) ? target : (target.querySelector(`.${ overlay.getSelector() }`) as HTMLElement);

      if (!el) {
        return;
      }

      if (show) {
        overlay.create(store, target, el, ctx);

        el.style.position = 'relative';
        el.style.boxShadow = '0 0 0 1px var(--on-secondary)';
        el.style.borderRadius = '4px';
      } else if (!HooksHandler.ctrlPressed) {
        overlay.remove();

        el.style.boxShadow = '';
        el.style.borderRadius = '';
      }
    });
  }

  private init(store: Store<any>) {
    watch(
      () => store.getters['ui-context/all'].filter((c: Context) => !!c.hookId),
      async(hooks) => {
        this.targets.clear();

        hooks.forEach((ctx: Context) => {
          const target = document.querySelector(`[ux-context-hook-id="${ ctx.hookId }"]`) as HTMLElement;

          if (target) {
            this.targets.add({
              target,
              ctx
            });

            target.addEventListener('mouseenter', () => {
              this.toggleOverlays(store, target, ctx, true);
            });

            target.addEventListener('mouseleave', () => {
              this.toggleOverlays(store, target, ctx, false);
            });
          }
        });
      },
      {
        immediate: true,
        deep:      true
      },
    );

    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey) {
        HooksHandler.ctrlPressed = true;
        this.targets.forEach(({ target, ctx }) => this.toggleOverlays(store, target, ctx, true));
      }
    });

    window.addEventListener('keyup', (e) => {
      if (!e.ctrlKey) {
        HooksHandler.ctrlPressed = false;
        this.targets.forEach(({ target, ctx }) => this.toggleOverlays(store, target, ctx, false));
      }
    });
  }

  public inject(overlay: HooksOverlay, store: Store<any>) {
    if (!HooksHandler.initialized) {
      this.init(store);
      HooksHandler.initialized = true;
    }

    if (this.overlays.find((o) => o.getSelector() === overlay.getSelector())) {
      return;
    }

    this.overlays.push(overlay);
  };
}

export default new HooksHandler();
