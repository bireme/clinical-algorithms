<template>
  <div class="editor-layout-footer">
    <div
      class="text-grey-7"
      style="padding: 23px 0 0 15px"
    >
      Version: {{ appVersion }}
    </div>

    <div
      class="powered-by text-grey-7"
      style="top:19px;left:125px"
    >
      Powered<br/>by
    </div>

    <q-img
      :src="LogoBiremeGrey"
      fit="contain"
      class="logo-bireme-footer"
      style="top:21px;left:184px;border-left: 1px solid grey"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import LogoBiremeGrey from 'src/assets/imgs/bireme-logo-grey.png';

const appVersion = computed(() => process.env.APP_VERSION || 0);
</script>
