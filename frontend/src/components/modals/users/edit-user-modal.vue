<template>
  <edit-modal
    :show="showEditUserDialog"
    title="Usuario"
    :deleting="data.deleting"
    :saving="data.saving"
    :editing="data.editing"
    :hide-delete="!users.data.user.id"
    @delete="showDeleteDialog(true)"
    @edit="setEditing"
    @save="submitUsersForm"
    @close="closeDialog"
  >
    <q-form
      ref="refUsersForm"
      @submit="saveAndClose"
    >
      <div class="row q-col-gutter-lg">
        <div class="col-6">
          <q-input
            v-if="canEdit"
            v-model="users.data.user.name"
            ref="inputUserName"
            label="Nombre"
            class="q-mb-md"
            :rules="[val => !!val || 'Introduzca el nombre del usuario']"
          />
          <div class="q-mb-lg" v-else>
            <div class="text-caption text-grey-7">Nombre:</div>
            <div>{{ users.data.user.name }}</div>
          </div>
        </div>
        <div class="col-6">
          <q-input
            v-if="canEdit"
            v-model="users.data.user.phone"
            label="Teléfono"
            class="q-mb-md"
            :rules="[val => !!val || 'Introduzca el teléfono del usuario']"
          />
          <div class="q-mb-lg" v-else>
            <div class="text-caption text-grey-7">Teléfono:</div>
            <div>{{ users.data.user.phone }}</div>
          </div>
        </div>
      </div>
      <div class="row q-col-gutter-lg">
        <div class="col-6">
          <q-input
            v-if="canEdit"
            v-model="users.data.user.email"
            label="E-mail"
            class="q-mb-md"
            :rules="[
              (val) => !!val || 'Introduzca el e-mail del usuario',
              (val) => validateEmail(val) || 'Este email es invalido',
            ]"
          />
          <div class="q-mb-lg" v-else>
            <div class="text-caption text-grey-7">E-mail:</div>
            <div>{{ users.data.user.email }}</div>
          </div>
        </div>
        <div class="col-6">
          <q-input
            v-if="canEdit"
            v-model="users.data.user.password"
            :type="isPwd ? 'password' : 'text'"
            class="q-mb-md"
            :rules="users.data.user.id ? [] : [
              (val) => !!val || 'Ingrese la contraseña de usuario.'
            ]"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
          <div class="q-mb-lg" v-else>
            <div class="text-caption text-grey-7">Contraseña:</div>
            <div>*********</div>
          </div>
        </div>
      </div>

      <div class="row q-my-lg">
        <div class="col-6">
          <q-checkbox
            v-if="canEdit"
            v-model="users.data.user.maintainer"
            label="¿Eres mantenedor de algoritmos?"
          />
          <div v-else>
            <div>
              ¿Eres mantenedor de algoritmos?
              <check-or-not-icon
                class="q-ml-sm"
                :check="users.data.user.maintainer"
              />
            </div>
          </div>
        </div>

        <div class="col-6">
          <q-checkbox
            v-if="canEdit"
            v-model="users.data.user.master"
            label="¿Eres un usuario master?"
          />
          <div v-else>
            <div>
              ¿Eres un usuario master?
              <check-or-not-icon
                class="q-ml-sm"
                :check="users.data.user.master"
              />
            </div>
          </div>
        </div>
      </div>
    </q-form>

    <delete-modal
      :show="data.confirmDeleting"
      title="¿Está seguro de que desea eliminar el usuario?"
      :item-name="users.data.user.name"
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

import Users from 'src/services/users';
import EditModal from 'components/modals/edit-modal.vue';
import { QForm, QInput, useQuasar } from 'quasar';
import CheckOrNotIcon from 'components/icons/check-or-not-icon.vue';
import { validateEmail } from 'src/services/validation';
import DeleteModal from 'components/modals/simple-modal.vue';

const users = inject('users') as Users;
const $q = useQuasar();

const refUsersForm = ref<QForm>();

const showEditUserDialog = computed(() => users.data.showEditDialog);

const data = reactive({
  showDialog: false,
  deleting: false,
  editing: false,
  saving: false,
  confirmDeleting: false,
});

const isPwd = ref(true);

const inputUserName = ref<QInput>();

watch(() => showEditUserDialog.value, (value) => {
  data.showDialog = value;
});

const canEdit = computed(() => data.editing || !users.data.user.id);

const showDeleteDialog = (value: boolean) => {
  data.confirmDeleting = value;
};

const deleteAndClose = async () => {
  try {
    showDeleteDialog(false);

    data.deleting = true;

    await users.delete();

    await users.get();
  } catch (e) {
    $q.notify({
      message: 'Error while deleting user data',
    });
  } finally {
    data.deleting = false;
  }
};

const closeDialog = () => users.toggleEditDialog();

const setEditing = (value: boolean) => {
  data.editing = value;

  setTimeout(() => {
    inputUserName.value?.focus();
  }, 250);
};

const saveAndClose = async () => {
  try {
    data.saving = true;

    if (users.data.user.id) {
      await users.update();
    } else {
      await users.create();
    }

    await users.get();
  } catch (error) {
    $q.notify({
      message: 'Error while saving user data',
    });
  } finally {
    data.saving = false;
  }
};

const submitUsersForm = async () => {
  refUsersForm.value?.submit();
};
</script>
