<script lang="ts" setup>
import type { IResult } from "~/interfaces";
import type { IUser } from "~/interfaces/User";

const props = defineProps({
  q: { type: String, default: "" },
  maxUserShow: { type: Number },
});

const loading = ref(false);
const result = ref<IResult<IUser>>();

onMounted(submit);
async function submit() {
  loading.value = true;

  try {
    result.value = await Api.request<IResult<IUser>>({
      url: `user/tofollow/?q=${props.q}`,
      method: "get",
    });
  } finally {
    loading.value = false;
  }
}

function onFollow(user: IUser) {
  if (!result.value) return;
  result.value.data = result.value.data.filter((u) => u.id !== user.id);

  if (!result.value.data.length) submit();
}
</script>

<template>
  <div class="ui-user-tofllow">
    <div v-if="loading" class="d-flex flex-column ga-5">
      <div v-for="i in 4" :key="i" class="d-flex align-center ga-2">
        <div
          class="skeleton"
          style="width: 54px; height: 54px; border-radius: 100%"
        ></div>

        <div>
          <div class="skeleton" style="width: 150px"></div>
          <div
            class="skeleton"
            style="width: 100px; height: 10px; margin-top: 3px"
          ></div>
        </div>

        <v-spacer />

        <div
          class="skeleton"
          style="width: 70px; height: 30px; margin-top: 3px"
        ></div>
      </div>
    </div>

    <div v-else-if="result" class="d-flex flex-column ga-5">
      <div v-for="user in result.data.slice(0, maxUserShow)" :key="user.id">
        <div class="d-flex align-center ga-2 w-100 position-relative">
          <nuxt-link
            class="d-flex align-center ga-2 text-dark"
            :to="
              $localePath({
                name: '@username',
                params: { username: user.username },
              })
            "
            style="line-height: 1"
          >
            <div>
              <ui-user-avatar :user="user" size="36" />
            </div>

            <div>
              {{ user.name }}
              <div class="text-primary" style="font-size: 80%">
                @{{ user.username }}
              </div>
            </div>
          </nuxt-link>

          <v-spacer />

          <div
            class="pl-5"
            style="
              position: absolute;
              top: 50%;
              right: 0;
              transform: translateY(-50%);

              background: linear-gradient(
                90deg,
                rgba(var(--v-theme-primary), 0) 0%,
                rgba(var(--v-theme-background), 1) 15%
              );
            "
          >
            <ui-user-follow :user="user" @follow="onFollow(user)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.ui-user-tofllow {
  .skeleton {
    border-radius: 16em;
  }
}
</style>
