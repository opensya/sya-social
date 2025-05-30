<script lang="ts" setup>
import type { IUser } from "~/interfaces/User";

const props = defineProps({
  user: { type: Object as PropType<IUser>, required: true },
});

const loading = ref(false);
const route = useRoute();
const nFollows = ref({ followings: 0, followers: 0 });
const nPosts = ref({ nPosts: 0 });

onMounted(getUser);
async function getUser() {
  if (loading.value) return;
  loading.value = true;

  try {
    nFollows.value = await Api.request({
      url: `user/@${route.params.username}/follow/n`,
    });
  } finally {
  }

  try {
    nPosts.value = await Api.request({
      url: `user/@${route.params.username}/n-posts`,
    });
  } finally {
  }

  loading.value = false;
}
</script>

<template>
  <v-if v-show="$scroll.y.value > 170">
    <div
      class="ui-block__middle--heeader bg-background d-flex align-center pa-3 px-5 ga-2"
      style="border-bottom: 1px solid rgba(var(--v-theme-on-background), 0.07)"
    >
      <div
        class="d-flex align-center ga-2 cursor-pointer"
        @click="$router.push($localePath({ name: 'index' }))"
      >
        <ui-svg name="logo" size="26" class="text-primary" />
      </div>

      <div class="d-flex align-center ga-2 text-dark" style="line-height: 1">
        <div>
          <ui-user-avatar :user="user" size="28" />
        </div>
        <div>
          {{ user.name }}
          <div class="text-primary" style="font-size: 80%">
            @{{ user.username }}
          </div>
        </div>
      </div>

      <v-spacer />

      <ui-user-follow :user="user" />

      <ui-user-options-modal :user="user" />
    </div>
  </v-if>

  <div
    style="
      background-color: rgba(var(--v-theme-on-background), 0.03);
      height: 210px;
      display: flex;
      flex-direction: column;
    "
    class="px-5 py-5"
  >
    <div class="d-flex align-end ga-2 mt-auto">
      <div class="d-flex align-end ga-2 text-dark" style="line-height: 1">
        <div>
          <ui-user-avatar :user="user" size="64" />
        </div>

        <div class="mb-2">
          {{ user.name }}
          <div class="text-primary" style="font-size: 80%">
            @{{ user.username }}
          </div>
        </div>
      </div>

      <v-spacer />

      <v-btn
        v-if="user.id === Store.session.user?.id"
        color="primary"
        variant="text"
        size="x-small"
        icon
        :to="
          $localePath({
            name: '@username-update-profile',
            params: { username: user.username },
          })
        "
      >
        <i class="fi fi-sr-user-pen" style="font-size: 18px"></i>
      </v-btn>
      <ui-user-follow :user="user" />

      <ui-user-options-modal :user="user" />
    </div>
    <div class="mt-2 px-1 text-body-2">
      <div v-if="loading">
        <div
          class="skeleton rounded-pill"
          style="width: 110px; height: 14px"
        ></div>
        <div
          class="skeleton rounded-pill mt-1"
          style="width: 180px; height: 14px"
        ></div>
      </div>

      <template v-else>
        <div>
          {{ nPosts.nPosts }}
          {{ $t("words.post", nPosts.nPosts) }}
        </div>

        <router-link :to="$localePath({ name: '@username-follow' })">
          {{ nFollows.followers }}
          {{ $t("words.follower", nFollows.followers) }} -
          {{ nFollows.followings }}
          {{ $t("words.following", nFollows.followings) }}
        </router-link>
      </template>
    </div>
  </div>

  <ui-post-list :filter="{ user: user.id }" />
</template>
