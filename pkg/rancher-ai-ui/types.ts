/* eslint-disable no-unused-vars */

export interface ChatError {
  key?:     string;
  message?: string;
  action?:  MessageActionLink;
}

export interface ConnectionError extends ChatError {
  code?: number;
}

export interface MessageError extends ChatError {
  code?: number;
}

export interface ConnectionParams {
  url: string;
  onopen?: (ev: Event) => any;
  onmessage?: (ev: MessageEvent) => any;
  onclose?: (ev: CloseEvent) => any;
  onerror?: (ev: Event) => any;
}

export const enum PanelState {
  Idle = 'idle',
  Loading = 'loading',
  Error = 'error',
  Ready = 'ready',
}

export const enum Tag {
  MessageStart = '<message>',
  MessageEnd = '</message>',
  ThinkingStart = '<think>',
  ThinkingEnd = '</think>',
  McpResultStart = '<mcp-response>',
  McpResultEnd = '</mcp-response>',
  ConfirmationStart = '<confirmation-response>',
  ConfirmationEnd = '</confirmation-response>',
  SuggestionsStart = '<suggestion>',
  SuggestionsEnd = '</suggestion>',
}

export const enum Role {
  User = 'user',
  Assistant = 'assistant',
  System = 'system',
}

export const enum ActionType {
  Link = 'link',
  Button = 'button',
  // Add more action types as needed
}

export interface ActionResource {
  kind?: string;
  type?: string;
  name?: string;
  namespace?: string;
  cluster?: string;
  detailLocation?: object;
}

export interface OperationPayload {
  op: string; // add, update, remove, etc.
  path: string;
  value?: any;
};

export const enum ConfirmationType {
  Patch = 'patch',
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
}

export interface MessageActionConfirmation {
  type: ConfirmationType | string;
  payload?: OperationPayload[];
  resource: ActionResource;
}

export interface MessageActionLink {
  type: ActionType | string;
  label: string;
  tooltip?: string;
  description?: string;
  resource: ActionResource;
}

export type MessageActionSuggestion = string;

export interface Message {
  id?: number | string;
  role: Role;
  thinkingContent?: string;
  messageContent?: string;
  summaryContent?: string;
  thinking?: boolean;
  completed?: boolean;
  timestamp?: Date;
  showThinking?: boolean;
  showCompleteMessage?: boolean;
  linkActions?: MessageActionLink[];
  confirmationAction?: MessageActionConfirmation | null;
  suggestionActions?: string[];
  source?: object;
}

export interface FormattedMessage extends Message {
  formattedThinkingContent?: string;
  formattedMessageContent?: string;
  isError?: boolean;
}

export interface Agent {
  id?: string;
  name: string;
  model: string; // model + version
}

export interface Context {
  tag: string;
  value: string | object | null;
  hookId?: string;
  description?: string;
  icon?: string;
}
