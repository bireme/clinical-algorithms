<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated>
      <div class="row full-width">
        <div class="col-7 flex items-center">
          <q-img
            :src="SitemapIcon"
            fit="contain"
            style="margin:10px;height:52px;width:52px"
          /> <div class="header-text">Algoritmos Clínicos - Búsqueda de algoritmos</div>
        </div>
        <div class="col-5">
          <q-img
            :src="LogoHeader"
            class="float-right"
            fit="contain"
            style="height:74px;width:400px"
          />
        </div>
      </div>
    </q-header>

    <q-page-container>
      <div class="page-container-background">
        <router-view />
      </div>
    </q-page-container>

    <layout-footer />

    <simple-modal
      :show="showLogoutDialog"
      confirm-label="Salir"
      @cancel="toggleLogoutDialog"
      @confirm="logout"
    >
      <div class="q-px-xl q-pt-lg text-center">
        <div class="q-py-lg">
          ¿Seguro que quieres salir?
        </div>
      </div>
    </simple-modal>
  </q-layout>
</template>

<script setup lang="ts">
import {
  onBeforeMount,
  onMounted,
  ref,
} from 'vue';

import { useRoute, useRouter } from 'vue-router';

import { LocalStorage } from 'quasar';

import Settings from 'src/services/settings';
import SimpleModal from 'components/modals/simple-modal.vue';

import { ACCOUNT_LOGIN } from 'src/router/routes/account';

import SitemapIcon from 'src/assets/imgs/icons/sitemap.png';
import LogoHeader from 'src/assets/imgs/logo_paho_header.png';
import LayoutFooter from 'components/footers/layout-footer.vue';

const route = useRoute();
const router = useRouter();

const isMaster = ref(false);

const showLogoutDialog = ref(false);

const logout = () => {
  LocalStorage.remove('token');
  LocalStorage.remove('user');
  LocalStorage.remove('user_name');

  window.location.reload();
};

const toggleLogoutDialog = () => {
  showLogoutDialog.value = !showLogoutDialog.value;
};

onBeforeMount(async () => {
  isMaster.value = await Settings.isMaster();
});

onMounted(async () => {
  const token = LocalStorage.getItem('token');

  if (!token && !Settings.isPublicView(route.name)) {
    void router.push({
      name: ACCOUNT_LOGIN,
    });
  }
});
</script>

<style lang="sass">
.header-text
  display: inline-block
  font-size: 22px
  font-weight: 500
  text-align: center
</style>
