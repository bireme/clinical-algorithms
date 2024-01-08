<template>
  <edit-modal
    :show="showEditUserDialog"
    title="Datos básicos del algoritmo"
    :deleting="data.deleting"
    :saving="data.saving"
    :editing="data.editing"
    :hide-delete="!algorithms.data.algorithm.id"
    @delete="showDeleteDialog"
    @edit="setEditing"
    @save="submitFlowchartForm"
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
      <div class="row">
        <div class="col-8 q-pr-lg">
          <q-input
            v-if="canEdit"
            v-model="algorithms.data.algorithm.author"
            label="Autor"
            disable
          />
          <div v-else>
            <div class="text-caption text-grey-7">Autor:</div>
            <div>{{ algorithms.data.algorithm.author || 'No definido' }}</div>
          </div>
        </div>

        <div class="col-4">
          <q-input
            v-if="canEdit"
            v-model="algorithms.data.algorithm.updated_at"
            label="Última actualización"
            maxlength="10"
            clearable
            :rules="[val => !!val || 'Introduce la fecha de actualización']"
            lazy-rules
          >
            <template v-slot:append>
              <q-icon
                name="event"
                class="cursor-pointer"
              >
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    v-model="algorithms.data.algorithm.updated_at"
                    :locale="myLocale"
                    mask="DD/MM/YYYY"
                  >
                    <div class="row items-center justify-end">
                      <q-btn
                        v-close-popup
                        label="Concluir"
                        color="primary"
                        flat
                      />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <div v-else>
            <div class="text-caption text-grey-7">Última actualización:</div>
            <div>{{ algorithms.data.algorithm.updated_at }}</div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-10 q-pr-lg">
          <!-- CATEGORIES -->
          <q-select
            v-if="canEdit"
            v-model="algorithms.data.algorithm.categories"
            :options="categoriesMocked"
            :option-label="opt => Object(opt) === opt && 'name' in opt ? opt.name : '- Null -'"
            bg-color="white"
            label="Categorías"
            class="q-mb-md"
            multiple
            use-chips
            disable
          >
            <template v-slot:selected-item="scope">
              <q-chip
                :label="scope.opt.name"
                removable
                color="primary"
                text-color="white"
                @remove="scope.removeAtIndex(scope.index)"
              >
                {{ scope.opt.name }}
              </q-chip>
            </template>
          </q-select>
          <div v-else>
            <div class="text-caption text-grey-7">Categorías:</div>
            <div v-if="hasCategories">
              <q-chip
                v-for="category of algorithms.data.algorithm.categories"
                :key="category.name"
                :label="category.name"
              />
            </div>
            <div v-else>
              Sin categorías.
            </div>
          </div>
        </div>

        <div class="col-2">
          <q-input
            v-if="canEdit"
            v-model="algorithms.data.algorithm.version"
            label="Versión"
            :rules="[val => !!val || 'Ingrese la versión']"
            lazy-rules
          />
          <div v-else>
            <div class="text-caption text-grey-7">Versión:</div>
            <div>{{ algorithms.data.algorithm.version }}</div>
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

import Algorithms from 'src/services/algorithms';
import EditModal from 'components/modals/edit-modal.vue';
import { QForm, QInput, useQuasar } from 'quasar';
import { myLocale } from 'src/services/locale';
import DeleteModal from 'components/modals/simple-modal.vue';

const algorithms = inject('algorithms') as Algorithms;
const $q = useQuasar();

const refFlowchartForm = ref<QForm>();

const showEditUserDialog = computed(() => algorithms.data.showEditDialog);

const hasCategories = computed(
  () => algorithms.data.algorithm.categories && algorithms.data.algorithm.categories.length,
);

const inputFlowchartTitle = ref<QInput>();

const data = reactive({
  showDialog: false,
  confirmDeleting: false,
  deleting: false,
  editing: false,
  saving: false,
});

const canEdit = computed(() => data.editing || !algorithms.data.algorithm.id);

const categoriesMocked = ref([
  { name: 'Doenças' },
  { name: 'Prevenção' },
  { name: 'Emergências' },
]);

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
    } else {
      await algorithms.save();
    }

    // update algorithms list
    if (algorithms.data.searchKeyword) {
      await algorithms.search(algorithms.data.searchKeyword);
    } else {
      await algorithms.getAll();
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

  setTimeout(() => {
    inputFlowchartTitle.value?.focus();
  }, 250);
};

const submitFlowchartForm = async () => {
  refFlowchartForm.value?.submit();
};
</script>
