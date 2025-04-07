<template>
  <transition
    appear
    enter-active-class="animated fadeIn"
    leave-active-class="animated fadeOut"
  >
    <div
      v-if="showMetadataPanel"
      id="editor-metadata-panel"
      class="shadow-7"
      :class="{ 'editor-read-only': !editable }"
    >
      <div
        id="editor-metadata-panel-header"
        :class="{ 'editor-read-only': !editable }"
      >
        <div
          class="text-body1 text-bold text-indigo-10 q-px-md q-pt-md q-pb-sm"
          style="font-size:18px"
        >
          {{ data.name }}{{ elementLabel }}
        </div>

        <div
          v-if="editable"
          class="q-pt-sm q-pb-md q-px-md"
        >
          <q-btn
            class="q-mt-sm full-width"
            label="Nueva recomendación / buena práctica"
            color="primary"
            no-caps
            push
            @click="addBlock"
          />
        </div>
      </div>

      <div
        id="editor-metadata-panel-content"
        :class="{ 'editor-read-only': !editable }"
        class="q-pa-md"
      >
        <div v-if="loadingBlocks">
          <loading-spinner/>
        </div>

        <div v-else-if="!editable">
          <!-- SINGLE RECOMMENDATION PREVIEW -->
          <fixed-metadata-card
            v-if="recommendation"
            :index="recommendation.data.index"
            :hide-index="true"
          />

          <!-- ALL RECOMMENDATIONS PREVIEW -->
          <div v-else>
            <div v-if="!totalBlocks">
              No hay recomendaciones ni buenas prácticas en este nodo.
            </div>

            <fixed-metadata-card
              v-for="index of totalBlocks"
              :key="`metadata-fixed-form-${index}`"
              :index="index"
            />
          </div>
        </div>

        <div
          v-else-if="totalBlocks"
        >
          <!-- FIXED METADATA -->
          <metadata-fixed-form
            v-for="index of totalBlocks"
            :key="`metadata-fixed-form-${index}`"
            :index="index"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  reactive,
  inject,
  watch,
} from 'vue';

import Editor from 'src/services/editor';

import MetadataFixedForm from 'components/forms/editor/fixed-metadata-form.vue';
import LoadingSpinner from 'components/spinners/loading-spinner.vue';
import FixedMetadataCard from 'components/cards/metadata/fixed-metadata-card.vue';

const editor = inject('editor') as Editor;

const totalBlocks = computed(() => editor.metadata.data.totalBlocks);

const isActionElement = computed(() => editor.element.isAction());

const isEvaluationElement = computed(() => editor.element.isEvaluation());

const showRecommendation = computed(() => editor.metadata.data.recommendationToShow);

const recommendation = computed(() => editor.metadata.data.recommendationToShow);

const editable = computed(
  () => !editor.data.readOnly && (isActionElement.value || isEvaluationElement.value),
);

const showMetadataPanel = computed(
  () => editor.metadata.data.showPanel
    && (isActionElement.value || isEvaluationElement.value || showRecommendation.value),
);

watch(showMetadataPanel, () => {
  if (totalBlocks.value) {
    editor.element.updateRecommendationsTotals();

    editor.element.textarea.focus();
  }
});

const loadingBlocks = computed(() => editor.metadata.data.loadingBlocks);

const elementLabel = computed(() => {
  let label = '';

  if (recommendation.value?.originalElementId) {
    const recommendationElement = editor.element.getById(
      String(recommendation.value?.originalElementId),
    );

    if (recommendationElement) {
      label = editor.element.getLabel(recommendationElement);
    }
  } else {
    label = editor.element.getLabel();
  }

  return label ? `: ${label}` : '';
});

const data = reactive({
  title: '',
  name: '',
});

const setInitialValue = () => {
  data.title = editor.element.getTitle();
  data.name = editor.element.getName();
};

const addBlock = () => {
  editor.metadata.data.totalBlocks += 1;
};

watch(() => editor.element.data.selectedId, (value) => {
  editor.metadata.closeMetadataPanel();

  if (value) {
    setInitialValue();

    const metadata = editor.metadata.getFromElement();

    if (metadata) {
      const { fixed } = metadata;

      editor.metadata.data.totalBlocks = fixed.length;
    }

    setTimeout(() => {
      editor.metadata.openMetadataPanel();
    }, 100);
  }
});

onBeforeUnmount(() => {
  editor.metadata.resetTotalBlocks();
});
</script>

<style lang="sass">
#editor-metadata-panel-header
  position: absolute
  top: 0
  left: 0
  width: 100%
  height: 141px
  border-bottom: 1px solid #DDD

#editor-metadata-panel-header.editor-read-only
  height: 78px

#editor-metadata-panel-content
  position: absolute
  top: 141px
  left: 0
  width: 100%
  height: calc(100% - 141px)
  overflow-y: auto
  overflow-x: hidden

#editor-metadata-panel-content.editor-read-only
  top: 78px
  height: calc(100% - 77px)
</style>
