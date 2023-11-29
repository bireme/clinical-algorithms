<template>
  <q-page class="full-width bg-grey-1">
    <div class="row q-mx-md q-py-sm">
      <div class="col-3">
        <search-input
          label="Palabra clave para la búsqueda de algoritmos"
          @clear="clearSearch"
          @search="searchFlowchart"
        />
      </div>
    </div>

    <loading-spinner
      v-if="data.searching"
    />

    <div
      v-else-if="hasResults"
      class="row q-mx-md"
    >
      <div class="col-12">
        <div class="text-body1 text-grey-7 q-mb-md">Resultados de la búsqueda:</div>

        <q-card
          v-for="key of Object.keys(data.results)"
          :key="`result-${key}`"
          class="shadow-light q-my-lg"
        >
          <q-card-section
            v-if="data.results"
            class="search-result-item"
          >
            <div
              class="text-body1"
              v-html="`<b>Algoritmo:</b> ${getResultText(data.results[key].title)}`"
            />

            <q-list separator>
              <q-item
                v-for="node of data.results[key].nodes"
                :key="`node-${node.id}`"
                clickable
                v-ripple
              >
                <div
                  v-html="`<b>Nodo:</b> ${getResultText(node.label)}`"
                  class="q-mt-sm"
                />
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div
      v-else-if="data.results !== null"
      class="q-px-md text-grey-7"
    >
      No se encontraron resultados en la búsqueda.
    </div>
  </q-page>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeMount,
  reactive,
  provide,
  inject,
} from 'vue';

import SearchInput from 'components/inputs/search-input.vue';
import Settings from 'src/services/settings';
import LoadingSpinner from 'components/spinners/loading-spinner.vue';
import Algorithms, { IAlgorithmThoroughSearchResult } from 'src/services/algorithms';

const settings = inject('settings') as Settings;

const algorithms = new Algorithms();
provide('algorithms', algorithms);

const data: {
  searching: boolean,
  results: IAlgorithmThoroughSearchResult[] | null,
  keyword: string,
} = reactive({
  searching: false,
  results: null,
  keyword: '',
});

const hasResults = computed(() => {
  if (data.results === null) return false;

  return Object.keys(data.results).length > 0;
});

const searchFlowchart = async (keyword: string) => {
  try {
    data.searching = true;
    data.keyword = keyword;

    const results = await algorithms.thorough_search(keyword);

    data.results = { ...results };
  } finally {
    setTimeout(() => {
      data.searching = false;
    }, 1000);
  }
};

const clearSearch = () => {
  data.results = null;
  data.keyword = '';
};

const getResultText = (text: string) => text.replace(data.keyword, `<span class="highlight-text">${data.keyword}</span>`);

onBeforeMount(() => {
  settings.page.setTitle('Publicación de algoritmos (visualización para uso de usuarios finales)');
});
</script>

<style lang="sass">
.search-result-item .highlight-text
  color: #FF0000 !important
</style>