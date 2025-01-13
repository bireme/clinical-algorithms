<template>
  <q-footer>
    <div style="padding:14px">Version: {{ appVersion }}</div>

    <div class="powered-by">Powered<br/>by</div>

    <q-img
      :src="LogoBiremeWhite"
      fit="contain"
      class="logo-bireme-footer"
    />
  </q-footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import LogoBiremeWhite from 'src/assets/imgs/logo-bireme-white.png';

const appVersion = computed(() => process.env.APP_VERSION || 0);
</script>
