import { useStore } from 'vuex';
import { computed } from 'vue';

export function useInputComposable() {
  const store = useStore();

  const inputText = computed(() => store.getters['rancher-ai-ui/input/text']);

  function updateInput(value: string) {
    store.commit('rancher-ai-ui/input/text', value);
  }

  function cleanInput(value: string) {
    return (value || '')
      .split('\n')
      .filter((line) => line.trim() !== '')
      .join('\n')
      .trim();
  }

  return {
    inputText,
    updateInput,
    cleanInput,
  };
}
