import { Context } from '../../types';
import { Store } from 'vuex';
import { watch } from 'vue';
import { HooksOverlay } from './overlay';

export const defaultModifierKey = 'Control';

interface Target {
  target: HTMLElement;
  ctx: Context;
}

class HooksHandler {
  private targets: Set<Target> = new Set();
  private overlays: HooksOverlay[] = [];

  private static initialized = false;

  private static modifierKey = defaultModifierKey;
  private static modifierKeyPressed = false;

  private getOverlayHTMLElement(target: HTMLElement, overlay: HooksOverlay) {
    return target.classList.contains(overlay.getSelector()) ? target : (target.querySelector(`.${ overlay.getSelector() }`) as HTMLElement);
  }

  private toggleOverlays(store: Store<any>, target: HTMLElement, ctx: Context, show: boolean) {
    this.overlays.forEach((overlay) => {
      // Get the first element with the overlay selector class, including the target itself
      const el = this.getOverlayHTMLElement(target, overlay);

      if (!el) {
        return;
      }

      if (show) {
        overlay.create(store, target, el, ctx);
      } else if (!(el.matches(':hover') || (el.querySelector(':hover') !== null))) {
        overlay.destroy(target);
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
              if (!HooksHandler.modifierKeyPressed) {
                this.toggleOverlays(store, target, ctx, true);
              }
            });

            target.addEventListener('mouseleave', () => {
              if (!HooksHandler.modifierKeyPressed) {
                this.toggleOverlays(store, target, ctx, false);
              }
            });
          }
        });
      },
      {
        immediate: true,
        deep:      true
      },
    );

    watch(() => store.getters['prefs/theme'], (newTheme) => {
      this.targets.forEach(({ target }) => {
        this.overlays.forEach((overlay) => {
          const el = this.getOverlayHTMLElement(target, overlay);

          overlay.setTheme(el, newTheme);
        });
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === HooksHandler.modifierKey) {
        HooksHandler.modifierKeyPressed = true;
        HooksOverlay.setModifierKeyPressed(true);
        this.targets.forEach(({ target, ctx }) => this.toggleOverlays(store, target, ctx, true));
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === HooksHandler.modifierKey) {
        HooksHandler.modifierKeyPressed = false;
        HooksOverlay.setModifierKeyPressed(false);
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
