<script lang="ts" setup>
const logouting = ref(false);

onMounted(logout);
async function logout() {
  logouting.value = true;

  try {
    await Store.session.logout();
  } finally {
    logouting.value = false;
  }
}
</script>

<template>
  <ui-loading-page />
</template>
