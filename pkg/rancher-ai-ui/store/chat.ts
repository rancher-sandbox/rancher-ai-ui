import { PRODUCT_NAME } from '../product';
import { CoreStoreSpecifics, CoreStoreConfig } from '@shell/core/types';
import {
  ConfirmationStatus, Message, MessageError, MessagePhase, Role
} from '../types';

interface Chat {
  id: string;
  msgIdCnt?: number;
  messages: Record<string, Message>;
  phase?: MessagePhase;
  error?: MessageError | null;
}

interface State {
  chats: Record<string, Chat>;
}

const getters = {
  messages: (state: State) => (chatId: string) => {
    return state.chats[chatId]?.messages || {};
  },
  message: (state: State) => ({ chatId, messageId }: { chatId: string; messageId: number | string }) => {
    return state.chats[chatId]?.messages[messageId] || null;
  },
  phase: (state: State) => (chatId: string) => {
    const messages = Object.values(state.chats[chatId]?.messages || {});

    if (messages.length && messages[messages.length - 1]?.confirmation?.status === ConfirmationStatus.Confirmed) {
      return MessagePhase.Confirming;
    }

    // If there is a message pending confirmation, enforce AwaitingConfirmation phase
    if (messages.find((msg) => msg.confirmation?.status === ConfirmationStatus.Pending)) {
      return MessagePhase.AwaitingConfirmation;
    }

    // If last message is from user, It mocks the MessagePhase.Processing phase in wsSend in advance
    if (messages.length && messages[messages.length - 1]?.role === Role.User) {
      return state.chats[chatId]?.phase;
    }

    // Enforce current phase if there is a message being processed
    if (!!messages.find((msg) => msg.completed !== undefined && msg.completed === false)) {
      return state.chats[chatId]?.phase;
    }

    return MessagePhase.Idle;
  },
  error: (state: State) => (chatId: string) => {
    return state.chats[chatId]?.error || null;
  }
};

const mutations = {
  init(state: State, chatId: string) {
    if (!chatId || state.chats[chatId]) {
      return;
    }

    state.chats[chatId] = {
      id:       chatId,
      messages: {},
    };
  },

  addMessage(state: State, args: { chatId: string; message: Message }) {
    const { chatId, message } = args;

    if (!chatId || !state.chats[chatId]) {
      return;
    }

    if (state.chats[chatId].msgIdCnt === undefined) {
      state.chats[chatId].msgIdCnt = 0;
    }

    const msgId = ++state.chats[chatId].msgIdCnt;

    message.timestamp = message.timestamp || new Date();

    state.chats[chatId].messages[msgId] = {
      ...message,
      id: msgId
    };
  },

  updateMessage(state: State, args: { chatId: string; message: Message }) {
    const { chatId, message } = args;

    if (!chatId || !state.chats[chatId] || !message.id) {
      return;
    }

    if (state.chats[chatId].messages[message.id]) {
      Object.assign(state.chats[chatId].messages[message.id], message);
    }
  },

  resetMessages(state: State, chatId: string) {
    if (!chatId || !state.chats[chatId]) {
      return;
    }

    state.chats[chatId].messages = {};
  },

  setPhase(state: State, args: { chatId: string; phase: MessagePhase }) {
    const { chatId, phase } = args;

    if (!chatId || !state.chats[chatId]) {
      return;
    }

    state.chats[chatId].phase = phase;
  },

  setError(state: State, args: { chatId: string; error: MessageError | null }) {
    const { chatId, error } = args;

    if (!chatId || !state.chats[chatId]) {
      return;
    }

    state.chats[chatId].error = error;
  }
};

const actions = {
  init({ commit }: { commit: Function }, { chatId, messages }: { chatId: string; messages: Message[] }) {
    commit('init', chatId);

    if (messages && messages.length) {
      messages.forEach((message) => {
        commit('addMessage', {
          chatId,
          message
        });
      });
    }
  },

  async addMessage({ commit, state }: { commit: Function; state: State }, { chatId, message }: { chatId: string; message: Message }) {
    commit('addMessage', {
      chatId,
      message
    });

    return state.chats[chatId]?.msgIdCnt;
  },

  updateMessage({ commit }: { commit: Function; state: State }, { chatId, message }: { chatId: string; message: Message }) {
    commit('updateMessage', {
      chatId,
      message
    });
  }
};

const factory = (): CoreStoreSpecifics => {
  return {
    state: (): State => {
      return { chats: {} };
    },
    getters:   { ...getters },
    mutations: { ...mutations },
    actions:   { ...actions },
  };
};
const config: CoreStoreConfig = { namespace: `${ PRODUCT_NAME }/chat` };

export default {
  specifics: factory(),
  config
};