<template>
  <q-card
    v-if="fixedMetadata"
    class="q-ma-xs q-mb-lg"
  >
    <q-card-section class="q-pa-none">
      <div class="q-pa-md">
        <div>
          <q-img
            v-if="fixedMetadata.recommendation_type === FORMAL_RECOMMENDATION"
            :src="GradeIcon"
            width="60px"
            class="float-right"
          />

          <div
            class="text-body1 text-bold text-primary"
            style="text-transform: uppercase"
          >
            {{ props.hideIndex ? '' : `${fixedMetadata.index}. ` }}{{
              fixedMetadata.recommendation_type ?
                getRecommendationTypeLabel(fixedMetadata.recommendation_type)
                : 'No se seleccionó el tipo de recomendación'
            }}
          </div>
        </div>

        <div
          v-if="fixedMetadata.intervention_type || fixedMetadata.certainty_of_the_evidence"
          class="row q-pt-md"
          style="height: 90px"
        >
          <div
            v-if="fixedMetadata.intervention_type"
            class="col-6 q-pr-sm"
          >
            <div
              class="row full-width full-height rounded-borders"
              style="background-color: #616161"
            >
              <div class="col-7">
                <div class="full-width full-height flex items-center justify-center">
                  <div class="text-center text-white">
                    <div><b>Tipo de intervención</b></div>
                    <div>{{ translateInterventionType(fixedMetadata.intervention_type) }}</div>
                  </div>
                </div>
              </div>

              <div class="col-5">
                <div class="full-width full-height flex items-center justify-center">
                  <q-img
                    v-if="fixedMetadata.intervention_type === INTERVENTION_TYPES.DIAGNOSIS"
                    :src="DiagnosisIcon"
                    width="48px"
                    class="q-ml-sm"
                  />

                  <q-img
                    v-if="fixedMetadata.intervention_type === INTERVENTION_TYPES.TREATMENT"
                    :src="TreatmentIcon"
                    width="50px"
                    class="q-ml-sm"
                  />

                  <q-img
                    v-if="
                    fixedMetadata.intervention_type === INTERVENTION_TYPES.POPULATION_CLASSIFICATION
                    "
                    :src="PopulationClassificationIcon"
                    width="60px"
                    class="q-ml-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="isFormal && fixedMetadata.certainty_of_the_evidence"
            class="col-6 q-pl-sm bg-secondary rounded-borders"
          >
            <div class="full-width full-height flex items-center
            justify-center text-center text-white">
              <div>
                <div>
                  <b>Certeza de la evidencia</b>
                </div>

                <div>
                  {{ translateCertainty(fixedMetadata.certainty_of_the_evidence) }} <q-img
                  v-for="index in certaintyRange"
                  :src="CertaintyIcon"
                  :key="`certainty${index}`"
                  width="24px"
                  class="q-ml-sm"
                />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="fixedMetadata.description"
          class="q-pt-md"
        >
          <div class="text-primary"><b>Transcripción original</b></div>

          <div>{{ fixedMetadata.description }}</div>
        </div>
      </div>

      <q-separator />

      <recommendation-arrows
        v-if="fixedMetadata.intervention && fixedMetadata.comparator"
        :fixed-metadata="fixedMetadata"
        class="q-my-md q-mx-sm"
      />

      <q-separator
        v-if="(
          fixedMetadata.implementation_considerations
          || fixedMetadata.additional_comments
          || fixedMetadata.recommendation_source
        )"
      />

      <div
        v-if="(
          fixedMetadata.comparator
          || fixedMetadata.implementation_considerations
          || fixedMetadata.additional_comments
          || fixedMetadata.recommendation_source
        )"
      >
        <div class="q-pt-md q-px-md">
          <div
            v-if="fixedMetadata.implementation_considerations"
            class="q-pb-lg"
          >
            <div class="q-pb-sm text-primary"><b>Consideraciones de implementación</b></div>

            <div>{{ fixedMetadata.implementation_considerations }}</div>
          </div>

          <div
            v-if="fixedMetadata.additional_comments"
            class="q-pb-lg"
          >
            <div class="q-pb-sm text-primary"><b>Comentarios adicionales</b></div>

            <div>{{ fixedMetadata.additional_comments }}</div>
          </div>

          <div
            v-if="fixedMetadata.recommendation_source"
            class="q-pb-lg"
          >
            <div class="q-pb-sm text-primary"><b>Fuente de recomendación</b></div>

            <div>{{ fixedMetadata.recommendation_source }}</div>
          </div>
        </div>
      </div>

      <q-separator
        v-if="fixedMetadata.links && fixedMetadata.links.length"
      />

      <div
        v-if="fixedMetadata.links && fixedMetadata.links.length"
        class="q-pa-lg"
      >
        <div class="q-pb-sm text-primary"><b>Enlaces</b></div>

        <q-card
          v-for="link of fixedMetadata.links"
          :key="`link-${fixedMetadata.index}-${link.index}`"
          class="q-mb-md"
        >
          <q-card-section>
            <div class="q-pb-sm"><b>{{ link.type }}</b>
            </div>

            <div class="link-wrap"><a
              :href="link.url"
              target="_blank"
              class="text-primary"
            >
              {{ link.url }}
            </a></div>
          </q-card-section>
        </q-card>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onBeforeMount,
  inject,
  ref,
} from 'vue';

