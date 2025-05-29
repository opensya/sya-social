<script lang="ts" setup>
const notifications = ref<INotification[]>([]);

onMounted(() => {
  addEventListener("notify:push", (e: any) => push(e));
});

function push(e: CustomEvent<INotification>) {
  notifications.value.push(e.detail);
}

onDeactivated(() => {
  removeEventListener("notify:push", (e: any) => push(e));
});
</script>

<template>
  <v-snackbar
    v-for="(notification, n) in notifications"
    :key="notification.id"
    variant="flat"
    color="background"
    timeout="5000"
    content-class="border rounded-lg"
    location="bottom end"
    max-width="442"
    v-bind="notification"
    model-value
  >
  </v-snackbar>
</template>
