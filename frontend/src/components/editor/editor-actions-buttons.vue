<template>
  <div
    id="editor-actions-buttons"
    class="q-pa-md shadow-light-up"
  >
    <div
      v-if="!readOnly"
      id="updated-at-info"
      class="text-center text-body1"
    >
      <div
        v-if="saved === null"
      />

      <div
        v-else-if="saved"
        class="text-grey-8"
      >
        Algoritmo guardado el {{ formatDatetime(lastUpdate) }}
      </div>

      <div
        v-else
        class="text-negative"
      >
        Algoritmo pendiente de guardar
      </div>
    </div>

    <q-btn
      v-if="!route.query.preview"
      label="Volver a la lista de algoritmos"
      icon="arrow_back"
      class="float-right q-ml-md"
      color="primary"
      flat
      no-caps
      @click="goAlgorithmsPage"
    />

    <q-btn
      v-if="!readOnly"
      label="Visualizar publicación"
      class="float-right q-ml-lg"
      style="width:230px"
      color="primary"
      push
      @click="viewPublicGraph"
    />

    <export-pdf-button />

    <q-btn
      v-if="!readOnly"
      :loading="savingGraph"
      label="Guardar"
      class="float-right"
      style="width:120px"
      color="primary"
      push
      @click="saveGraph"
    />

    <q-btn
      v-if="readOnly && notPublicView && editor.data.isMaintainer"
      :loading="savingGraph"
      label="Editar algoritmo"
      class="float-right"
      style="width:180px"
      color="primary"
      push
      @click="editGraph"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';

import { useRoute, useRouter } from 'vue-router';

import Editor from 'src/services/editor';

import ExportPdfButton from 'components/buttons/export-pdf-button.vue';

import {
  ALGORITHMS_MAINTENANCE_INDEX,
  ALGORITHMS_PUBLIC_EDITOR,
  // ALGORITHMS_PUBLIC_EDITOR_PATH,
  ALGORITHMS_PUBLIC_SEARCH,
  ALGORITHMS_SEARCH,
} from 'src/router/routes/algorithms';

import { formatDatetime } from 'src/services/date';

const route = useRoute();
const router = useRouter();

const editor = inject('editor') as Editor;

const saved = computed(() => editor.graph.data.saved);
const savingGraph = computed(() => editor.graph.data.saving);
const lastUpdate = computed(() => editor.graph.lastUpdate);
const readOnly = computed(() => editor.data.readOnly);
const notPublicView = computed(() => route.name !== ALGORITHMS_PUBLIC_EDITOR);

const exitEditor = () => {
  if (route.name === ALGORITHMS_PUBLIC_EDITOR) {
    return router.push({
      name: ALGORITHMS_PUBLIC_SEARCH,
      query: {
        keyword: route.query.search,
      },
    });
  }

  if (route.query.search) {
    const name = route.name === ALGORITHMS_PUBLIC_EDITOR
      ? ALGORITHMS_PUBLIC_SEARCH : ALGORITHMS_SEARCH;

    return router.push({
      name,
      query: {
        keyword: route.query.search,
      },
    });
  }

  return router.push({ name: ALGORITHMS_MAINTENANCE_INDEX });
};

const goAlgorithmsPage = () => {
  if (readOnly.value) {
    exitEditor();
  } else if (editor.graph.isSaved) {
    exitEditor();
  } else {
    editor.toggleSaveDialog();
  }
};

const saveGraph = () => {
  if (editor.metadata.hasPendency()) {
    editor.metadata.alertPendency();
  } else {
    editor.graph.save();
  }
};

const editGraph = async () => {
  await editor.switchToMode();
};

const viewPublicGraph = async () => {
  if (editor.metadata.hasPendency()) {
    editor.metadata.alertPendency('publicar');
  } else {
    if (!editor.graph.isSaved) {
      await editor.graph.save();
    }

    // await editor.switchToMode();
    Editor.preview(route.query.id);
  }
};
</script>

<style lang="sass">
#updated-at-info
  position: absolute
  bottom: 21px
  left: 295px
  width: 425px
  -webkit-touch-callout: none
  -webkit-user-select: none
  -html-user-select: none
  -moz-user-select: none
  -ms-user-select: none
  user-select: none
</style>
