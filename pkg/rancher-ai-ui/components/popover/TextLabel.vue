<script lang="ts" setup>
import { defineProps } from 'vue';
import {
  RcDropdown,
  RcDropdownTrigger,
} from '@components/RcDropdown';

const props = defineProps({
  label: {
    type:    String,
    default: '',
  },
  disabled: {
    type:    Boolean,
    default: false,
  },
});
</script>

<template>
  <div class="textlabel-popper">
    <rc-dropdown
      placement="top"
    >
      <rc-dropdown-trigger
        ghost
        small
        :disabled="props.disabled"
      >
        <span class="inline-button label text-deemphasized">
          {{ label }}
        </span>
      </rc-dropdown-trigger>
      <template #dropdownCollection>
        <slot />
      </template>
    </rc-dropdown>
  </div>
</template>

<style lang='scss' scoped>
.textlabel-popper {
  :deep() .v-popper__popper {
    width: 95%;
    border: none;
  }
  :deep() .v-popper__inner {
    padding: 16px !important;
  }
  :deep() .v-popper__wrapper {
    width: 95%;
  }
}

.v-popper {
  .btn {
    height: 10px;
    min-height: 0;
    line-height: 1;
    background-color: transparent;
  }
}

.inline-button {
  cursor: pointer;
  user-select: none;
  text-decoration: underline;
  white-space: nowrap;
  margin-bottom: 2px;
}
</style>
