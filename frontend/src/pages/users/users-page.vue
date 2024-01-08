<template>
  <q-page>
    <div class="row q-mx-md q-py-sm">
      <div class="col-3">
        <search-input
          label="Buscar usuarios"
          @search="searchUsers"
          @clear="clearSearch"
        />
      </div>

      <div class="col-9 q-pt-lg q-pr-md text-right">
        <q-btn
          label="Registrar usuario"
          color="primary"
          push
          @click="createUser"
        />
      </div>
    </div>

    <div class="row q-mx-md q-mb-sm">
      <div class="col-12">
        <users-table />
      </div>
    </div>

    <edit-user-modal />
  </q-page>
</template>

<script setup lang="ts">
import {
  onBeforeMount,
  provide,
  inject,
} from 'vue';

import Settings from 'src/services/settings';
import SearchInput from 'components/inputs/search-input.vue';
import UsersTable from 'components/tables/users-table.vue';
import Users from 'src/services/users';
import EditUserModal from 'components/modals/users/edit-user-modal.vue';

const users = new Users();
provide('users', users);

const settings = inject('settings') as Settings;

const searchUsers = (keyword: string) => users.search(keyword);

const clearSearch = () => users.clearSearch();

const createUser = () => users.startCreatingUser();

onBeforeMount(() => {
  settings.page.setTitle('Usuarios');
});
</script>
