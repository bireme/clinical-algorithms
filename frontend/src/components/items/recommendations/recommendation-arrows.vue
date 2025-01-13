<template>
  <div
    v-if="fixedMetadata && fixedMetadata.intervention && fixedMetadata.comparator"
    v-html="recommendationArrowsLine(fixedMetadata, false, true)"
  />
</template>

<script setup lang="ts">
import { PropType } from 'vue';

import { IFixedMetadata } from 'src/services/editor/constants/metadata';

import { recommendationArrowsLine } from 'src/services/recommendations';

const { fixedMetadata } = defineProps({
  fixedMetadata: {
    type: Object as PropType<IFixedMetadata>,
    required: true,
  },
});
</script>
