/* eslint-disable no-unused-vars */

export interface ChatError {
  key?:     string;
  message?: string;
  action?:  MessageAction;
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

export interface MessageAction {
  type: ActionType | string;
  label: string;
  description?: string;
  resource: ActionResource;
}

export interface Message {
  id?: number | string;
  role: Role;
  thinkingContent?: string;
  messageContent?: string;
  thinking?: boolean;
  completed?: boolean;
  timestamp?: Date;
  showThinking?: boolean;
  actions?: MessageAction[];
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
  model: string;
  version: string;
}

export interface Context {
  tag: string;
  value: string | object | null;
  hookId?: string;
  description?: string;
  icon?: string;
}
