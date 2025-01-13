<template>
  <q-page class="page-container-background q-pb-xl">
    <div class="row q-pa-lg">
      <div class="col-12 text-right">
        <q-btn
          label="Registrar categoría"
          color="secondary"
          push
          @click="startCreatingCategory"
        />
      </div>
    </div>

    <div class="q-pa-lg">
      <algorithms-categories-table />
    </div>

    <edit-algorithm-category-modal />
  </q-page>
</template>

<script setup lang="ts">
import AlgorithmsCategoriesTable from 'components/tables/algorithms-categories-table.vue';
import EditAlgorithmCategoryModal from 'components/modals/algorithms/edit-algorithm-category-modal.vue';
import AlgorithmsCategories from 'src/services/algorithms-categories';
import { inject, onBeforeMount, provide } from 'vue';
import Settings from 'src/services/settings';
import { HOME } from 'src/router/routes/home';
import { useRouter } from 'vue-router';

const settings = inject('settings') as Settings;

const router = useRouter();

const algorithmsCategories = new AlgorithmsCategories();

provide('algorithmsCategories', algorithmsCategories);

const startCreatingCategory = () => {
  algorithmsCategories.toggleEditDialog(true);
};

onBeforeMount(async () => {
  if (!await Settings.isMaster()) {
    await router.push({
      name: HOME,
    });
  }

  settings.page.setTitle('Mantenimiento de categorías');
});
</script>
