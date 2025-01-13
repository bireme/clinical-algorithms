<template>
  <q-page class="page-container-background q-pb-xl">
    <div
      style="margin-left:10%"
      :style="{
        width: Settings.isPublicView(route.name) ? '80%' : '100%',
        marginLeft: Settings.isPublicView(route.name) ? '10%' : '0',
        padding: Settings.isPublicView(route.name) ? '20px 0 0 0' : '10px 20px',
      }"
    >
      <div
        v-if="Settings.isPublicView(route.name)"
        class="text-white"
      >
        <div style="margin-bottom:3px">
          <b style="font-size: 21px">¿Qué son los algoritmos clínicos?</b>
        </div>

        <div>
          Los algoritmos clínicos son secuencias de pasos o reglas definidas que los profesionales
          de la salud siguen para diagnosticar, tratar o gestionar una condición médica específica.
        </div>
      </div>

      <div class="row">
        <div class="col-12 q-pt-md">
          <search-input
            v-if="data.mountSearchInput"
            :value="data.initialKeyword"
            label="Palabra clave para la búsqueda de algoritmos"
            @clear="clearSearch"
            @search="searchFlowchart"
          />
        </div>
      </div>

      <loading-spinner
        v-if="data.searching"
        color="white"
        class="q-mt-xl"
      />

      <div
        v-else-if="hasResults"
        class="row"
      >
        <div class="col-12">
          <div class="text-body1 text-grey-7 q-mb-md">Resultados de la búsqueda:</div>

          <!-- RESULTS CARDS -->
          <div
            v-for="key of Object.keys(data.results)"
            :key="`result-${key}`"
          >
            <algorithms-search-result
              v-if="data.results"
              :keyword="data.keyword"
              :result="data.results[key]"
            />
          </div>
        </div>
      </div>

      <div
        v-else-if="data.results !== null"
        class="text-grey-7"
      >
        No se encontraron resultados en la búsqueda.
      </div>

      <div
        v-if="!data.keyword && showTable"
      >
        <algorithms-table />
      </div>
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
  ref,
} from 'vue';

import { useRoute, useRouter } from 'vue-router';

import Settings from 'src/services/settings';

import SearchInput from 'components/inputs/search-input.vue';
import LoadingSpinner from 'components/spinners/loading-spinner.vue';
import Algorithms, { IAlgorithmThoroughSearchResult } from 'src/services/algorithms';
import AlgorithmsSearchResult from 'components/items/algorithms-search-result-item.vue';
import AlgorithmsTable from 'components/tables/algorithms-table.vue';
import Users from 'src/services/users';

import { ALGORITHMS_PUBLIC_SEARCH } from 'src/router/routes/algorithms';

const route = useRoute();
const router = useRouter();

const settings = inject('settings') as Settings;

const algorithms = new Algorithms();
provide('algorithms', algorithms);

const users = new Users();
provide('users', users);

const data: {
  searching: boolean,
  results: IAlgorithmThoroughSearchResult[] | null,
  initialKeyword: string,
  keyword: string,
  mountSearchInput: boolean,
} = reactive({
  searching: false,
  results: null,
  initialKeyword: '',
  keyword: '',
  mountSearchInput: false,
});

const hasResults = computed(() => {
  if (data.results === null) return false;

  return Object.keys(data.results).length > 0;
});

const onlyPublic = ref(false);
const showTable = ref(false);

const searchFlowchart = async (keyword: string) => {
  try {
    data.searching = true;
    data.keyword = keyword;

    const results = await algorithms.thorough_search(keyword, onlyPublic.value);

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

  if (Settings.isPublicView(route.name)) {
    router.replace({
      name: ALGORITHMS_PUBLIC_SEARCH,
    });
  }
};

onBeforeMount(async () => {
  await users.get();

  if (route.query.keyword) {
    data.initialKeyword = String(route.query.keyword);
  }

  if (Settings.isPublicView(route.name)) {
    settings.page.setTitle('Búsqueda de algoritmos');
  } else {
    settings.page.setTitle('Búsqueda (visualización para usuarios finales)');
  }

  data.mountSearchInput = true;

  showTable.value = true;
});
</script>

<style lang="sass">
.search-result-item .highlight-text
  color: #FF0000 !important
</style>
