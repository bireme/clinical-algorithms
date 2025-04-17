<template>
  <div
    id="editor-stage-wrapper"
    class="overflow-auto"
    :class="fullHeight ? 'editor-stage-wrapper-full-height' : ''"
  >
    <div id="stage-loading-spinner-cover" class="z-max">
      <loading-spinner />
    </div>

    <div id="editor-stage"></div>
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from 'components/spinners/loading-spinner.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { ALGORITHMS_PUBLIC_PRINT } from 'src/router/routes/algorithms';

const route = useRoute();

const fullHeight = computed(() => route.name === ALGORITHMS_PUBLIC_PRINT);
</script>

<style lang="sass">
#editor-stage-wrapper
  position: absolute
  width: 100%
  height: calc(100% - 68px)
  touch-action: pan-x pan-y

#editor-stage-wrapper.editor-stage-wrapper-full-height
    height: 100% !important

#stage-loading-spinner-cover
  z-index: 10000
  position: fixed
  bottom: 0
  width: 100%
  height: calc(100% - 108px)
  background-color: white
  display: flex
  align-items: center
  justify-content: center
</style>
