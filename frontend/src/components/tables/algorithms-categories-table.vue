<template>
  <div>
    <q-table
      :rows="categories.data.categories"
      :columns="columns"
      :loading="categories.data.loading"
      class="custom-table"
      title="Categorías"
      :rows-per-page-options="[0]"
      row-key="name"
      flat
      :hide-bottom="categories.data.categories.length !== 0"
    >
      <template v-slot:loading>
        <q-inner-loading
          color="primary"
          showing
        />
      </template>

      <template v-slot:no-data>
        <b>No se encontraron categorías.</b>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td :props="props" key="name">
            <div
              class="q-py-sm"
            >
              {{ props.row.name }}
            </div>
          </q-td>

          <q-td
            key="action"
            :props="props"
          >
            <q-btn
              class="q-px-md"
              label="Editar categoría"
              color="primary"
              no-caps
              push
              @click="editCategory(props.row)"
            />

            <q-btn
              class="q-px-md q-ml-md"
              label="Borrar categoría"
              color="negative"
              no-caps
              push
              @click="startDeletingCategory(props.row)"
            />
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <delete-modal
      :show="data.confirmDeleting"
      title="¿Está seguro de que desea eliminar la categoría?"
      :item-name="categories.data.category.name"
      @cancel="showDeleteDialog(false)"
      @confirm="deleteAndClose"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, inject, reactive } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();

import DeleteModal from 'components/modals/simple-modal.vue';

import AlgorithmsCategories from 'src/services/algorithms-categories';

const categories = inject('algorithmsCategories') as AlgorithmsCategories;

const data = reactive({
  confirmDeleting: false,
  deleting: false,
});

const columns = [
  {
    name: 'name',
    align: 'left',
    label: 'Nombre de la categoría',
    field: 'name',
    style: 'width:50%',
  },
  {
    name: 'action',
    align: 'right',
    label: '',
    field: 'action',
  },
];

const editCategory = (category: { id: number, name: string }) => {
  categories.data.category = { ...category };

  categories.toggleEditDialog();
};

const showDeleteDialog = (value: boolean) => {
  data.confirmDeleting = value;
};

const deleteAndClose = async () => {
  try {
    showDeleteDialog(false);

    data.deleting = true;

    await categories.delete();

    await categories.get();
  } catch (error) {
    $q.notify({
      message: 'Erro ao excluir os dados básicos do fluxograma',
    });
  } finally {
    data.deleting = false;
  }
};

const startDeletingCategory = (category: { id: number, name: string }) => {
  categories.data.category = { ...category };

  showDeleteDialog(true);
};

onMounted(() => {
  categories.get();
});
</script>
