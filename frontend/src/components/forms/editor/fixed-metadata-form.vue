<template>
  <q-card class="q-mb-md">
    <q-card-section class="q-pa-none">
      <q-expansion-item
        :label="blockName"
        default-opened
        header-class="bg-grey-2 text-primary text-body2"
        expand-icon-class="text-primary"
      >
        <q-card>
          <q-card-section class="q-pa-none">
            <div class="q-px-md q-py-md">
              <q-select
                v-model="data.recommendation_type"
                :options="RECOMMENDATION_TYPES"
                class="q-mb-lg"
                label="Tipo de recomendación"
                map-options
                emit-value
                dense
                @update:model-value="setProp('recommendation_type')"
              />

              <q-input
                v-model="data.description"
                label="Transcripción original"
                type="textarea"
                spellcheck="false"
                dense
                @update:model-value="setProp('description')"
              />

              <q-select
                v-model="data.intervention_type"
                :options="[
                  INTERVENTION_TYPES_SPANISH[TREATMENT],
                  INTERVENTION_TYPES_SPANISH[DIAGNOSIS],
                  INTERVENTION_TYPES_SPANISH[POPULATION_CLASSIFICATION],
                ]"
                class="q-my-lg"
                label="Tipo de intervención"
                dense
                @update:model-value="setProp('intervention_type')"
              />

              <q-input
                v-model="data.intervention"
                :rules="[val => !!val || 'Informe la intervención.']"
                ref="refIntervention"
                class="q-mt-md"
                label="Intervención"
                spellcheck="false"
                dense
                @update:model-value="setProp('intervention')"
              />

              <q-input
                v-model="data.comparator"
                :rules="[val => !!val || 'Informe el comparador.']"
                ref="redComparator"
                class="q-mt-md"
                label="Comparador"
                spellcheck="false"
                dense
                @update:model-value="setProp('comparator')"
              />

              <q-select
                v-if="isFormal"
                v-model="data.strength"
                :options="STRENGTH"
                :rules="[val => !!val || 'Informe la fuerza del recomendación.']"
                ref="refStrength"
                class="q-my-lg"
                label="Fuerza de la recomendación"
                map-options
                emit-value
                dense
                @update:model-value="setProp('strength')"
              />

              <q-select
                v-model="data.direction"
                :options="DIRECTIONS"
                :rules="[val => !!val || 'Informe la dirección.']"
                ref="refDirection"
                class="q-my-lg"
                label="Dirección"
                map-options
                emit-value
                dense
                @update:model-value="setProp('direction')"
              />

              <q-select
                v-if="isFormal"
                v-model="data.certainty_of_the_evidence"
                :options="[
                  CERTAINTY_SPANISH[HIGH],
                  CERTAINTY_SPANISH[MODERATE],
                  CERTAINTY_SPANISH[LOW],
                  CERTAINTY_SPANISH[VERY_LOW],
                ]"
                class="q-my-lg"
                label="Certeza de la evidencia"
                dense
                @update:model-value="setProp('certainty_of_the_evidence')"
              />

              <q-input
                v-model="data.implementation_considerations"
                label="Consideraciones de implementación"
                class="q-my-lg"
                type="textarea"
                spellcheck="false"
                dense
                @update:model-value="setProp('implementation_considerations')"
              />

              <q-input
                v-model="data.additional_comments"
                label="Comentarios adicionales"
                class="q-my-lg"
                type="textarea"
                spellcheck="false"
                dense
                @update:model-value="setProp('additional_comments')"
              />

              <q-input
                v-model="data.recommendation_source"
                label="Fuente de recomendación"
                class="q-my-lg"
                type="textarea"
                spellcheck="false"
                dense
                @update:model-value="setProp('recommendation_source')"
              />

              <metadata-links-form
                :block-index="props.index"
              />
            </div>

            <q-separator />

            <div class="bg-grey-2">
              <q-btn
                :label="`Borrar ${blockName}`"
                class="full-width"
                color="negative"
                icon="close"
                no-caps
                flat
                @click="showDeleteBlockDialog = true"
              />
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <!-- REMOVE METADATA BLOCK -->
      <delete-modal
        :show="showDeleteBlockDialog"
        title="¿Tienes certeza de que deseas eliminar estas informaciones?"
        :item-name="blockName"
        @cancel="showDeleteBlockDialog = false"
        @confirm="deleteBlock"
      />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onBeforeMount,
  onMounted,
  reactive,
  inject,
  ref,
} from 'vue';

import Editor from 'src/services/editor';
import MetadataLinksForm from 'components/forms/editor/fixed-metadata-links-form.vue';
import DeleteModal from 'components/modals/simple-modal.vue';

import { BOTH, DIRECTIONS } from 'src/services/editor/constants/metadata/direction';

import {
  FORMAL_RECOMMENDATION,
  RECOMMENDATION_TYPES,
} from 'src/services/editor/constants/metadata/recommendation_type';

import {
  STRENGTH,
  STRONG_RECOMMENDATION,
} from 'src/services/editor/constants/metadata/recommendation_strength';

import { QInput, QSelect } from 'quasar';
import {
  DIAGNOSIS,
  INTERVENTION_TYPES_SPANISH,
  POPULATION_CLASSIFICATION,
  TREATMENT,
  getInterventionTypeKey,
  translateInterventionType,
} from 'src/services/editor/constants/metadata/intervention';

