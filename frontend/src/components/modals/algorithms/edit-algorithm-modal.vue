<template>
  <edit-modal
    :show="showEditUserDialog"
    title="Datos básicos del algoritmo"
    :deleting="data.deleting"
    :saving="data.saving"
    :editing="data.editing"
    :hide-delete="!props.isMaintainer || !algorithms.data.algorithm.id"
    :hide-confirm="!props.isMaintainer"
    edit-icon="edit"
    delete-icon="delete"
    :hide-labels="true"
    @delete="showDeleteDialog"
    @edit="setEditing"
    @save="submitAlgorithmForm"
    @close="closeDialog"
  >
    <q-form
      ref="refFlowchartForm"
      :class="canEdit ? '' : 'q-col-gutter-lg'"
      @submit="saveAndClose"
    >
      <!-- TITLE -->
      <q-input
        v-if="canEdit"
        v-model="algorithms.data.algorithm.title"
        ref="inputFlowchartTitle"
        label="Título"
        :rules="[val => !!val || 'Introduzca el título del algoritmo']"
        lazy-rules
      />
      <div v-else>
        <div class="text-caption text-grey-7">Título:</div>
        <div>{{ algorithms.data.algorithm.title }}</div>
      </div>

      <!-- DESCRIPTION -->
      <q-input
        v-if="canEdit"
        v-model="algorithms.data.algorithm.description"
        label="Resumen"
        type="textarea"
        :rules="[val => !!val || 'Proporcione un resumen del algoritmo']"
        lazy-rules
        rows="4"
      />
      <div v-else>
        <div class="text-caption text-grey-7">Resumen:</div>
        <div>{{ algorithms.data.algorithm.description }}</div>
      </div>

      <!-- AUTHOR / VERSION  -->
      <div
        v-if="algorithms.data.algorithm.id"
        class="row"
      >
        <div class="col-6">
          <div>
            <div class="text-caption text-grey-7">Última actualización:</div>
            <div>{{ formatDatetime(algorithms.data.algorithm.updated_at) }}</div>
          </div>
        </div>

        <div
          class="col-6 q-pl-xl"
          :class="canEdit ? 'q-mt-sm' : ''"
        >
          <div class="text-caption text-grey-7">Autor:</div>
          <div class="q-pt-xs">
            {{ users.getUserName(algorithms.data.algorithm.user_id) }}
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <!-- CATEGORIES -->
          <q-select
            v-if="canEdit"
            v-model="algorithms.data.algorithm.categories"
            :options="algorithmsCategories.data.categories"
            :option-label="opt => Object(opt) === opt && 'name' in opt ? opt.name : '- Null -'"
            bg-color="white"
            label="Categorías"
            class="q-mb-md"
            multiple
            use-chips
          >
            <template v-slot:selected-item="scope">
              <q-chip
                :label="scope.opt.name"
                removable
                color="primary"
                text-color="white"
                @remove="scope.removeAtIndex(scope.index)"
              />
            </template>
          </q-select>
          <div v-else>
            <div class="text-caption text-grey-7">Categorías:</div>
            <div v-if="algorithms.data.algorithm_categories.length">
              <q-chip
                v-for="category of algorithms.data.algorithm_categories"
                :key="category.name"
                :label="category.name"
              />
            </div>
            <div v-else>
              Sin categorías.
            </div>
          </div>
        </div>
      </div>
    </q-form>

    <delete-modal
      :show="data.confirmDeleting"
      title="¿Está seguro de que desea eliminar el algoritmo?"
      :item-name="algorithms.data.algorithm.title"
      @cancel="showDeleteDialog(false)"
      @confirm="deleteAndClose"
    />
  </edit-modal>
</template>

<script setup lang="ts">
import {
  computed,
  reactive,
  inject,
  watch,
  ref,
} from 'vue';

import {
  QForm,
  QInput,
  useQuasar,
} from 'quasar';

// import { myLocale } from 'src/services/locale';

import Algorithms from 'src/services/algorithms';
import EditModal from 'components/modals/edit-modal.vue';
import DeleteModal from 'components/modals/simple-modal.vue';
import AlgorithmsCategories from 'src/services/algorithms-categories';
import Users from 'src/services/users';
import { formatDatetime } from 'src/services/date';

const props = defineProps({
  isMaintainer: {
    type: Boolean,
    default: false,
  },
});

const users = inject('users') as Users;
const algorithms = inject('algorithms') as Algorithms;
const algorithmsCategories = inject('algorithmsCategories') as AlgorithmsCategories;

const $q = useQuasar();

const refFlowchartForm = ref<QForm>();

const showEditUserDialog = computed(() => algorithms.data.showEditDialog);

const inputFlowchartTitle = ref<QInput>();

const data = reactive({
  showDialog: false,
  confirmDeleting: false,
  deleting: false,
  editing: false,
  saving: false,
});

const canEdit = computed(() => data.editing || !algorithms.data.algorithm.id);

watch(() => showEditUserDialog.value, (value) => {
  data.showDialog = value;
});

const showDeleteDialog = (value: boolean) => {
  data.confirmDeleting = value;
};

const deleteAndClose = async () => {
  try {
    showDeleteDialog(false);

    data.deleting = true;

    await algorithms.delete();

    await algorithms.updateAlgorithmsList();
  } catch (error) {
    $q.notify({
      message: 'Erro ao excluir os dados básicos do fluxograma',
    });
  } finally {
    data.deleting = false;
  }
};

const closeDialog = () => algorithms.toggleEditDialog();

const saveAndClose = async () => {
  try {
    data.saving = true;

    if (algorithms.data.algorithm.id) {
      await algorithms.update();

      await algorithms.updateAlgorithmsList();
    } else {
      await algorithms.save();

      window.location.reload();
    }
  } catch (error) {
    $q.notify({
      message: 'Erro ao salvar dados básicos do fluxograma',
    });
  } finally {
    data.saving = false;
  }
};

const setEditing = (value: boolean) => {
  data.editing = value;

  algorithms.setAlgorithmCategories();

  setTimeout(() => {
    inputFlowchartTitle.value?.focus();
  }, 250);
};

const submitAlgorithmForm = async () => {
  refFlowchartForm.value?.submit();
};
</script>
