<script setup lang="ts">
import { ref, watch, type PropType } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from '@shell/composables/useI18n';
import {
  RcDropdown,
  RcDropdownTrigger,
  RcDropdownItem,
} from '@components/RcDropdown';
import { Context } from '../../types';

function _id(item: Context) {
  return `${ item.tag  }_${  item.value }`;
}

const store = useStore();
const { t } = useI18n(store);

const selected = ref<Context[]>([]);
const isOpen = ref(false);

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
});

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

</script>

<template>
  <div
    v-if="props.options.length > 0"
    class="context-select"
  >
    <rc-dropdown
      placement="top-end"
      @update:open="isOpen = $event"
    >
      <rc-dropdown-trigger
        ghost
        small
      >
        <span class="text-label mr-5">
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
      <span
        v-for="(item, index) in selected"
        :key="index"
        v-clean-tooltip="item.description"
        class="vs__selected tag"
      >
        {{ item.tag }}:{{ item.value }}
        <button
          type="button"
          class="vs__deselect"
          @click="removeItem(item)"
        >
          <svg
            width="10"
            height="10"
          >
            <path d="M6.895455 5l2.842897-2.842898c.348864-.348863.348864-.914488 0-1.263636L9.106534.261648c-.348864-.348864-.914489-.348864-1.263636 0L5 3.104545 2.157102.261648c-.348863-.348864-.914488-.348864-1.263636 0L.261648.893466c-.348864.348864-.348864.914489 0 1.263636L3.104545 5 .261648 7.842898c-.348864.348863-.348864.914488 0 1.263636l.631818.631818c.348864.348864.914773.348864 1.263636 0L5 6.895455l2.842898 2.842897c.348863.348864.914772.348864 1.263636 0l.631818-.631818c.348864-.348864.348864-.914489 0-1.263636L6.895455 5z">
            </path>
          </svg>
        </button>
      </span>
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
}

.no-context {
  margin: 7px 0 7px 0;
}

.tag {
  height: 25px;
  line-height: 1;
  margin-right: 5px;
  margin-left: 0;
  padding: 0 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
