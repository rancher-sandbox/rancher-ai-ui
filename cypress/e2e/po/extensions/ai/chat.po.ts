import ComponentPo from '@/cypress/e2e/po/components/component.po';

export default class ChatPo extends ComponentPo {
  constructor() {
    super('[data-testid="rancher-ai-ui-chat-container"]');
  }

  checkExists(): Cypress.Chainable<boolean> {
    return this.self().should('exist');
  }

  messages() {
    return this.self().get('[data-testid="rancher-ai-ui-chat-message"]');
  }

  getMessage(index: number) {
    return this.messages().eq(index);
  }

  getTemplateMessage(templateName: string) {
    return this.self().get(`[data-testid="rancher-ai-ui-chat-message-template-${ templateName }"]`);
  }
}
