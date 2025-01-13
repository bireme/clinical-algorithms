<template>
  <q-table
    :rows="users.usersList"
    :columns="columns"
    :loading="users.data.loading"
    class="custom-table"
    title="Usuarios"
    row-key="name"
    :rows-per-page-options="[0]"
    flat
    :hide-bottom="!(users.usersList && !users.usersList.length)"
  >
    <template v-slot:loading>
      <q-inner-loading
        showing
        color="primary"
      />
    </template>

    <template v-slot:no-data>
      <b>No se encontraron usuarios.</b>
    </template>

    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td :props="props" key="name">
          <div
            class="cursor-pointer q-py-sm"
          >
            <b>{{ props.row.name }}</b>
          </div>
        </q-td>

        <q-td key="email" :props="props">
          {{ props.row.email }}
        </q-td>

        <q-td key="phone" :props="props">
          {{ props.row.phone }}
        </q-td>

        <q-td key="maintainer" :props="props">
          <check-or-not-icon :check="!!props.row.maintainer" />
        </q-td>

        <q-td key="master" :props="props">
          <check-or-not-icon :check="!!props.row.master" />
        </q-td>

        <q-td key="actions" :props="props">
          <q-btn
            class="q-px-md q-mr-md"
            label="Ver usuario"
            color="primary"
            no-caps
            dense
            push
            @click.stop="editUser(props.row)"
          />
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { inject, onMounted } from 'vue';
import Users, { IUser } from 'src/services/users';
import CheckOrNotIcon from 'components/icons/check-or-not-icon.vue';

const users = inject('users') as Users;

const columns = [
  {
    name: 'name',
    label: 'Nombre',
    align: 'left',
    field: 'name',
  },
  {
    name: 'email',
    align: 'left',
    label: 'E-mail',
    field: 'email',
  },
  {
    name: 'phone',
    align: 'left',
    label: 'Teléfono',
    field: 'phone',
  },
  {
    name: 'maintainer',
    align: 'center',
    label: 'Mantenedor',
    field: 'maintainer',
  },
  {
    name: 'master',
    align: 'center',
    label: 'Master',
    field: 'master',
  },
  {
    name: 'actions',
    align: 'right',
    label: '',
    field: 'actions',
    style: 'width:250px',
  },
];

const editUser = (user: IUser) => users.editUser(user);

onMounted(() => {
  users.get();
});
</script>
