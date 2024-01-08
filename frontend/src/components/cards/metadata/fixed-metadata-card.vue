<template>
  <q-card
    v-if="fixedMetadata"
    class="q-ma-xs q-mb-lg"
  >
    <q-card-section class="q-pa-none">
      <div class="q-pa-md">
        <div>
          <div
            class="text-body1 text-bold"
            style="text-transform: uppercase"
          >
            {{ fixedMetadata.index }}. {{
              fixedMetadata.recommendation_type ?
                RECOMMENDATION_TYPE.find(
                  (type) => type.value === fixedMetadata.recommendation_type,
                ).label : 'Recommendation type was not selected'
            }}
          </div>
        </div>

        <div
          v-if="fixedMetadata.intervention_type || fixedMetadata.certainty_of_the_evidence"
          class="row q-pt-md"
        >
          <div
            v-if="fixedMetadata.intervention_type"
            class="col-6"
          >
            <b>Type</b><br/>{{ fixedMetadata.intervention_type }}
          </div>

          <div
            v-if="isFormal && fixedMetadata.certainty_of_the_evidence"
            class="col-6"
          >
            <b>Certainty of evidence</b><br/>{{ fixedMetadata.certainty_of_the_evidence }}
          </div>
        </div>

        <div
          v-if="fixedMetadata.description"
          class="q-pt-md"
          style="word-break: break-all"
        >
          <div><b>Description</b></div>

          <div>{{ fixedMetadata.description }}</div>
        </div>
      </div>

      <q-separator />

      <div class="q-pa-md">
        <div
          v-if="fixedMetadata.intervention"
          class="q-pb-md"
        >
          <div class="q-pb-sm"><b>Intervention</b></div>

          <div>{{ fixedMetadata.intervention }}</div>
        </div>

        <div
          v-if="fixedMetadata.direction || fixedMetadata.strength"
          class="row flex items-end justify-center"
        >
          <div
            class="col-6"
            v-html="getDirectionIcon(
              fixedMetadata.direction,
              { iconWidth: 44, labelSize: 14, lineHeight: 30 },
            )"
          />
          <div
            class="col-6"
            v-html="getStrengthIcon(
              fixedMetadata.strength,
              { iconWidth: 44, labelSize: 14, lineHeight: 30 },
            )"
          />
        </div>
      </div>

      <q-separator
        v-if="(
          fixedMetadata.comparator
          || fixedMetadata.implementation_considerations
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
            v-if="fixedMetadata.comparator"
            class="q-pb-lg"
          >
            <div class="q-pb-sm"><b>Comparator</b></div>

            <div>{{ fixedMetadata.comparator }}</div>
          </div>

          <div
            v-if="fixedMetadata.implementation_considerations"
            class="q-pb-lg"
          >
            <div class="q-pb-sm"><b>Implementation considerations</b></div>

            <div>{{ fixedMetadata.implementation_considerations }}</div>
          </div>

          <div
            v-if="fixedMetadata.additional_comments"
            class="q-pb-lg"
            style="word-break: break-all"
          >
            <div class="q-pb-sm"><b>Additional comments</b></div>

            <div>{{ fixedMetadata.additional_comments }}</div>
          </div>

          <div
            v-if="fixedMetadata.recommendation_source"
            class="q-pb-lg"
            style="word-break: break-all"
          >
            <div class="q-pb-sm"><b>Recommendation source</b></div>

            <div>{{ fixedMetadata.recommendation_source }}</div>
          </div>
        </div>
      </div>

      <q-separator
        v-if="fixedMetadata.links.length"
      />

      <div
        v-if="fixedMetadata.links.length"
        class="q-pa-lg"
      >
        <div class="q-pb-sm"><b>Links</b></div>

        <q-card
          v-for="link of fixedMetadata.links"
          :key="`link-${fixedMetadata.index}-${link.index}`"
          class="q-mb-md"
        >
          <q-card-section>
            <div class="q-pb-sm"><b>URL:</b> <a
              :href="link.url"
              target="_blank"
              class="text-primary"
              style="word-break: break-all"
            >
              {{ link.url }}
            </a>
            </div>

            <div class="q-py-sm"><b>Link type:</b> {{ link.type }}</div>
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

import { IFixedMetadata } from 'src/services/editor/metadata';

import Editor from 'src/services/editor';
import { RECOMMENDATION_TYPE } from 'src/services/editor/constants';
import { getDirectionIcon, getStrengthIcon } from 'src/services/editor/elements/recommendations';

const editor = inject('editor') as Editor;

const props = defineProps({
  index: {
    type: Number,
    required: true,
  },
});

const fixedMetadata = ref<IFixedMetadata | null>(null);

const isFormal = computed(
  () => fixedMetadata.value
    && fixedMetadata.value.recommendation_type === RECOMMENDATION_TYPE[0].value,
);

const recommendation = computed(() => editor.metadata.data.recommendationToShow);

onBeforeMount(() => {
  // show single recommendation
  if (recommendation.value) {
    fixedMetadata.value = { ...recommendation.value?.data };
  } else {
    // show all recommendations
    const metadata = editor.metadata.getFromElement();

    if (metadata) {
      const { fixed } = metadata;

      fixedMetadata.value = { ...fixed[props.index - 1] };
    }
  }
});

onBeforeUnmount(() => {
  editor.metadata.clearMetadata();
});
</script>
