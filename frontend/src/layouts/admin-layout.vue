<template>
  <q-layout view="hHh Lpr fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          v-if="showMenuButton"
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          {{ settings.page.title }}
        </q-toolbar-title>

        <div class="clinical-algorithms-header">
          <q-img
            :src="SitemapIcon"
            fit="contain"
            style="margin:10px;height:40px;width:40px"
          /> Algoritmos Clínicos
        </div>

        <div
          v-if="!isPublicView"
        >
          <div class="inline-block q-mr-md">
            <b>{{ userName }}</b> {{ isMaster ? '(Master)' : '' }}
          </div>

          <div class="inline-block q-mr-xs">
            <q-btn
              class="q-px-md q-py-xs"
              label="Salir"
              outline
              @click="toggleLogoutDialog"
            />
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-if="showMenuButton"
      v-model="settings.page.mainMenu"
      show-if-above
    >
      <main-menu />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <editor-layout-footer
      v-if="onEditor"
    />
    <layout-footer
      v-else-if="!onEditor"
    />

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
  computed,
  onBeforeMount,
  onMounted,
  inject,
  ref,
} from 'vue';

import { useRoute, useRouter } from 'vue-router';

import { LocalStorage } from 'quasar';

import Settings from 'src/services/settings';
import MainMenu from 'components/menus/main-menu.vue';
import SimpleModal from 'components/modals/simple-modal.vue';
import LayoutFooter from 'components/footers/layout-footer.vue';
import EditorLayoutFooter from 'components/footers/editor-layout-footer.vue';

import {
  ALGORITHMS_EDITOR,
  ALGORITHMS_PUBLIC_EDITOR,
  ALGORITHMS_PUBLIC_SEARCH,
} from 'src/router/routes/algorithms';

import { ACCOUNT_LOGIN } from 'src/router/routes/account';

import SitemapIcon from 'assets/imgs/icons/sitemap.png';

const route = useRoute();
const router = useRouter();

const settings = inject('settings') as Settings;

const isMaster = ref(false);

const showLogoutDialog = ref(false);

const userName = computed(() => LocalStorage.getItem('user_name'));

const onEditor = computed(() => [ALGORITHMS_EDITOR, ALGORITHMS_PUBLIC_EDITOR].includes(route.name));

const toggleLeftDrawer = () => {
  settings.page.mainMenu = !settings.page.mainMenu;
};

const isPublicView = computed(() => Settings.isPublicView(route.name));

const showMenuButton = computed(
  () => ![
    ALGORITHMS_EDITOR,
    ALGORITHMS_PUBLIC_SEARCH,
    ALGORITHMS_PUBLIC_EDITOR,
  ].includes(String(route.name)),
);

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
.clinical-algorithms-header
  position: absolute
  display: flex
  align-items: center
  justify-content: center
  left: 50%
  margin-left: -150px
  width: 300px
  height: 100%
  font-size: 22px
  font-weight: 500
</style>
