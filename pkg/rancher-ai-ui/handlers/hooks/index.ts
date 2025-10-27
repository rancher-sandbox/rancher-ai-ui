import { Context } from '../../types';
import { Store } from 'vuex';
import { watch } from 'vue';
import { HooksOverlay } from './overlay';

interface Target {
  target: HTMLElement;
  ctx: Context;
  handlers?: {
    mouseenter?: any;
    mouseleave?: any;
  };
}

class HooksHandler {
  private targets: Set<Target> = new Set();
  private overlays: HooksOverlay[] = [];

  private static initialized = false;

  private static allHooksKeyPressed = false;

  // Key chain: Ctrl + Alt + L
  public isShowAllHooksKey(e: KeyboardEvent) {
    if (HooksHandler.allHooksKeyPressed) {
      return e.type === 'keyup' && (e.key === 'Control' || e.key === 'Alt' || e.key?.toLowerCase() === 'l');
    } else {
      return e.ctrlKey && e.altKey && e.key?.toLowerCase() === 'l';
    }
  };

  private getOverlayHTMLElement(target: HTMLElement, overlay: HooksOverlay) {
    return target.classList.contains(overlay.getSelector()) ? target : (target.querySelector(`.${ overlay.getSelector() }`) as HTMLElement);
  }

  private clearTargets() {
    for (const t of this.targets) {
      if (t.handlers) {
        try {
          t.target.removeEventListener('mouseenter', t.handlers.mouseenter!);
        } catch {}
        try {
          t.target.removeEventListener('mouseleave', t.handlers.mouseleave!);
        } catch {}
      }
    }
    this.targets.clear();
  }

  private toggleOverlays(store: Store<any>, target: HTMLElement, ctx: Context, show: boolean) {
    this.overlays.forEach((overlay) => {
      // Get the first element with the overlay selector class, including the target itself
      const el = this.getOverlayHTMLElement(target, overlay);

      if (!el) {
        return;
      }

      if (show) {
        overlay.create(store, target, el, ctx, store.getters['rancher-ai-ui/context/all']);
      } else if (!(el.matches(':hover') || (el.querySelector(':hover') !== null))) {
        overlay.destroy(target);
      }
    });
  }

  private init(store: Store<any>) {
    watch(
      () => store.getters['ui-context/all'].filter((c: Context) => !!c.hookId),
      async(hooks) => {
        this.clearTargets();

        hooks.forEach((ctx: Context) => {
          const target = document.querySelector(`[ux-context-hook-id="${ ctx.hookId }"]`) as HTMLElement;

          if (target) {
            const onEnter = () => {
              if (!HooksHandler.allHooksKeyPressed) {
                this.toggleOverlays(store, target, ctx, true);
              }
            };
            const onLeave = () => {
              if (!HooksHandler.allHooksKeyPressed) {
                this.toggleOverlays(store, target, ctx, false);
              }
            };

            target.addEventListener('mouseenter', onEnter);
            target.addEventListener('mouseleave', onLeave);

            this.targets.add({
              target,
              ctx,
              handlers: {
                mouseenter: onEnter,
                mouseleave: onLeave,
              },
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
      if (this.isShowAllHooksKey(e)) {
        HooksHandler.allHooksKeyPressed = true;
        HooksOverlay.setAllHooksKeyPressed(true);
        this.targets.forEach(({ target, ctx }) => this.toggleOverlays(store, target, ctx, true));
      }
    });

    window.addEventListener('keyup', (e) => {
      if (this.isShowAllHooksKey(e)) {
        HooksHandler.allHooksKeyPressed = false;
        HooksOverlay.setAllHooksKeyPressed(false);
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
