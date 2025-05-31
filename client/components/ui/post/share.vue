<script lang="ts" setup>
import type { IPost } from "~/interfaces/Post";

const props = defineProps({
  post: { type: Object as PropType<IPost>, required: true },
});

const emit = defineEmits<(e: "reposted") => void>();

const loading = ref(false);
const shareID = ref(props.post.shareID);

async function submit() {
  if (loading.value) return;

  if (shareID.value) {
    share();
    return;
  }

  try {
    loading.value = true;
    const _post = await Api.request<IPost>({
      url: `post/share/${props.post.id}`,
      method: "post",
      body: { response: props.post.id },
    });

    shareID.value = _post.shareID;
    share();
  } finally {
    loading.value = false;
  }
}

function share() {
  if (!shareID.value) return;

  const url = useLocalePath()({
    name: "share-post-id",
    params: { id: shareID.value },
  });

  Modal.push({
    share: JSON.stringify({
      url: window.location.origin + url,
      title:
        `Sya - ` +
        Lodash.upperFirst(
          Use.i18n.t("words.postOf", { name: props.post.user.name })
        ),
      text: props.post.text,
    }),
  });
}
</script>

<template>
  <v-btn
    v-if="post.user.id === Store.session.user?.id"
    color="dark"
    variant="text"
    size="small"
    :loading="loading"
    icon
    @click="submit"
  >
    <i class="fi fi-sr-paper-plane-top opacity-50" style="font-size: 16px"></i>
  </v-btn>
</template>
