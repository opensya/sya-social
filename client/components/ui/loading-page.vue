<script lang="ts" setup></script>

<template>
  <div
    style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100dvw;
      height: 100dvh;
      z-index: 50000000;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 10px;
    "
    class="bg-background"
  >
    <v-progress-circular color="dark" indeterminate />
    <slot name="text"></slot>
  </div>
</template>
