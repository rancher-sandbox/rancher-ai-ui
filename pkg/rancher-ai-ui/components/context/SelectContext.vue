<script setup lang="ts">
import { ref, watch, type PropType } from 'vue';
import { useStore } from 'vuex';
import { Context } from '../../types';
import {
  RcDropdown,
  RcDropdownTrigger,
  RcDropdownItem,
} from '@components/RcDropdown';
import RcButton from '@components/RcButton/RcButton.vue';

function _id(item: Context) {
  return `${ item.tag  }_${  item.value }`;
}

const store = useStore();
const t = store.getters['i18n/t'];

const props = defineProps({
  options: {
    type: Array as PropType<Context[]>,
    default() {
      return [];
    },
  },
  autoSelect: {
    type: Array as PropType<Context[]>,
    default() {
      return [];
    },
  },
  disabled: {
    type:    Boolean,
    default: false,
  },
});

const selected = ref<Context[]>([]);
const isOpen = ref(false);

const emit = defineEmits([
  'update',
]);

watch(() => props.autoSelect, (newVal) => {
  selected.value = newVal;
  emit('update', selected.value);
}, { immediate: true });

watch(() => props.options, (newVal) => {
  selected.value = selected.value.filter((s) => newVal.find((n) => _id(n) === _id(s)));
  emit('update', selected.value);
});

function toggleItem(item: Context) {
  if (selected.value.find((i) => _id(i) === _id(item))) {
    removeItem(item);
  } else {
    addItem(item);
  }
}

function addItem(item: Context) {
  if (selected.value.find((i) => _id(i) === _id(item))) {
    return;
  }
  selected.value = [...selected.value, item];
  emit('update', selected.value);
}

function removeItem(item: Context) {
  selected.value = selected.value.filter((i) => _id(i) !== _id(item));
  emit('update', selected.value);
}

function reset() {
  selected.value = props.options;
  emit('update', selected.value);
}
</script>

<template>
  <div
    v-if="props.options.length > 0"
    class="context-select"
  >
    <rc-dropdown
      class="context-dropdown"
      placement="top-end"
      @update:open="isOpen = $event"
    >
      <rc-dropdown-trigger
        ghost
        small
        :disabled="props.disabled"
      >
        <i
          v-if="!props.disabled"
          class="icon icon-pin-outlined"
        />
        <span
          class="text-label mr-5"
          :class="{ 'ml-5': props.disabled }"
        >
          {{ t('ai.context.add') }}
        </span>
        <template #after>
          <i
            :class="{
              'icon icon-chevron-up text-label': isOpen,
              'icon icon-chevron-down text-label': !isOpen
            }"
          />
        </template>
      </rc-dropdown-trigger>
      <template #dropdownCollection>
        <rc-dropdown-item
          v-for="(opt, i) in props.options"
          :key="i"
          v-clean-tooltip="opt.description"
          @click="toggleItem(opt)"
        >
          {{ opt.tag }}:{{ opt.value }}
          <i
            v-if="selected.find((s) => _id(s) === _id(opt))"
            :class="{
              'icon icon-close': selected.find((s) => _id(s) === _id(opt)),
            }"
          />
          <template
            #before
          >
            <i
              v-if="opt.icon"
              class="icon"
              :class="opt.icon"
            />
          </template>
        </rc-dropdown-item>
      </template>
    </rc-dropdown>
    <div class="tags">
      <div
        v-for="(item, index) in selected"
        :key="index"
        v-clean-tooltip="item.description"
        class="vs__selected tag"
      >
        <div class="tag-content">
          <i
            :class="item.icon"
          />
          <span>
            {{ item.value }}
          </span>
        </div>
        <button
          type="button"
          class="vs__deselect"
          @click="removeItem(item)"
        />
      </div>
    </div>
    <div
      v-if="options.length !== selected.length"
      class="context-reset"
    >
      <RcButton
        small
        tertiary
        @click="reset"
      >
        <i class="icon icon-refresh mr-5" />
        {{ t('ai.context.reset') }}
      </RcButton>
    </div>
  </div>
  <span
    v-else
    class="text-muted no-context"
  >
    {{ t('ai.context.none') }}
  </span>
</template>

<style lang="scss" scoped>
.context-select, .tags {
  display: flex;
  flex-wrap: wrap;
  max-width: 100%;
  align-items: center;
  gap: 5px;
  color: var(--on-secondary);
}

.context-select {
  gap: 10px;
}

.no-context {
  margin: 7px 0 7px 0;
}

.tag {
  display: flex;
  flex-direction: row;
  gap: 5px;
  height: 25px;
  line-height: 1;
  margin-right: 5px;
  margin-left: 0;
  padding: 0 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;

  .tag-content {
    display: flex;
    justify-content: center;
    gap: 5px;
  }

  .vs__deselect {
    margin: 0;
  }
}

.vs__selected {
  border: solid 1px var(--secondary-border, var(--primary));
  color: var(--on-secondary, var(--primary));
}

.icon-pin-outlined {
  color: var(--on-secondary);
}
</style>
