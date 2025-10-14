import { Context } from '../../../types';
import { Store } from 'vuex';

export abstract class HooksOverlay {
  protected selector = '';
  protected static defaultClassPrefix = 'context-overlay';
  // eslint-disable-next-line no-unused-vars
  abstract create(store: Store<any>, target: HTMLElement, el: HTMLElement, ctx: Context): void;
  abstract remove(): void;

  getSelector() {
    return this.selector;
  }
}
