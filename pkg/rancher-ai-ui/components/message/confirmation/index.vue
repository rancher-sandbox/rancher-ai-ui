<script setup lang="ts">
import { computed, type PropType } from 'vue';
import { useStore } from 'vuex';
import RcButton from '@components/RcButton/RcButton.vue';
import { ConfirmationStatus, ConfirmationType, MessageConfirmation } from '../../../types';

const store = useStore();
const t = store.getters['i18n/t'];

const props = defineProps({
  value: {
    type:    Object as PropType<MessageConfirmation>,
    default: () => ({} as MessageConfirmation),
  },
  messageContent: {
    type:    String,
    default: ''
  }
});

const emit = defineEmits(['confirm']);

// TODO the description should be generated server-side
const confirmationLabel = computed(() => {
  const msg = t('ai.confirmation.message.question');

  if (!props.messageContent) {
    const {
      kind, name, namespace, cluster
    } = props.value.action?.resource || {};

    const description = props.value.action?.payload?.reduce((acc: string, curr) => {
      const { op, value, path } = curr;

      return `${ acc + t('ai.confirmation.message.description', {
        op,
        value: typeof value === 'string' ? value : JSON.stringify(value),
        path,
        name,
        kind,
        namespace,
        cluster
      }, true)  }<br>`;
    }, '');

    return `${ description  }<br>${  msg }`;
  }

  return msg;
});
</script>

<template>
  <div class="confirmation-action">
    <div class="confirmation-message">
      <span
        v-clean-html="confirmationLabel"
      />
    </div>
    <div
      v-if="props.value.status === ConfirmationStatus.Pending"
      class="confirmation-buttons"
    >
      <div
        v-if="props.value.action?.type === ConfirmationType.Delete"
        class="delete-confirmation"
      >
        <!-- TODO Delete confirmation buttons -->
      </div>
      <div
        v-else
        class="standard-confirmation"
      >
        <RcButton
          small
          tertiary
          @click="emit('confirm', false)"
        >
          <span class="rc-button-label">
            {{ t('ai.confirmation.cancel') }}
          </span>
        </RcButton>
        <RcButton
          small
          tertiary
          @click="emit('confirm', true)"
        >
          <span class="rc-button-label">
            {{ t('ai.confirmation.confirm') }}
          </span>
        </RcButton>
      </div>
    </div>
    <div
      v-else
      class="confirmation-status"
    >
      <template v-if="props.value.status === ConfirmationStatus.Confirmed">
        <div class="status-confirmed">
          <i class="icon icon-checkmark" />
          <p>
            {{ t('ai.confirmation.confirmed') }}
          </p>
        </div>
      </template>
      <template v-else-if="props.value.status === ConfirmationStatus.Canceled">
        <div class="status-canceled">
          <i class="icon icon-close canceled" />
          <p>
            {{ t('ai.confirmation.canceled') }}
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang='scss' scoped>
.confirmation-message {
  margin-bottom: 12px;

  span {
    word-break: break-word;
    white-space: pre-line;
    list-style-position: inside;
  }
}

.confirmation-buttons, .standard-confirmation, .delete-confirmation {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.confirmation-status {
  .status-confirmed , .status-canceled {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    justify-content: flex-end;
  }

  .status-confirmed {
    .icon {
      color: var(--success);
    }
  }
  .status-canceled {
    .icon {
      color: var(--error);
    }
  }
}

.rc-button-label {
  word-break: break-word;
  white-space: pre-line;
  list-style-position: inside;
}
</style>