import {
  CERTAINTY_SPANISH, getCertaintyKey,
  HIGH,
  LOW,
  MODERATE, translateCertainty,
  VERY_LOW,
} from 'src/services/editor/constants/metadata/certainty';

const editor = inject('editor') as Editor;

const props = defineProps({
  index: {
    type: Number,
    default: 0,
  },
});

const showDeleteBlockDialog = ref(false);

const refIntervention = ref<QInput>();
const redComparator = ref<QInput>();
const refDirection = ref<QSelect>();
const refStrength = ref<QSelect>();

// we need to set a timeout for each prop (ex: validation[propName] )
const validation: { [key: string]: ReturnType<typeof setTimeout> } = reactive({});

const data = reactive({
  index: 1,
  description: '',
  recommendation_type: '',
  intervention_type: '',
  intervention: '',
  comparator: '',
  direction: '',
  strength: '',
  certainty_of_the_evidence: '',
  implementation_considerations: '',
  additional_comments: '',
  recommendation_source: '',
  links: [],
});

const blockName = computed(() => `${props.index}. ${
  data.recommendation_type ? RECOMMENDATION_TYPES.find(
    (type) => type.value === data.recommendation_type,
  )?.label : 'Seleccione el tipo de recomendación'
}`);

const isFormal = computed(() => data.recommendation_type === RECOMMENDATION_TYPES[0].value);

const validateInterventionAndComparator = (propName: string) => {
  clearTimeout(validation[propName]);

  if (propName === 'intervention') {
    if (data.intervention && !data.comparator) {
      redComparator.value?.validate();
    }
  }

  if (propName === 'comparator') {
    if (data.comparator && !data.intervention) {
      refIntervention.value?.validate();
    }
  }
};

const validateDirectionAndStrength = (propName?: string) => {
  if (data.recommendation_type === FORMAL_RECOMMENDATION) {
    if (data.direction && data.strength) {
      if (
        data.strength === STRONG_RECOMMENDATION
        && data.direction === BOTH
      ) {
        if (propName === 'strength') {
          data.direction = '';

          editor.metadata.setMetadata(props.index, 'direction', data);
        } else if (propName === 'direction') {
          data.strength = '';

          editor.metadata.setMetadata(props.index, 'strength', data);
        }
      }
    }

    if (data.direction && !data.strength) {
      refStrength.value?.validate();
    }

    if (data.strength && !data.direction) {
      refDirection.value?.validate();
    }

    if (!data.direction && !data.strength) {
      refStrength.value?.validate();

      refDirection.value?.validate();
    }
  } else if (
    // non-formal recommendations must have direction
    data.recommendation_type
  ) {
    if (!data.direction) {
      refDirection.value?.validate();
    }
  }
};

const setProp = (propName: string) => {
  if (['intervention', 'comparator'].includes(propName)) {
    validateInterventionAndComparator(propName);
  }

  if (['direction', 'strength'].includes(propName)) {
    validateDirectionAndStrength(propName);
  }

  if (propName === 'recommendation_type') {
    if (data.recommendation_type === FORMAL_RECOMMENDATION) {
      if (!data.strength) {
        refStrength.value?.validate();
      }

      if (!data.direction) {
        refDirection.value?.validate();
      }
    } else if (!data.direction) {
      refDirection.value?.validate();
    }
  }

  editor.metadata.setMetadata(props.index, propName, {
    ...data,
    intervention_type: getInterventionTypeKey(data.intervention_type),
    certainty_of_the_evidence: getCertaintyKey(data.certainty_of_the_evidence),
  });
};

const deleteBlock = () => {
  showDeleteBlockDialog.value = false;

  editor.metadata.fixed.removeBlock(props.index);
};

const setInitialValues = () => {
  const metadata = editor.metadata.getFromElement();

  data.index = props.index;

  if (metadata) {
    const { fixed } = metadata;

    const currentIndex = props.index - 1;

    if (fixed[currentIndex]) {
      data.description = fixed[currentIndex].description;
      data.recommendation_type = fixed[currentIndex].recommendation_type;
      data.intervention = fixed[currentIndex].intervention;
      data.comparator = fixed[currentIndex].comparator;
      data.implementation_considerations = fixed[currentIndex].implementation_considerations;
      data.additional_comments = fixed[currentIndex].additional_comments;
      data.recommendation_source = fixed[currentIndex].recommendation_source;
      data.strength = fixed[currentIndex].strength;
      data.direction = fixed[currentIndex].direction;

      // from english to spanish
      data.intervention_type = translateInterventionType(fixed[currentIndex].intervention_type);
      data.certainty_of_the_evidence = translateCertainty(
        fixed[currentIndex].certainty_of_the_evidence,
      );
    }
  }

  setTimeout(() => {
    editor.metadata.data.mountingComponent = false;
  }, 500);
};

const validateAllFields = () => {
  // check integrity between intervention and comparator
  validateInterventionAndComparator('intervention');
  validateInterventionAndComparator('comparator');

  // check integrity between direction and strength
  validateDirectionAndStrength();
};

onBeforeMount(() => {
  // editor.metadata.pendency.clear();
  // editor.metadata.pendency.clearRecommendationTypes();

  setInitialValues();
});

onMounted(() => {
  validateAllFields();
});

onBeforeUnmount(() => {
  editor.metadata.clearMetadata();
});
</script>
