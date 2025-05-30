<script lang="ts" setup>
import { createVNode } from "vue";
import type { IPost } from "~/interfaces/Post";

const props = defineProps({
  post: { type: Object as PropType<IPost>, required: true },
});

const emit = defineEmits<(e: "reposted") => void>();

const loading = ref(false);

async function submit() {
  if (loading.value) return;

  try {
    loading.value = true;
    const _post = await Api.request<IPost>({
      url: `post/repost`,
      method: "post",
      body: { response: props.post.id },
    });

    Notify.push({
      text: createVNode(
        "div",
        { class: "d-flex flex-colum align-center ga-2" },
        [Use.i18n.t("success.post_repost")]
      ),
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <v-btn
    color="dark"
    variant="text"
    size="small"
    :loading="loading"
    rounded
    @click="submit"
  >
    {{ post.nRepost }}
    <template #append>
      <i class="fi fi-sr-arrows-retweet opacity-50" style="font-size: 16px"></i>
    </template>
  </v-btn>
</template>
