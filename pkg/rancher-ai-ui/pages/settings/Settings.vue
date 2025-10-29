<script setup lang="ts">
import { ref, watch, toValue, computed } from 'vue';
import { useStore } from 'vuex';
import { cloneDeep } from 'lodash';

import { useFetch } from '@shell/components/Resource/Detail/FetchLoader/composables';
import { useI18n } from '@shell/composables/useI18n';
import { base64Decode, base64Encode } from '@shell/utils/crypto';
import LabeledSelect from '@shell/components/form/LabeledSelect.vue';
import LabeledInput from '@components/Form/LabeledInput/LabeledInput.vue';
import Checkbox from '@components/Form/Checkbox/Checkbox.vue';
import Banner from '@components/Banner/Banner.vue';
import { _EDIT } from '@shell/config/query-params';
import AsyncButton from '@shell/components/AsyncButton.vue';
import AdvancedSection from '@shell/components/AdvancedSection.vue';
import Loading from '@shell/components/Loading.vue';
import Password from '@shell/components/form/Password.vue';
import ToggleGroup from '../../components/toggle/toggle-group.vue';
import { AGENT_NAME, AGENT_NAMESPACE, AGENT_CONFIG_SECRET_NAME } from '../../product';
import { Settings, FormData, Workload } from './types';
import dayjs from 'dayjs';

const store = useStore();
const { t } = useI18n(store);

const enum ChatBotEnum {
  Local = 'ollama', // eslint-disable-line no-unused-vars
  OpenAI = 'openai', // eslint-disable-line no-unused-vars
  Gemini = 'gemini', // eslint-disable-line no-unused-vars
}

const models = {
  [ChatBotEnum.Local]:  ['qwen3:4b'],
  [ChatBotEnum.OpenAI]: [
    'gpt-4o',
    'gpt-4o-mini',
    'o3-mini',
    'o3',
    'o4-mini',
    'gpt-4.1',
    'gpt-4',
    'gpt-3.5-turbo',
  ],
  [ChatBotEnum.Gemini]: [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
  ]
};

const activeChatbotOptions = [
  {
    name:        t(`aiConfig.form.${ Settings.ACTIVE_CHATBOT }.options.${ ChatBotEnum.Local }.name`),
    description: t(`aiConfig.form.${ Settings.ACTIVE_CHATBOT }.options.${ ChatBotEnum.Local }.description`, {}, true),
    icon:        'icon-ollama',
    value:       ChatBotEnum.Local,
  },
  {
    name:        t(`aiConfig.form.${ Settings.ACTIVE_CHATBOT }.options.${ ChatBotEnum.OpenAI }.name`),
    description: t(`aiConfig.form.${ Settings.ACTIVE_CHATBOT }.options.${ ChatBotEnum.OpenAI }.description`, {}, true),
    icon:        'icon-openai',
    value:       ChatBotEnum.OpenAI,
  },
  {
    name:        t(`aiConfig.form.${ Settings.ACTIVE_CHATBOT }.options.${ ChatBotEnum.Gemini }.name`),
    description: t(`aiConfig.form.${ Settings.ACTIVE_CHATBOT }.options.${ ChatBotEnum.Gemini }.description`, {}, true),
    icon:        'icon-gemini',
    value:       ChatBotEnum.Gemini,
  },
];

