<script lang="ts" setup>
import { mergeProps, createVNode } from "vue";
import type { IPost } from "~/interfaces/Post";

const props = defineProps({
  post: { type: Object as PropType<IPost>, required: true },
});
const emit = defineEmits<(e: "removed") => void>();
const loading = ref(false);

async function submit() {
  try {
    loading.value = true;
    await Api.request<IPost>({
      url: `post/${props.post.id}`,
      method: "delete",
    });

    Notify.push({
      text: createVNode(
        "div",
        { class: "d-flex flex-colum align-center ga-2" },
        [Use.i18n.t("success.post_removed")]
      ),
    });

    emit("removed");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <v-menu location="bottom end" offset="5">
    <template #activator="{ props: mprops }">
      <v-tooltip
        :text="Lodash.capitalize($t('words.toremove'))"
        content-class="rounded-pill"
      >
        <template #activator="{ props }">
          <v-btn
            v-if="post.user.id === Store.session.user?.id"
            v-bind="mergeProps(props, mprops)"
            :loading="loading"
            variant="text"
            size="22"
            color="red"
            icon
          >
            <i class="fi fi-ss-trash-xmark" style="font-size: 16px"></i>
          </v-btn>
        </template>
      </v-tooltip>
    </template>

    <template #default="{ isActive }">
      <v-card
        color="background"
        rounded="lg"
        elevation="1"
        style="border: 1px solid rgba(var(--v-theme-on-background), 0.05)"
      >
        <div class="pa-3">
          <v-btn
            @click="isActive.value = false"
            color="dark"
            variant="tonal"
            class="mb-2"
            rounded
            block
          >
            {{ Lodash.capitalize($t("words.cancel")) }}
          </v-btn>

          <v-btn @click="submit" color="red" variant="flat" rounded block>
            {{ Lodash.capitalize($t("words.toremove")) }}
          </v-btn>
        </div>
      </v-card>
    </template>
  </v-menu>
</template>
