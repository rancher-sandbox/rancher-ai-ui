/* eslint-disable no-unused-vars */

interface Error {
  message: string;
}

export interface ConnectionError extends Error {
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
}

export const enum Role {
  User = 'user',
  Assistant = 'assistant',
  System = 'system',
}

export const enum ContentType {
  Thinking = 'thinking',
  Result = 'result',
}

export interface Message {
  id?: number | string;
  role: Role;
  content?: string;
  contentType?: ContentType;
  completed?: boolean;
  timestamp?: number;
  context?: Context[];
  isExpanded?: boolean;
}

export interface Agent {
  id?: string;
  name: string;
  version: string;
}

export interface Context {
  tag: string;
  value: string;
  description?: string;
  icon?: string;
}
