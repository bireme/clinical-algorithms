<template>
  <q-list separator>
    <q-expansion-item
      v-for="section in sections"
      :key="section.name"
      :label="section.name"
      :default-opened="isOpen(section)"
      :icon="section.icon"
      expand-separator
      group="main-menu"
    >
      <q-item
        v-for="item in section.items"
        :key="item.name"
        :active="isActive(item.name)"
        clickable
        v-ripple
        @click="goPage(item.name)"
      >
        <q-item-section class="q-pl-xl" avatar>
          <q-icon
            color="primary"
            :name="item.icon"
          />
        </q-item-section>

        <q-item-section>{{ item.label }}</q-item-section>
      </q-item>
    </q-expansion-item>
  </q-list>
</template>

<script setup lang="ts">
import { IMainMenuSection, allSections, restrictedSections } from 'src/router/sections';
import Settings from 'src/services/settings';

import { HOME } from 'src/router/routes/home';

import { useRoute, useRouter } from 'vue-router';
import { onBeforeMount, ref } from 'vue';

const route = useRoute();
const router = useRouter();

const goPage = (pageName?: string) => {
  router.push({
    name: pageName || HOME,
  });
};

const isOpen = (data: IMainMenuSection) => !!data.items.find((item) => item.name === route.name);

const isActive = (routeName: string) => routeName === route.name;

const sections = ref<IMainMenuSection[]>([]);

onBeforeMount(async () => {
  const { master, maintainer } = await Settings.getUserRoles();

  if (master) {
    sections.value = [...allSections];
  } else if (maintainer) {
    sections.value = [...restrictedSections];
  } else {
    for (const restrictedSection of restrictedSections) {
      const sectionAux = {
        name: restrictedSection.name,
        items: [],
      };

      for (const sectionItem of restrictedSection.items) {
        if (!sectionItem.maintainer) {
          sectionAux.items.push(sectionItem);
        }
      }

      sections.value.push(sectionAux);
    }
  }
});
</script>
