<script lang="ts" setup>
const props = defineProps({ query: { type: String, required: true } });

const isOpen = ref(false);
const router = useRouter();

watch(() => router.currentRoute.value, onRoute, { deep: true });
onMounted(onRoute);
function onRoute() {
  if (Object.keys(router.currentRoute.value.query).includes(props.query)) {
    isOpen.value = true;
  } else {
    isOpen.value = false;
  }
}

function close() {
  if (Object.keys(router.currentRoute.value.query).includes(props.query)) {
    router.back();
  }
}
</script>

<template>
  <v-dialog v-if="isOpen" class="ui-modal" model-value persistent>
    <slot :close="close" :key="$route.query[query]" />
  </v-dialog>
</template>