const resource = useFetch(async() => {
  let data;

  try {
    data = await store.dispatch(`management/find`, {
      type: 'secret',
      id:   `${ AGENT_NAMESPACE }/${ AGENT_CONFIG_SECRET_NAME }`,
      opt:  { watch: true }
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Unable to fetch secret: ', { err });
  } finally {
    if (!data) {
      // create a new secret if one does not exist
      data = await store.dispatch('management/create', {
        type:     'secret',
        metadata: {
          namespace: AGENT_NAMESPACE,
          name:      AGENT_CONFIG_SECRET_NAME,
        },
        data: {
          [Settings.ACTIVE_CHATBOT]:      base64Encode(ChatBotEnum.Local),
          [Settings.OLLAMA_URL]:          base64Encode('http://10.144.122.2'),
          [Settings.OPENAI_API_KEY]:      base64Encode(''),
          [Settings.GOOGLE_API_KEY]:      base64Encode(''),
          [Settings.MODEL]:               base64Encode(models[ChatBotEnum.Local][0]),
          [Settings.ENABLE_RAG]:          base64Encode(''),
          [Settings.EMBEDDINGS_MODEL]:    base64Encode(''),
          [Settings.LANGFUSE_HOST]:       base64Encode(''),
          [Settings.LANGFUSE_PUBLIC_KEY]: base64Encode(''),
          [Settings.LANGFUSE_SECRET_KEY]: base64Encode(''),
          [Settings.SYSTEM_PROMPT]:       base64Encode(''),
        }
      });

      data.save();
    }
  }

  return data;
});

const formData = ref<FormData>(resource.value?.data?.data || {});
const modelOptions = ref(models[ChatBotEnum.Local]);
const chatbotConfigKey = ref<Settings.OLLAMA_URL | Settings.GOOGLE_API_KEY | Settings.OPENAI_API_KEY>(Settings.OLLAMA_URL);

const chatbotConfigComponent = computed(() => {
  return chatbotConfigKey.value === Settings.OLLAMA_URL ? LabeledInput : Password;
});

/**
 * Updates the form configuration based on the selected chatbot.
 * Sets the appropriate model options and config key for the selected chatbot.
 * @param chatbot The selected chatbot provider ('OpenAI', 'Gemini', or
 * 'Local').
 */
const updateFormConfig = (chatbot: ChatBotEnum) => {
  const modelField = formData.value[Settings.MODEL];

  if (modelField) {
    modelOptions.value = models[chatbot as ChatBotEnum];

    switch (chatbot) {
    case ChatBotEnum.OpenAI:
      chatbotConfigKey.value = Settings.OPENAI_API_KEY;
      break;
    case ChatBotEnum.Gemini:
      chatbotConfigKey.value = Settings.GOOGLE_API_KEY;
      break;
    case ChatBotEnum.Local:
    default:
      chatbotConfigKey.value = Settings.OLLAMA_URL;
      break;
    }
  }
};

/**
 * Selects the default chatbot based on values in the form data.
 * If no chatbot is currently selected, it calculates the default chatbot in the order: Ollama, Gemini and OpenAI
 */
function updateChatBotConfig() {
  if (!![ChatBotEnum.Gemini, ChatBotEnum.OpenAI, ChatBotEnum.Local].find((c) => c === formData.value[Settings.ACTIVE_CHATBOT])) {
    return;
  }

  let chatBot = ChatBotEnum.Local;

  if (formData.value[Settings.OLLAMA_URL]) {
    chatBot = ChatBotEnum.Local;
  } else if (formData.value[Settings.GOOGLE_API_KEY]) {
    chatBot = ChatBotEnum.Gemini;
  } else if (formData.value[Settings.OPENAI_API_KEY]) {
    chatBot = ChatBotEnum.OpenAI;
  }

  formData.value[Settings.ACTIVE_CHATBOT] = chatBot;
}

/**
 * Watches for changes in the resource and updates the form data.
 * Decodes base64-encoded values and initializes the form with the decoded data.
 * Sets the default chatbot if none is selected.
 */
watch(resource, (newResource) => {
  const resourceClone = cloneDeep(newResource?.data?.data);

  for (const entry in resourceClone) {
    resourceClone[entry] = base64Decode(resourceClone[entry]);
  }

  formData.value = resourceClone;

  updateChatBotConfig();

  updateFormConfig(formData.value[Settings.ACTIVE_CHATBOT] as ChatBotEnum);
});

/**
 * Updates the form data value for a given key.
 * If the key is the active chatbot, update the form configuration and set the
 * default model.
 *
 * @param key The key in the form data to update.
 * @param val The value to set for the key.
 */
const updateValue = (key: Settings, val: ChatBotEnum | string) => {
  formData.value[key] = val;

  if (key === Settings.ACTIVE_CHATBOT) {
    updateFormConfig(val as ChatBotEnum);
    formData.value[Settings.MODEL] = models[val as keyof typeof models][0];
  }
};

/**
 * Saves the form data by encoding values in base64 and dispatching the save
 * action.
 *
 * @param btnCB Callback function to notify the result of the save operation.
 */
const save = async(btnCB: (arg: boolean) => void) => { // eslint-disable-line no-unused-vars
  try {
    const formDataToSave: { [key: string]: string } = {};
    const formDataObject = toValue(formData.value);

    for (const key of Object.keys(formDataObject) as Array<keyof FormData>) {
      const value = formDataObject[key];

      formDataToSave[key] = base64Encode(value || '');
    }

    resource.value.data.data = formDataToSave;
    await resource.value.data.save();

    // redeploy the rancher-ai-agent deployment after save
    const deployment = await store.dispatch('management/find', {
      type: 'apps.deployment',
      id:   `${ AGENT_NAMESPACE }/${ AGENT_NAME }`,
    }) as Workload;

    const metadata = deployment.spec.template.metadata ??= {};
    const annotations = metadata.annotations ??= {};

    annotations['cattle.io/timestamp'] = dayjs().toISOString();

    await deployment.save();

    btnCB(true);
  } catch (err) { // eslint-disable-line no-unused-vars
    btnCB(false);
  }
};
</script>

<template>
  <loading v-if="resource.loading" />
  <div v-else>
    <h1>
      {{ t('aiConfig.form.header') }}
    </h1>
    <label class="text-label">{{ t('aiConfig.form.description') }}</label>
    <hr class="mb-20">
    <h4>{{ t('aiConfig.form.section.provider.header') }}</h4>
    <label class="text-label mb-20">{{ t('aiConfig.form.section.provider.description') }}</label>
    <div class="form-values">
      <ToggleGroup
        :model-value="formData[Settings.ACTIVE_CHATBOT]"
        :items="activeChatbotOptions"
        @update:model-value="(val: string | undefined) => updateValue(Settings.ACTIVE_CHATBOT, val as ChatBotEnum)"
      />
      <banner
        v-if="formData[Settings.ACTIVE_CHATBOT] !== 'Local'"
        color="warning"
        class="mt-0 mb-0"
      >
        <span>
          <b>{{ t('aiConfig.form.section.provider.banner.header', {}, true) }}</b>
          <br>
          {{ t('aiConfig.form.section.provider.banner.description') }}
        </span>
      </banner>

      <div class="form-field">
        <component
          :is="chatbotConfigComponent"
          :value="formData[chatbotConfigKey]"
          :label="t(`aiConfig.form.${ chatbotConfigKey }.label`)"
          @update:value="(val: string) => updateValue(chatbotConfigKey, val)"
        />
        <label class="text-label">
          {{ t(`aiConfig.form.${ chatbotConfigKey }.description`) }}
        </label>
      </div>

      <div class="form-field">
        <labeled-select
          :value="formData[Settings.MODEL]"
          :label="t(`aiConfig.form.${ Settings.MODEL}.label`)"
          :options="modelOptions"
          @update:value="(val: string) => updateValue(Settings.MODEL, val)"
        />
        <label class="text-label">
          {{ t(`aiConfig.form.${ Settings.MODEL}.description`) }}
        </label>
      </div>

      <advanced-section
        :mode="_EDIT"
        class="mt-0 font-bold"
      >
        <h4 class="mt-30">
          {{ t('aiConfig.form.section.rag.header') }}
        </h4>
        <label class="text-label">{{ t('aiConfig.form.section.rag.description') }}</label>
        <hr>
        <banner
          class="form-sub"
          color="info"
        >
          {{ t('aiConfig.form.section.rag.banner') }}
        </banner>
        <div class="form-values form-sub mb-30">
          <checkbox
            :value="formData[Settings.ENABLE_RAG]"
            :label="t(`aiConfig.form.${ Settings.ENABLE_RAG}.label`)"
            value-when-true="true"
            @update:value="(val: string) => updateValue(Settings.ENABLE_RAG, val)"
          />

          <div class="form-field">
            <labeled-input
              :value="formData[Settings.EMBEDDINGS_MODEL]"
              :label="t(`aiConfig.form.${ Settings.EMBEDDINGS_MODEL}.label`)"
              @update:value="(val: string) => updateValue(Settings.EMBEDDINGS_MODEL, val)"
            />
            <label class="text-label">
              The model used to create embeddings for RAG
            </label>
          </div>
        </div>
        <h4>
          {{ t('aiConfig.form.section.langfuse.header') }}
        </h4>
        <label class="text-label">
          {{ t('aiConfig.form.section.langfuse.description') }}
        </label>
        <hr>
        <banner
          class="form-sub"
          color="info"
        >
          {{ t('aiConfig.form.section.langfuse.banner') }}
        </banner>
        <div class="form-values form-sub">
          <div class="form-field">
            <labeled-input
              :value="formData[Settings.LANGFUSE_HOST]"
              :label="t(`aiConfig.form.${ Settings.LANGFUSE_HOST}.label`)"
              @update:value="(val: string) => updateValue(Settings.LANGFUSE_HOST, val)"
            />
            <label class="text-label">
              {{ t(`aiConfig.form.${ Settings.LANGFUSE_HOST}.description`) }}
            </label>
          </div>

          <div class="form-field">
            <labeled-input
              :value="formData[Settings.LANGFUSE_PUBLIC_KEY]"
              :label="t(`aiConfig.form.${ Settings.LANGFUSE_PUBLIC_KEY}.label`)"
              @update:value="(val: string) => updateValue(Settings.LANGFUSE_PUBLIC_KEY, val)"
            />
            <label class="text-label">
              {{ t(`aiConfig.form.${ Settings.LANGFUSE_PUBLIC_KEY}.description`) }}
            </label>
          </div>

          <div class="form-field">
            <password
              :value="formData[Settings.LANGFUSE_SECRET_KEY]"
              :label="t(`aiConfig.form.${ Settings.LANGFUSE_SECRET_KEY}.label`)"
              @update:value="(val: string) => updateValue(Settings.LANGFUSE_SECRET_KEY, val)"
            />
            <label class="text-label">
              {{ t(`aiConfig.form.${ Settings.LANGFUSE_SECRET_KEY}.description`) }}
            </label>
          </div>
        </div>
      </advanced-section>
    </div>
    <div class="form-footer">
      <async-button
        action-label="Apply"
        @click="save"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.form-body {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.form-values {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 50rem;
  flex-grow: 1;
}

.form-footer {
  position: sticky;
  bottom: 24px;
  display: flex;
  flex-direction: row-reverse;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-sub {
  padding-left: 1.5rem;
}

div.mt-0 {
  margin-top: 0 !important;
}

div.mb-0 {
  margin-bottom: 0 !important;
}
</style>
