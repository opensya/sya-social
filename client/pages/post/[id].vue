<script lang="ts" setup>
import type { IPost } from "~/interfaces/Post";

const i18n = useI18n();
const route = useRoute();
const loading = ref(true);

const { data: post } = await useAsyncData(route.path, async () => {
  return await getPost();
});

if (!post.value) {
  showError({ statusCode: 404, message: i18n.t("error.post_not_found") });
}

useSeoMeta({
  title: post.value
    ? Lodash.upperFirst(i18n.t("words.postOf", { name: post.value.user.name }))
    : null,
  description: post.value?.text,
});

// watch(() => route.query, getPost, { deep: true });
async function getPost() {
  const id = route.params.id;
  if (!id) return;

  try {
    loading.value = true;
    return await Api.request<IPost>({
      url: `post/${id}`,
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <ui-loading-page v-if="loading" />

  <template v-else-if="post">
    <ui-block>
      <ui-post-page
        style="min-height: 100dvh"
        :post="post"
        @removed="$router.replace({ name: 'index' })"
      />
      <template #bottom> </template>
    </ui-block>
  </template>
</template>
