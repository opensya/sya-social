<script lang="ts" setup>
import type { IPost } from "~/interfaces/Post";

const i18n = useI18n();
const route = useRoute();
const loading = ref(true);

const { data: post } = await useAsyncData(route.path, async () => {
  return await getPost();
});

if (!post.value) {
  if (!Store.session.user) {
    Use.router.replace({
      name: "post-id",
      params: { id: route.params.id as string },
    });
  } else {
    showError({ statusCode: 404, message: i18n.t("error.post_not_found") });
  }
}

useSeoMeta({
  title: post.value
    ? Lodash.upperFirst(i18n.t("words.postOf", { name: post.value.user.name }))
    : null,
  description: post.value?.text,
});

async function getPost() {
  const id = route.params.id;
  if (!id) return;
  if (Store.session.user) return;

  try {
    loading.value = true;
    return await Api.request<IPost>({
      url: `post/share/${id}`,
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <ui-loading-page v-if="loading" />

  <template v-else-if="post">
    <ui-block hide-left hide-right>
      <div class="d-flex flex-column my-auto">
        <div
          class="ui-block__middle--heeader bg-background d-flex align-center pa-3 px-5 ga-2"
          style="
            border-bottom: 1px solid rgba(var(--v-theme-on-background), 0.07);
          "
        >
          <router-link :to="{ name: 'index' }" class="d-flex align-center ga-2">
            <ui-svg name="logo" size="26" class="text-primary" />
            Sya
          </router-link>

          <v-spacer />
        </div>

        <div class="mt-5">
          <ui-post-block :post="post"> </ui-post-block>
        </div>

        <div class="px-5 py-3 d-flex align-center ga-2">
          <i class="fi fi-sr-message-quote text-primary"></i>
          {{ post.nResponse }} {{ $t("words.answer", post.nResponse) }}

          <i
            class="fi fi-sr-arrows-retweet text-primary"
            style="font-size: 16px"
          ></i>
          {{ post.nRepost }} {{ $t("words.nRepost", post.nRepost) }}

          <v-spacer />
        </div>
      </div>
    </ui-block>
  </template>
</template>
