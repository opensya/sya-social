<script lang="ts" setup>
import { createVNode } from "vue";
import type { IFollow, IUser } from "~/interfaces/User";

const props = defineProps({
  user: { type: Object as PropType<IUser>, required: true },
  onlyUnfollowed: { type: Boolean, default: false },
});
const emit = defineEmits<(e: "follow" | "unfollow", user: IUser) => void>();

const follow = ref<IFollow>();
const loading = ref(false);

onMounted(async () => {
  if (props.user.id === Store.session.user?.id) return;

  try {
    loading.value = true;
    follow.value = await Api.request<IFollow>({
      url: `user/@${props.user.username}/follow/i`,
    });
  } finally {
    loading.value = false;
  }
});

const submit = {
  async follow() {
    if (loading.value) return;

    try {
      loading.value = true;
      follow.value = await Api.request<IFollow>({
        url: `user/@${props.user.username}/follow`,
        method: "post",
      });

      Notify.push({
        text: createVNode(
          "div",
          { class: "d-flex flex-colum align-center ga-2" },
          [
            createVNode("i", {
              class: "fi fi-sr-user text-success",
              style: { fontSize: "22px" },
            }),
            Use.i18n.t("success.follow", { name: follow.value.follow.name }),
          ]
        ),
      });

      emit("follow", props.user);
    } finally {
      loading.value = false;
    }
  },

  async unfollow() {
    if (loading.value) return;

    try {
      loading.value = true;
      await Api.request<IFollow>({
        url: `user/@${props.user.username}/follow`,
        method: "delete",
      });

      Notify.push({
        text: createVNode(
          "div",
          { class: "d-flex flex-colum align-center ga-2" },
          [
            createVNode("i", {
              class: "fi fi-sr-user-slash",
              style: { fontSize: "22px" },
            }),
            Use.i18n.t("success.unfollow", { name: follow.value?.follow.name }),
          ]
        ),
      });

      follow.value = undefined;

      emit("unfollow", props.user);
    } finally {
      loading.value = false;
    }
  },
};
</script>

<template>
  <template v-if="user.id !== Store.session.user?.id">
    <v-btn
      v-if="!follow"
      color="primary"
      variant="flat"
      rounded
      :loading="loading"
      @click="submit.follow"
    >
      <template #prepend>
        <i class="fi fi-sr-user-add"></i>
      </template>
      {{ Lodash.capitalize($t("words.tofollow")) }}
    </v-btn>
    <template v-else>
      <v-btn
        v-if="!onlyUnfollowed"
        color="dark"
        variant="tonal"
        rounded
        :loading="loading"
        @click="submit.unfollow"
      >
        <template #prepend>
          <i class="fi fi-sr-user"></i>
        </template>
        {{ Lodash.capitalize($t("words.followed")) }}
      </v-btn>
    </template>
  </template>
</template>
