<template>
  <q-page class="page-container-background text-white">
    <q-img
      :src="LogoHeader"
      class="float-right"
      fit="contain"
      style="height:74px;width:400px;margin:15px"
    />

    <div class="full-width full-height" style="padding:30px">
      <h5 class="text-bold" style="margin-block-start:0;margin-block-end:10px">
        Sistema de algoritmos clínicos
      </h5>

      <div style="width: 600px">
        <p>
          Los algoritmos clínicos son secuencias de pasos o reglas definidas que los profesionales
          de la salud siguen para diagnosticar, tratar o gestionar una condición médica específica.
          Estos algoritmos se basan en evidencia científica, mejores prácticas clínicas y
          experiencia acumulada. Ayudan a los médicos a tomar decisiones informadas y consistentes
          al tratar problemas de salud complejos.
        </p>

        <p>
          Los algoritmos clínicos pueden abarcar una variedad de áreas, desde el diagnóstico de una
          enfermedad hasta la elección del tratamiento más apropiado. Por lo general, se presentan
          en forma de diagrama de flujo o lista de pasos a seguir, con diferentes ramificaciones
          dependiendo de las características del paciente o de los resultados de pruebas.
        </p>

        <p>
          Estos algoritmos son una herramienta valiosa en la práctica médica, especialmente en
          especialidades donde el diagnóstico y el tratamiento involucran una serie de
          consideraciones y opciones. Pueden ayudar a estandarizar la atención al paciente, mejorar
          la eficiencia y reducir errores médicos.
        </p>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { inject, onBeforeMount } from 'vue';
import Settings from 'src/services/settings';
import LogoHeader from 'assets/imgs/logo_paho_header.png';

const settings = inject('settings') as Settings;

onBeforeMount(() => {
  settings.page.setTitle('Inicio');
});
</script>
