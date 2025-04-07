<template>
  <div class="q-py-lg">
    <div class="q-pb-md">
      <q-btn
        class="float-right"
        label="Añadir enlace"
        color="primary"
        no-caps
        push
        @click="addLink"
      />

      <div class="q-pt-sm">Enlaces</div>
    </div>

    <metadata-link-form
      v-for="index of totalLinks"
      :key="`link-${index}`"
      :block-index="props.blockIndex"
      :link-index="index"
      class="q-my-md"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeMount } from 'vue';
import MetadataLinkForm from 'components/forms/editor/fixed-metadata-link-form.vue';
import Editor from 'src/services/editor';

const editor = inject('editor') as Editor;

const props = defineProps({
  blockIndex: {
    type: Number,
    default: 0,
  },
});

const totalLinks = computed(() => editor.metadata.data.totalLinks[props.blockIndex]);

const addLink = () => {
  editor.metadata.addLink(props.blockIndex);
};

onBeforeMount(() => {
  editor.metadata.fixed.setTotalLinksInBlock(props.blockIndex);
});
</script>
