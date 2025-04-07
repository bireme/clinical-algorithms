<template>
  <div
    class="text-caption text-center text-info"
  >
    <q-spinner
      :color="props.color"
      :size="props.size"
    />
    <div
      v-if="props.label"
      :style="{ color: `var(--q-color-${props.color})` }"
      class="q-mt-md"
    >
      {{ props.label }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: 'primary',
  },
  size: {
    type: String,
    default: '3em',
  },
});
</script>
