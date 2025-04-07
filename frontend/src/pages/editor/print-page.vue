<template>
  <div>
    <div
      v-if="loading"
      class="absolute-top-left full-width full-height z-max bg-white
      flex justify-center items-center"
    >
      <loading-spinner
        v-if="loading"
        color="primary"
      />
    </div>

    <div
      id="editor"
      class="print-mode bg-grey-4 overflow-hidden absolute-top-left full-width full-height"
    >
      <div
        id="editor-content" class="bg-white overflow-auto full-height"
      >
        <!-- STAGE -->
        <editor-stage />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, inject, ref } from 'vue';
import { useRoute } from 'vue-router';

import { GRAPH_MODE_PRINT } from 'src/services/editor/types';
import Editor from 'src/services/editor';
import LoadingSpinner from 'components/spinners/loading-spinner.vue';
import EditorStage from 'components/editor/editor-stage.vue';

const route = useRoute();

const editor = inject('editor') as Editor;

const loading = ref(true);

onMounted(async () => {
  const { id, logo } = route.query;

  const putLogoOnHeader = logo === 'true';

  if (id && typeof id === 'string') {
    editor.setIsMaintainer(false);

    editor.graph.setMode(GRAPH_MODE_PRINT);

    editor.setReadOnly(true);

    await editor.graph.open(id);

    await editor.graph.setToPrint(putLogoOnHeader);

    setTimeout(async () => {
      loading.value = false;

      editor.element.hideAllPorts();

      editor.graph.exportPDF();
    }, 2000);
  }
});
</script>

<style lang="sass" scoped>
@import "src/css/editor"
</style>