import { IFixedMetadata } from 'src/services/editor/constants/metadata';

import Editor from 'src/services/editor';

import {
  FORMAL_RECOMMENDATION,
  RECOMMENDATION_TYPES,
  getRecommendationTypeLabel,
} from 'src/services/editor/constants/metadata/recommendation_type';

import RecommendationArrows from 'components/items/recommendations/recommendation-arrows.vue';

import GradeIcon from 'src/assets/imgs/grade_logo.png';
import CertaintyIcon from 'src/assets/imgs/certainty_2.png';
import DiagnosisIcon from 'src/assets/imgs/diagnosis.png';
import TreatmentIcon from 'src/assets/imgs/treatment_2.png';
import PopulationClassificationIcon from 'src/assets/imgs/population_classification.png';

import { INTERVENTION_TYPES, translateInterventionType } from 'src/services/editor/constants/metadata/intervention';
import { CERTAINTY, translateCertainty } from 'src/services/editor/constants/metadata/certainty';
import { orderRecommendations } from 'src/services/recommendations';

const editor = inject('editor') as Editor;

const props = defineProps({
  index: {
    type: Number,
    required: true,
  },
  hideIndex: {
    type: Boolean,
    default: false,
  },
});

const fixedMetadata = ref<IFixedMetadata | null>(null);
const certaintyRange = ref(0);

const isFormal = computed(
  () => fixedMetadata.value
    && fixedMetadata.value.recommendation_type === RECOMMENDATION_TYPES[0].value,
);

const recommendation = computed(() => editor.metadata.data.recommendationToShow);

onBeforeMount(() => {
  // show single recommendation
  if (recommendation.value) {
    fixedMetadata.value = recommendation.value?.data || null;
  } else {
    // show all recommendations
    const metadata = editor.metadata.getFromElement();

    if (metadata) {
      const { fixed } = metadata;

      const orderedRecommendations = orderRecommendations(fixed);

      fixedMetadata.value = { ...orderedRecommendations[props.index - 1] };
    }
  }

  if (fixedMetadata.value.certainty_of_the_evidence) {
    if (fixedMetadata.value.certainty_of_the_evidence === CERTAINTY.VERY_LOW) {
      certaintyRange.value = 1;
    }

    if (fixedMetadata.value.certainty_of_the_evidence === CERTAINTY.LOW) {
      certaintyRange.value = 2;
    }

    if (fixedMetadata.value.certainty_of_the_evidence === CERTAINTY.MODERATE) {
      certaintyRange.value = 3;
    }

    if (fixedMetadata.value.certainty_of_the_evidence === CERTAINTY.HIGH) {
      certaintyRange.value = 4;
    }
  }
});

onBeforeUnmount(() => {
  editor.metadata.clearMetadata();
});
</script>

<style lang="sass">
.link-wrap
  white-space: pre           /* CSS 2.0 */
  white-space: pre-wrap      /* CSS 2.1 */
  white-space: pre-line      /* CSS 3.0 */
  white-space: -pre-wrap    /* Opera 4-6 */
  white-space: -o-pre-wrap   /* Opera 7 */
  white-space: -moz-pre-wrap /* Mozilla */
  white-space: -hp-pre-wrap  /* HP Printers */
  word-wrap: break-word      /* IE 5+ */
</style>
