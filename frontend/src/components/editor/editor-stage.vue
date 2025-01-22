<template>
  <div
    id="editor-stage-wrapper"
    class="overflow-auto"
  >
    <div id="stage-loading-spinner-cover" class="z-max">
      <loading-spinner />
    </div>

    <div id="editor-stage"></div>
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from 'components/spinners/loading-spinner.vue';
</script>

<style lang="sass">
#editor-stage-wrapper
  position: absolute
  width: 100%
  height: 100%

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
