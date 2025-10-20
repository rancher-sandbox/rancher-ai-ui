import { Context } from '../../../types';
import { Store } from 'vuex';
import { nextTick } from 'vue';
// @ts-expect-error missing icon
import chatIcon from '../../../assets/chat-icon.svg';
import MenuFactory from '../menu';
import { HooksOverlay } from './index';

const enum Theme {
  Light = 'light', // eslint-disable-line no-unused-vars
  Dark = 'dark', // eslint-disable-line no-unused-vars
}

class BadgeSlidingOverlay extends HooksOverlay {
  constructor(selector: string) {
    super();
    this.selector = selector;
  }

  private computeThemeProperties(badge: HTMLElement, theme: Theme): { badge: any, overlay: any } {
    const out = {
      badge:   { background: '' },
      overlay: {
        background: '',
        color:      'var(--primary-text)',
        border:     '',
      },
    };

    const bgColor = getComputedStyle(document.body).getPropertyValue('--body-bg');
    const opacity = theme === Theme.Dark ? '30%' : '10%';

    badge.classList.forEach((c) => {
      if (c.startsWith('bg-')) {
        const classId = c.replaceAll('bg-', '');

        switch (classId) {
        case 'success':
          out.overlay.background = '#459067';
          out.badge.background = `color-mix(in srgb, ${ out.overlay.background } ${ opacity }, ${ bgColor })`;
          break;
        case 'warning':
          out.overlay.background = getComputedStyle(document.body).getPropertyValue('--warning');
          out.badge.background = `color-mix(in srgb, ${ out.overlay.background } ${ opacity }, ${ bgColor })`;
          break;
        case 'error':
          const defColor = getComputedStyle(document.body).getPropertyValue('--error');

          out.overlay.border = `0.5px solid ${ defColor }`;
          out.overlay.background = '#E7A3A3';

          if (theme === Theme.Light) {
            out.badge.background = defColor;
          }
          break;
        case 'info':
          out.overlay.background = '#5F88CD';
          out.badge.background = `color-mix(in srgb, ${ out.overlay.background } ${ opacity }, ${ bgColor })`;
          break;
        default:
          break;
        }
      }
    });

    return out;
  }

  create(store: Store<any>, target: HTMLElement, badge: HTMLElement, ctx: Context) {
    const t = store.getters['i18n/t'];
    const theme = store.getters['prefs/theme'] as Theme;

    const {
      badge: badgeProps,
      overlay: overlayProps
    } = this.computeThemeProperties(badge, theme);

    const overlay = badge.cloneNode(true) as HTMLElement;

    const badgeRect = badge.getBoundingClientRect();
    const badgeStyle = getComputedStyle(badge);

    overlay.classList.add(`${ HooksOverlay.defaultClassPrefix }-${ this.getSelector() }`);
    overlay.style.zIndex = '10';
    overlay.style.backgroundColor = overlayProps.background;
    overlay.style.color = 'transparent';
    overlay.style.position = 'fixed';
    overlay.style.top = `${ badgeRect.top }px`;
    overlay.style.left = `${ badgeRect.left + 2 }px`;
    overlay.style.height = `${ badgeRect.height }px`;
    overlay.style.border = overlayProps.border || overlay.style.border;
    overlay.style.width = `${ badgeRect.width - 2 - parseFloat(badgeStyle.marginRight) - parseFloat(badgeStyle.marginLeft) }px`;
    overlay.style.paddingRight = '3px';
    overlay.style.transition = 'width 0.6s cubic-bezier(0.4,0,0.2,1)';
    overlay.style.cursor = 'pointer';
    overlay.textContent = t('ai.hooks.overlay.badgeSliding.label');
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'flex-end';
    overlay.style.whiteSpace = 'nowrap';
    overlay.style.overflow = 'hidden';

    badge.style.zIndex = '1000';
    badge.style.background = badgeProps.background;

    const icon = document.createElement('img');

    icon.src = chatIcon;
    icon.alt = 'SUSE';
    icon.style.height = `${ badgeRect.height - 5 }px`;
    icon.style.width = '15px';
    icon.style.verticalAlign = 'middle';
    icon.style.marginLeft = `${ 6 + (badgeRect.width * 0.05) }px`;
    icon.style.marginRight = '4px';

    overlay.appendChild(icon);

    ((target.parentElement || target) as HTMLElement).appendChild(overlay);

    // Animate width expansion after a short delay
    setTimeout(() => {
      overlay.style.width = `${ parseInt(overlay.style.width) + 30 }px`;
    }, 10);

    overlay.addEventListener('click', (e) => {
      this.action(store, e, overlay, ctx);
    });

    overlay.addEventListener('mouseenter', () => {
      overlay.style.width = `${ parseInt(overlay.style.width) + 100 + (badgeRect.width * 0.05) + parseFloat(badgeStyle.marginRight) + parseFloat(badgeStyle.marginLeft) }px`;
      overlay.style.color = overlayProps.color;
    });

    overlay.addEventListener('mouseleave', () => {
      if (!HooksOverlay.modifierKeyPressed) {
        this.destroy(target);
      } else {
        overlay.style.width = `${ parseInt(overlay.style.width) - 100 + (badgeRect.width * 0.05) + parseFloat(badgeStyle.marginRight) + parseFloat(badgeStyle.marginLeft) }px`;
      }
    });
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

  destroy(target: HTMLElement) {
    (target.parentElement as HTMLElement).querySelectorAll(`.${ HooksOverlay.defaultClassPrefix }-${ this.getSelector() }`).forEach((overlay: any) => {
      if (overlay && !(overlay.matches(':hover') || (overlay.querySelector(':hover') !== null))) {
        // Animate width shrink before removing
        overlay.style.transition = 'width 0.6s cubic-bezier(0.4,0,0.2,1), opacity 0.3s';
        overlay.style.width = `${ 0 }px`;
        overlay.style.opacity = '0';

        setTimeout(() => {
          overlay.remove();
        }, 500);
      }
    });
  }

  setTheme(badge: HTMLElement, theme: Theme) {
    nextTick(() => {
      const { badge: badgeProps } = this.computeThemeProperties(badge, theme);

      badge.style.background = badgeProps.background;
    });
  }
}

export default new BadgeSlidingOverlay('badge-state');