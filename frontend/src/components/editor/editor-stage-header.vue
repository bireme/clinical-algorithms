<template>
  <div class="q-pl-lg" style="margin-top:20px">
    <div class="inline-block q-mr-xl">
      <b>Título:</b> {{ algorithm.title }}
    </div>

    <div class="inline-block">
      <b class="q-mr-sm">Categorías:</b>
      <span v-if="!algorithmCategories">No hay categorías definidas.</span>
      <span v-else>
        <q-chip
          v-for="category of algorithmCategories"
          :key="category.id"
          :label="category.name"
          color="grey-3"
          style="padding-left:12px;padding-right:12px;"
          dense
        />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';
import Editor from 'src/services/editor';
import Algorithms from 'src/services/algorithms';

const route = useRoute();

const editor = inject('editor') as Editor;

const algorithms = new Algorithms();

const algorithm = computed(() => editor.graph.data.algorithm);

const algorithmCategories = computed(() => algorithms.data.algorithm_categories);

onBeforeMount(async () => {
  const { id } = route.query;

  if (id) {
    await algorithms.getAlgorithmCategories(Number(id));
  }
});
</script>
