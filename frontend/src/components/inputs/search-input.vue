<template>
  <div>
    <q-input
      v-model="text"
      :placeholder="props.label"
      class="custom-search-input"
      debounce="750"
      outlined
      dense
      dark
      bottom-slots
      @update:model-value="emitSearch"
    >
      <template v-slot:append>
        <q-icon
          v-if="text !== ''"
          name="close"
          class="cursor-pointer"
          @click="emitClear"
        />
      </template>
    </q-input>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = defineProps({
  value: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['search', 'clear']);

const text = ref('');

function emitSearch() {
  emit('search', text.value);
}

function emitClear() {
  text.value = '';

  emit('clear', '');
}

onMounted(() => {
  if (props.value) {
    text.value = props.value;

    emitSearch();
  }
});
</script>

<style lang="sass">
.custom-search-input .q-field__control
  background-color: white

.custom-search-input .q-field__control .q-icon
  color: grey

.custom-search-input .q-field__native
  color: black
</style>
