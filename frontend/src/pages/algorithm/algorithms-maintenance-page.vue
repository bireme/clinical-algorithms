<template>
  <q-page class="page-container-background q-pb-xl">
    <div class="row q-mx-md q-py-sm">
      <div class="col-9 q-py-md">
        <div
          class="float-left q-mr-lg"
          style="width:370px"
        >
          <search-input
            label="Palabra clave para la búsqueda de algoritmos"
            @search="searchAlgorithm"
            @clear="clearKeyword"
          />
        </div>

        <div
          v-if="algorithmsCategories.data.categories.length"
          class="float-left q-mr-lg" style="width:200px"
        >
          <categories-select
            custom-select-id="categories-select"
            custom-select-label="Categoría"
            :custom-select-options="algorithmsCategories.data.categories"
            @update="setCategory"
          />
        </div>

        <div
          v-if="isMaster && users.data.users.length"
          class="float-left q-mr-lg" style="width:200px"
        >
          <categories-select
            custom-select-id="author-select"
            custom-select-label="Autor"
            :custom-select-options="users.data.users"
            @update="setUser"
          />
        </div>
      </div>

      <div class="col-3 q-pt-lg q-pr-md text-right">
        <q-btn
          v-if="isMaintainer"
          label="Registrar algoritmo"
          color="secondary"
          push
          @click="createAlgorithm"
        />
      </div>
    </div>

    <div
      v-if="showTable"
      class="q-px-md"
    >
      <algorithms-table
        :is-maintainer="isMaintainer"
        :is-master="isMaster"
      />
    </div>

    <edit-algorithm-modal
      :is-maintainer="isMaintainer"
    />
  </q-page>
</template>

<script setup lang="ts">
import {
  onBeforeMount,
  provide,
  inject,
  ref,
} from 'vue';

import { onBeforeRouteLeave } from 'vue-router';

import { LocalStorage } from 'quasar';

import { ALGORITHMS_EDITOR } from 'src/router/routes/algorithms';

import SearchInput from 'components/inputs/search-input.vue';
import AlgorithmsTable from 'components/tables/algorithms-table.vue';
import EditAlgorithmModal from 'components/modals/algorithms/edit-algorithm-modal.vue';
import CategoriesSelect from 'components/selects/categories-select/categories-select.vue';

import Settings from 'src/services/settings';
import Algorithms from 'src/services/algorithms';
import AlgorithmsCategories from 'src/services/algorithms-categories';
import Users from 'src/services/users';

const users = new Users();
provide('users', users);

const algorithms = new Algorithms();
provide('algorithms', algorithms);

const algorithmsCategories = new AlgorithmsCategories();
provide('algorithmsCategories', algorithmsCategories);

const settings = inject('settings') as Settings;

const isMaster = ref(false);
const isMaintainer = ref(false);
const showTable = ref(false);

const searchAlgorithm = (keyword: string) => {
  algorithms.data.searchKeyword = keyword;

  if (isMaintainer.value && !isMaster.value) {
    algorithms.data.searchUser = users.data.users.find((user) => user.id === LocalStorage.getItem('user'));
  }

  algorithms.search();
};

const updateSearch = () => {
  if (
    !algorithms.data.searchKeyword
    && !algorithms.data.searchCategory
    && !algorithms.data.searchUser
  ) {
    algorithms.clearSearch();

    algorithms.getAll();
  } else {
    algorithms.search();
  }
};

const createAlgorithm = () => algorithms.startCreating();

const updateAlgorithmsList = async () => {
  // algorithms.clearSearch();
  algorithms.data.algorithms = [];
  algorithms.data.searchResults = [];

  await algorithms.updateAlgorithmsList();
};

const clearKeyword = () => {
  algorithms.data.searchKeyword = '';

  updateAlgorithmsList();
};

const setCategory = (selectedCategory: { id: number, name: string }) => {
  if (!selectedCategory) {
    algorithms.data.searchCategory = null;

    updateAlgorithmsList();
  } else {
    algorithms.data.searchCategory = { ...selectedCategory };

    updateSearch();
  }
};

const setUser = (selectedUser: { id: number, name: string }) => {
  if (!selectedUser) {
    algorithms.data.searchUser = null;

    updateAlgorithmsList();
  } else {
    algorithms.data.searchUser = { ...selectedUser };

    updateSearch();
  }
};

onBeforeMount(async () => {
  const { maintainer, master } = await Settings.getUserRoles();

  isMaintainer.value = !!maintainer;
  isMaster.value = !!master;

  showTable.value = true;

  settings.page.setTitle('Mantenimiento de algoritmos');

  await users.get();

  await algorithmsCategories.get();
});

onBeforeRouteLeave((leaveGuard) => {
  if (leaveGuard.name === ALGORITHMS_EDITOR) {
    settings.page.mainMenu = false;
  }
});
</script>

<style lang="sass">
.q-field__label
  color: black
</style>
