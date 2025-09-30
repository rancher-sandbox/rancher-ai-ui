import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import type { Context } from '../types';

export function useContextHandler() {
  const store = useStore();

  const context = computed(() => store.getters['ui-context/all']);
  const selectedContext = ref<Context[]>([]);
  const formattedContext = ref('');

  function selectContext(context: Context[]) {
    selectedContext.value = context;

    if (context.length === 0) {
      formattedContext.value = '';

      return;
    }

    const contextText = selectedContext.value.map((c) => `${ c.tag } : ${ c.value } - is ${ c.description }`).join('\n');

    formattedContext.value = `Context:\n${ contextText }\n\n`;
  }

  return {
    context,
    selectContext,
    formattedContext
  };
}
