<template>
  <div :id="props.customSelectId" class="custom-select">
    <select
      v-model="selectedItem"
    >
      <option
        v-for="option of props.customSelectOptions"
        :key="`${props.customSelectId}-${option.id}`"
        :value="option.id"
      >
        {{ option.name }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { onMounted, PropType, ref } from 'vue';
import { CustomSelect } from 'components/selects/categories-select/categories-select';

const props = defineProps({
  customSelectId: {
    type: String,
    required: true,
  },
  customSelectLabel: {
    type: String,
    required: true,
  },
  customSelectOptions: {
    type: Array as PropType<[{
      id: string,
      name: string,
    }]>,
    required: true,
  },
});

const selectedItem = ref(null);

const emit = defineEmits(['update']);

onMounted(() => {
  const customSelect = new CustomSelect(props.customSelectId, props.customSelectLabel);

  customSelect.init();

  customSelect.onSelect(() => emit('update', customSelect.selectedItem));
});
</script>

<style lang="sass">
/* The container must be positioned relative: */
.custom-select
  position: relative

  .clear-button
    position: absolute
    top: 9px
    right: 10px
    width: 22px
    height: 22px
    border-radius: 20px
    border: 1px solid #000
    background-color: white
    z-index: 10
    display: flex
    justify-content: center
    align-items: center

.custom-select select
  display: none /*hide original SELECT element: */

.select-selected
  background-color: white
  border-radius: 4px

.select-selected.select-arrow-active
  -webkit-border-radius: 4px
  -webkit-border-bottom-right-radius: 0
  -webkit-border-bottom-left-radius: 0
  -moz-border-radius: 4px
  -moz-border-radius-bottomright: 0
  -moz-border-radius-bottomleft: 0
  border-radius: 4px
  border-bottom-right-radius: 0
  border-bottom-left-radius: 0

/* Style the arrow inside the select element: */
.select-selected:after
  position: absolute
  content: ""
  top: 17px
  right: 14px
  width: 0
  height: 0
  border: 6px solid transparent
  border-color: black transparent transparent transparent

/* Point the arrow upwards when the select box is open (active): */
.select-selected.select-arrow-active:after
  border-color: transparent transparent black transparent
  top: 11px

/* style the items (options), including the selected item: */
.select-items div,.select-selected
  color: black
  padding: 10px 16px
  cursor: pointer

/* Style items (options): */
.select-items
  position: absolute
  background-color: white
  left: 0
  right: 0
  top: 41px
  z-index: 99
  -webkit-border-radius: 0
  -webkit-border-bottom-right-radius: 4px
  -webkit-border-bottom-left-radius: 4px
  -moz-border-radius: 0
  -moz-border-radius-bottomright: 4px
  -moz-border-radius-bottomleft: 4px
  border-radius: 0
  border-bottom-right-radius: 4px
  border-bottom-left-radius: 4px
  transition: all 1s ease-in-out

/* Hide the items when the select box is closed: */
.select-hide
  display: none

.select-items div:hover, .same-as-selected
  background-color: rgba(0, 0, 0, 0.1)
</style>
