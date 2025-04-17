<template>
  <div
    class="text-caption text-center"
  >
    <div v-if="props.loaded">
      <q-icon
        name="check"
        size="lg"
        color="positive"
      />
    </div>

    <q-spinner
      v-else
      :color="props.color"
      :size="props.size"
    />

    <div
      v-if="props.label"
      class="q-mt-md"
      :class="props.loaded ? 'text-positive' : props.color ? `text-${props.color}` : ''"
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
  loaded: {
    type: Boolean,
    default: false,
  },
});
</script>
