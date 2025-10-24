import { useStore } from 'vuex';
import { computed, onBeforeUnmount, ref } from 'vue';

export function useInputComposable() {
  const store = useStore();

  const promptText = ref('');

  const inputText = computed(() => store.getters['rancher-ai-ui/input/text'] || promptText.value);

  function updateInput(event: Event) {
    store.commit('rancher-ai-ui/input/text', '');
    promptText.value = (event?.target as HTMLTextAreaElement)?.value;
  }

  function cleanInput(value: string) {
    return (value || '')
      .split('\n')
      .filter((line) => line.trim() !== '')
      .join('\n')
      .trim();
  }

  function clearInput() {
    store.commit('rancher-ai-ui/input/text', '');
    promptText.value = '';
  }

  onBeforeUnmount(() => {
    clearInput();
  });

  return {
    inputText,
    updateInput,
    cleanInput,
    clearInput
  };
}
