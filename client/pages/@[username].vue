<script lang="ts" setup>
import type { IUser } from "~/interfaces/User";

const loading = ref(false);
const route = useRoute();
const user = ref<IUser>();
const i18n = useI18n();

const { data: post } = await useAsyncData(route.path, async () => {
  return await getUser();
});

if (!user.value) {
  showError({ statusCode: 404, message: i18n.t("error.user_not_found") });
}

useSeoMeta({ title: user.value?.name });

async function getUser() {
  if (loading.value) return;
  user.value = undefined;

  try {
    loading.value = true;
    user.value = await Api.request<IUser>({
      url: `user/@${route.params.username}`,
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <ui-loading-page v-if="loading" />
  <v-app v-else-if="user">
    <ui-block>
      <nuxt-page :user="user" />
    </ui-block>
  </v-app>
</template>
