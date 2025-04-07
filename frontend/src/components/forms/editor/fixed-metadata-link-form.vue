<template>
  <q-card>
    <q-card-section class="q-pa-none">
      <div class="q-px-md">
        <div class="q-pt-md q-mb-sm">
          Enlace #{{ props.linkIndex }}
        </div>

        <q-input
          v-model="data.url"
          label="URL"
          spellcheck="false"
          dense
        />

        <div class="q-pb-xs">
          <q-select
            v-model="data.type"
            :options="['Full text', 'BIG database', 'BIGREC database']"
            class="q-mt-lg"
            label="Tipo de enlace"
            dense
          />
        </div>
      </div>

      <q-separator class="q-mt-md" />

      <div class="bg-grey-2">
        <q-btn
          label="Borrar enlace"
          class="full-width"
          color="negative"
          icon="close"
          no-caps
          flat
          @click="showRemoveLinkDialog = true"
        />
      </div>

      <simple-modal
        :show="showRemoveLinkDialog"
        :confirming="deletingLink"
        @cancel="showRemoveLinkDialog = false"
        @confirm="removeLink"
      >
        <q-card-section class="text-center q-py-lg">
          <b class="q-mb-md">
            Quiere eliminar el enlace #{{ props.linkIndex }}?
          </b>

          <div class="text-left">
            <div class="q-px-lg q-mt-lg"><b>URL:</b> {{ data.url }}</div>
            <div class="q-px-lg q-mt-sm"><b>Tipo:</b> {{ data.type }}</div>
          </div>
        </q-card-section>
      </simple-modal>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import {
  onBeforeMount,
  reactive,
  inject,
  watch,
  ref,
} from 'vue';

import Editor from 'src/services/editor';
import SimpleModal from 'components/modals/simple-modal.vue';

const editor = inject('editor') as Editor;

const showRemoveLinkDialog = ref(false);

const props = defineProps({
  blockIndex: {
    type: Number,
    default: 0,
  },
  linkIndex: {
    type: Number,
    default: 0,
  },
});

const deletingLink = ref(false);

const data = reactive({
  blockIndex: props.blockIndex,
  linkIndex: props.linkIndex,
  url: '',
  type: '',
});

watch(data, (value) => {
  editor.metadata.fixed.saveLink({ ...value });
});

const removeLink = () => {
  try {
    deletingLink.value = true;

    editor.metadata.fixed.removeLink(props.blockIndex, props.linkIndex);

    editor.graph.notSaved();
  } finally {
    setTimeout(() => {
      deletingLink.value = false;

      showRemoveLinkDialog.value = false;

      editor.metadata.data.loadingBlocks = true;

      setTimeout(() => {
        editor.metadata.updateTotalBlocks();

        editor.metadata.data.loadingBlocks = false;
      }, 1000);
    }, 1000);
  }
};

const setInitialValues = () => {
  const link = editor.metadata.fixed.getLinks(props.blockIndex, props.linkIndex);

  data.url = link?.url || '';
  data.type = link?.type || '';
};

onBeforeMount(() => {
  setInitialValues();
});
</script>
