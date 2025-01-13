<template>
  <q-page class="page-container-background q-pb-xl">
    <div class="row q-mx-md q-py-sm">
      <div class="col-4 q-py-md">
        <search-input
          label="Buscar usuarios"
          @search="searchUsers"
          @clear="clearSearch"
        />
      </div>

      <div class="col-8 q-pt-lg q-pr-md text-right">
        <q-btn
          label="Registrar usuario"
          color="secondary"
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

import { useRouter } from 'vue-router';

import Settings from 'src/services/settings';
import Users from 'src/services/users';
import SearchInput from 'components/inputs/search-input.vue';
import UsersTable from 'components/tables/users-table.vue';
import EditUserModal from 'components/modals/users/edit-user-modal.vue';
import { HOME } from 'src/router/routes/home';

const users = new Users();
provide('users', users);

const settings = inject('settings') as Settings;

const router = useRouter();

const searchUsers = (keyword: string) => users.search(keyword);

const clearSearch = () => users.clearSearch();

const createUser = () => users.startCreatingUser();

onBeforeMount(async () => {
  if (!await Settings.isMaster()) {
    await router.push({
      name: HOME,
    });
  }

  settings.page.setTitle('Usuarios');
});
</script>
