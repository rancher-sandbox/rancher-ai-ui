import { Store } from 'vuex';
import { Context, Message, Role } from '../../types';

export interface MessageTemplateFill {
  message: Message;
  payload: string;
}

export const enum ContextTag {
  SortableTableRow = '__sortable-table-row', // eslint-disable-line no-unused-vars
  DetailsState = '__details-state', // eslint-disable-line no-unused-vars
  StatusBanner = '__details-state-banner', // eslint-disable-line no-unused-vars
}

class TemplateMessageFactory {
  fill(store: Store<any>, ctx: Context, globalCtx: Context[]): Message {
    const t = store.getters['i18n/t'];

    let messageContent = t('ai.message.template.heyAnalyzeResource');
    let summaryContent = '';

    const resource = ctx.value as any;

    // Add resource as context
    const resourceCtx = [{
      tag:         resource?.kind?.toLowerCase(),
      description: resource?.kind,
      icon:        ctx.icon,
      value:       resource?.name
    }];

    // Add resource's namespace as context if available
    const resourceNamespaceCtx = resource?.namespace ? [{
      tag:         'namespace',
      description: t('ai.message.template.namespace'),
      icon:        'icon-namespace',
      value:       resource?.namespace
    }] : [];

    switch (ctx.tag) {
    case ContextTag.SortableTableRow:
    case ContextTag.DetailsState:
      summaryContent = t('ai.message.template.summary.analyseKindAndTroubleshoot', {
        kind: resource.kind,
        name: resource.name
      }, true);
      messageContent = t('ai.message.template.message.explainStateForResource', {
        state: resource.state,
        kind:  resource.kind,
        name:  resource.name
      }, true);

      if (resource.state !== 'active' && resource.state !== 'running' && resource.state !== 'ready') {
        messageContent += `\n  - ${ t('ai.message.template.bullet.identifyCause') }\n  - ${ t('ai.message.template.bullet.provideActions') }`;
      } else {
        messageContent += `\n  - ${ t('ai.message.template.bullet.confirmExpectedState') }`;
      }
      break;
    case ContextTag.StatusBanner:
      const { label, color } = resource.bannerProps || {};

      const issueText = color === 'error' ? t('ai.message.template.theError') : t('ai.message.template.anyProblems');

      summaryContent = t('ai.message.template.summary.analyseBanner', {
        label,
        issue: issueText
      }, true);
      messageContent = t('ai.message.template.message.explainStateForResource', {
        state: resource.state,
        kind:  resource.kind,
        name:  resource.name
      }, true);

      if (resource.state !== 'active' && resource.state !== 'running' && resource.state !== 'ready') {
        messageContent += `\n  - ${ t('ai.message.template.bullet.identifyCause') }\n  - ${ t('ai.message.template.bullet.provideActions') }`;
      } else {
        messageContent += `\n  - ${ t('ai.message.template.bullet.confirmExpectedState') }`;
      }
      break;
    default:
      break;
    }

    const contextContent = [
      ...(globalCtx || []),
      ...resourceCtx,
      ...resourceNamespaceCtx
    ].filter((item, index, self) => index === self.findIndex((c) => c.tag === item.tag && c.value === item.value));

    return {
      role: Role.User,
      messageContent,
      summaryContent,
      contextContent,
    };
  }
}

export default new TemplateMessageFactory();