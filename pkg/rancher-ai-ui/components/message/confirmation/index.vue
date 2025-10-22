<script setup lang="ts">
import { ref, type PropType } from 'vue';
import { useStore } from 'vuex';
import RcButton from '@components/RcButton/RcButton.vue';
import { MessageActionConfirmation, ConfirmationType } from '../../../types';

const store = useStore();
const t = store.getters['i18n/t'];

const props = defineProps({
  value: {
    type:    Object as PropType<MessageActionConfirmation>,
    default: () => ({} as MessageActionConfirmation),
  }
});

const emit = defineEmits(['confirm']);

const confirmed = ref(false);

function confirm(value: boolean) {
  emit('confirm', value);
  confirmed.value = true;
}
</script>

<template>
  <div class="confirmation-action">
    <div class="confirmation-message">
      <p>{{ t('ai.confirmation.message') }}</p>
    </div>
    <div class="confirmation-buttons">
      <div
        v-if="props.value.type === ConfirmationType.Delete"
        class="delete-confirmation"
      >
      </div>
      <div
        v-else
        class="standard-confirmation"
      >
        <RcButton
          small
          secondary
          :disabled="confirmed"
          @click="confirm(true)"
        >
          {{ t('ai.confirmation.yes') }}
        </RcButton>
        <!-- <RcButton
          small
          secondary
          :disabled="confirmed"
          @click="confirm(false)"
        >
          {{ t('ai.confirmation.no') }}
        </RcButton> -->
      </div>
    </div>
  </div>
</template>

<style lang='scss' scoped>
.confirmation-message {
  margin-bottom: 12px;
}

.confirmation-buttons, .standard-confirmation, .delete-confirmation {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>