import { PRODUCT_NAME } from '../product';
import { CoreStoreSpecifics, CoreStoreConfig } from '@shell/core/types';
import { Message, MessageError } from '../types';

interface Chat {
  id: string;
  messages: Record<string, Message>;
  msgIdCnt?: number;
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