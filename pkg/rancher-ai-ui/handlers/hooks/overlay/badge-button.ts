import { Context } from '../../../types';
import { Store } from 'vuex';
import { nextTick } from 'vue';
// @ts-expect-error missing icon
import chatIcon from '../../../assets/suse-avatar.svg';
import MenuFactory from '../factory/menu';
import { HooksOverlay } from './index';

class BadgeButtonOverlay extends HooksOverlay {
  constructor(selector: string) {
    super();
    this.selector = selector;
  }

  create(store: Store<any>, target: HTMLElement, badge: HTMLElement, ctx: Context) {
    const overlayBtn = document.createElement('button');

    const overlayBtnHeight = 32;

    overlayBtn.className = `${ HooksOverlay.defaultClassPrefix }-${ this.getSelector() }`;
    overlayBtn.innerHTML = `<img src="${ chatIcon }" alt="AI" style="width:18px;height:18px;vertical-align:middle;" />`;
    // overlayBtn.style.position = 'absolute';
    overlayBtn.style.position = 'fixed';
    overlayBtn.style.width = `${ overlayBtnHeight }px`;
    overlayBtn.style.minHeight = `${ overlayBtnHeight }px`;
    overlayBtn.style.height = `${ overlayBtnHeight }px`;
    overlayBtn.style.background = '#fff';
    overlayBtn.style.border = '1px solid var(--on-secondary)';
    overlayBtn.style.borderRadius = '50%';
    overlayBtn.style.cursor = 'pointer';
    overlayBtn.style.display = 'flex';
    overlayBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
    overlayBtn.style.justifyContent = 'center';
    overlayBtn.style.alignItems = 'center';
    overlayBtn.style.padding = '0';
    overlayBtn.style.zIndex = '10';
    overlayBtn.style.right = '';
    overlayBtn.style.transform = '';

    if (badge) {
      const badgeRect = badge.getBoundingClientRect();

      overlayBtn.style.left = `${ badgeRect.right - 2 }px`;
      overlayBtn.style.top = `${ badgeRect.top + (badgeRect.height / 2) - (overlayBtnHeight / 2) }px`;
    }

    target.appendChild(overlayBtn);

    overlayBtn.addEventListener('click', (e) => this.action(store, e, overlayBtn, ctx));
  }

  action(store: Store<any>, e: Event, overlay: HTMLElement, ctx: Context) {
    e.stopPropagation();

    const menu = MenuFactory.build(store, ctx);

    const btnRect = overlay.getBoundingClientRect();

    menu.style.position = 'absolute';
    menu.style.top = `${ btnRect.top }px`;
    menu.style.left = `${ btnRect.left }px`;
    menu.style.display = 'block';

    document.body.appendChild(menu);

    const hideMenu = (ev: MouseEvent) => {
      if (menu && !menu.contains(ev.target as Node) && ev.target !== overlay) {
        menu.style.display = 'none';
        document.body.removeEventListener('mousedown', hideMenu);
        if (menu.parentElement) {
          menu.parentElement.removeChild(menu);
        }
      }
    };

    nextTick(() => {
      document.body.addEventListener('mousedown', hideMenu);
    });
  }

  destroy() {
    document.querySelectorAll(`.${ HooksOverlay.defaultClassPrefix }-${ this.getSelector() }`).forEach((btn) => {
      if (btn && !(btn.matches(':hover') || (btn.querySelector(':hover') !== null))) {
        btn.remove();
      }
    });
  }

  setTheme() {
  }
}

export default new BadgeButtonOverlay('badge-state');