import { Context } from '../../../types';
import { Store } from 'vuex';

export abstract class HooksOverlay {
  protected selector = '';
  protected static defaultClassPrefix = 'context-overlay';
  protected static modifierKeyPressed = false;
  // eslint-disable-next-line no-unused-vars
  abstract create(store: Store<any>, target: HTMLElement, el: HTMLElement, ctx: Context): void;
  // eslint-disable-next-line no-unused-vars
  abstract action(store: Store<any>, e: Event, overlay: HTMLElement, ctx: Context): void;
  // eslint-disable-next-line no-unused-vars
  abstract destroy(target: HTMLElement): void;

  static setModifierKeyPressed(value: boolean): void {
    HooksOverlay.modifierKeyPressed = value;
  }

  // eslint-disable-next-line no-unused-vars
  abstract setTheme(target: HTMLElement, theme: string): void;

  getSelector() {
    return this.selector;
  }
}
