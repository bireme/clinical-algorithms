<template>
  <q-table
    :rows="algorithms.flowchartsList"
    :columns="columns"
    :loading="algorithms.data.loading"
    title="Algoritmos"
    :rows-per-page-options="[0]"
    row-key="name"
    flat
    :hide-bottom="!(algorithms.flowchartsList && !algorithms.flowchartsList.length)"
  >
    <template v-slot:loading>
      <q-inner-loading
        color="primary"
        showing
      />
    </template>

    <template v-slot:no-data>
      <b>No se encontraron algoritmos.</b>
    </template>

    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td :props="props" key="title">
          <div
            class="cursor-pointer q-py-sm"
          >
            <b>{{ props.row.title }}</b>
          </div>
        </q-td>

        <q-td key="version" :props="props">
          {{ props.row.version }}
        </q-td>

        <q-td key="author" :props="props">
          {{ props.row.author || 'No definido' }}
        </q-td>

        <q-td
          key="action"
          :props="props"
        >
          <div
            v-if="publicView"
          >
            <q-btn
              class="q-px-md"
              label="Ver algoritmo"
              color="primary"
              no-caps
              push
              @click.stop="editFlowchart(props.row.id, 'public')"
            />
          </div>

          <div
            v-else
          >
            <q-btn
              class="q-px-md q-mr-md"
              label="Ver datos básicos"
              color="primary"
              no-caps
              push
              @click.stop="viewFlowchartData(props.row)"
            />

            <q-btn
              class="q-px-md"
              label="Editar algoritmo"
              color="primary"
              no-caps
              push
              @click.stop="editFlowchart(props.row.id)"
            />
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import Settings from 'src/services/settings';
import Algorithms, { IAlgorithm } from 'src/services/algorithms';
import { ALGORITHMS_EDITOR, ALGORITHMS_PUBLIC_EDITOR } from 'src/router/routes/algorithms';

const settings = inject('settings') as Settings;

const algorithms = inject('algorithms') as Algorithms;

const router = useRouter();

const publicView = computed(() => settings.isPublicView);

const columns = [
  {
    name: 'title',
    align: 'left',
    label: 'Título',
    field: 'title',
    style: 'width:25%',
  },
  {
    name: 'version',
    align: 'center',
    label: 'Versión',
    field: 'version',
    style: 'width:100px',
  },
  {
    name: 'author',
    align: 'left',
    label: 'Autor',
    field: 'author',
    style: 'width:25%',
  },
  {
    name: 'action',
    align: 'right',
    label: '',
    field: 'action',
  },
];

const editFlowchart = (flowchartId: number, mode: 'edit' | 'public' = 'edit') => {
  if (mode === 'public') {
    return router.push({
      name: ALGORITHMS_PUBLIC_EDITOR,
      query: {
        id: flowchartId,
        mode,
      },
    });
  }

  return router.push({
    name: ALGORITHMS_EDITOR,
    query: {
      id: flowchartId,
      mode,
    },
  });
};

const viewFlowchartData = (flowchart: IAlgorithm) => algorithms.viewFlowchartData(flowchart);

onBeforeMount(() => {
  algorithms.getAll();
});
</script>
