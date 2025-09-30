import { PRODUCT_NAME } from '../product';
import { CoreStoreSpecifics, CoreStoreConfig } from '@shell/core/types';
import { Message } from '../types';

interface Chat {
  id: string;
  messages: Record<string, Message>;
  msgIdCnt?: number;
}

interface State {
  chats: Record<string, Chat>;
}

const getters = {
  getMessages: (state: State) => (chatId: string) => {
    return state.chats[chatId]?.messages || {};
  },
  getMessage: (state: State) => ({ chatId, messageId }: { chatId: string; messageId: number | string }) => {
    return state.chats[chatId]?.messages[messageId] || null;
  }
};

const mutations = {
  addMessage(state: State, args: { chatId: string; message: Message }) {
    const { chatId, message } = args;

    if (!state.chats[chatId]) {
      state.chats[chatId] = {
        id:       chatId,
        messages: {},
      };
    }

    if (state.chats[chatId].msgIdCnt === undefined) {
      state.chats[chatId].msgIdCnt = 0;
    }

    const msgId = ++state.chats[chatId].msgIdCnt;

    state.chats[chatId].messages[msgId] = {
      ...message,
      id: msgId
    };
  },

  updateMessage(state: State, args: { chatId: string; message: Message }) {
    const { chatId, message } = args;

    if (!state.chats[chatId] || !message.id) {
      return;
    }

    if (state.chats[chatId].messages[message.id]) {
      state.chats[chatId].messages[message.id] = message;
    }
  }
};

const actions = {
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