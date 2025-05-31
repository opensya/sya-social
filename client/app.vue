<script lang="ts" setup>
const initing = ref(true);

onMounted(mounted);
async function mounted() {
  initing.value = true;

  try {
    await Store.session.fetchUser();
  } finally {
    initing.value = false;
  }
}

function test(params: any) {}
</script>

<template>
  <NuxtLayout>
    <v-app :theme="Store.session.mode.use">
      <ui-loading-page v-if="initing" />
      <template v-else>
        <nuxt-page />
        <ui-post-write />
      </template>

      <ui-notify />
      <ui-share />
    </v-app>
  </NuxtLayout>
</template>
