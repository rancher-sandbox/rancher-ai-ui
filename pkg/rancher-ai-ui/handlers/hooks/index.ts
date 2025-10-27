import { Context } from '../../types';
import { Store } from 'vuex';
import { watch } from 'vue';
import { HooksOverlay } from './overlay';
import { debounce } from 'lodash';

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
  private static headerBtn: HTMLElement | null = null;
  private static allHooksKeyPressed = false;

  // Key chain: Ctrl + Alt + L
  private isShowAllHooksKey(e: KeyboardEvent) {
    if (HooksHandler.allHooksKeyPressed) {
      return e.type === 'keyup' && (e.key === 'Control' || e.key === 'Alt' || e.key?.toLowerCase() === 'l');
    } else {
      return e.ctrlKey && e.altKey && e.key?.toLowerCase() === 'l';
    }
  };

  private addEasterEgg(store: Store<any>) {
    if (HooksHandler.headerBtn) {
      const prev = (HooksHandler.headerBtn as any).__easterHandlers;

      if (prev) {
        try {
          HooksHandler.headerBtn.removeEventListener('mouseenter', prev.onEnter);
        } catch {}
        try {
          HooksHandler.headerBtn.removeEventListener('mouseleave', prev.onLeave);
        } catch {}
      }
      (HooksHandler.headerBtn as any).__easterHandlers = undefined;
      HooksHandler.headerBtn = null;
    }

    HooksHandler.headerBtn = document.querySelector('.header-btn .icon-ai')?.closest('.header-btn') as HTMLElement | null;

    if (HooksHandler.headerBtn) {
      const onEnter = debounce(() => {
        this.toggleAllHooksOverlay(store, true);
      }, 150);
      const onLeave = debounce(() => {
        this.toggleAllHooksOverlay(store, false);
      }, 150);

      (HooksHandler.headerBtn as any).__easterHandlers = {
        onEnter,
        onLeave
      };
      HooksHandler.headerBtn.addEventListener('mouseenter', onEnter);
      HooksHandler.headerBtn.addEventListener('mouseleave', onLeave);
    }
  }

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
        this.addEasterEgg(store);
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
        this.toggleAllHooksOverlay(store, true);
      }
    });

    window.addEventListener('keyup', (e) => {
      if (this.isShowAllHooksKey(e)) {
        this.toggleAllHooksOverlay(store, false);
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

  public toggleAllHooksOverlay(store: Store<any>, value: boolean) {
    HooksHandler.allHooksKeyPressed = value;
    HooksOverlay.setAllHooksKeyPressed(value);
    this.targets.forEach(({ target, ctx }) => this.toggleOverlays(store, target, ctx, value));
  }
}

export default new HooksHandler();
