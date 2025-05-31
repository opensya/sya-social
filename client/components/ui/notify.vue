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
  <v-snackbar-queue
    variant="flat"
    color="background"
    timeout="3000"
    timer="surface"
    content-class="border rounded-lg"
    location="bottom end"
    max-width="442"
    width="max-content"
    v-model="notifications"
  >
  </v-snackbar-queue>

  <!-- <v-snackbar-queue
    v-for="(notification, n) in notifications"
    :key="notification.id"
    variant="flat"
    color="background"
    timeout="50000"
    content-class="border rounded-lg"
    location="bottom end"
    max-width="442"
    width="max-content"
    v-bind="notification"
    model-value
  >
  </v-snackbar-queue> -->
</template>
