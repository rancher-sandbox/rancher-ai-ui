/* eslint-disable no-unused-vars */

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
  // id: number
  role: Role;
  content?: string;
  contentType?: ContentType;
  completed?: boolean;
  timestamp?: number;
}

export interface Agent {
  id?: string;
  name: string;
  version: string;
}