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
      height: 100px;
      display: flex;
      flex-direction: column;
      position: relative;
    "
    class="px-5 py-5"
  >
    <div
      v-if="user.photo"
      :style="{ backgroundImage: `url(${user.photo.url})` }"
      style="
        position: absolute;
        inset: 0;
        background-position: center;
        background-size: cover;
        z-index: -1;
      "
    >
      <div
        style="
          position: absolute;
          inset: 0;
          backdrop-filter: blur(0.7em);
          background-color: rgba(var(--v-theme-on-background), 0.1);
        "
      ></div>
    </div>
  </div>

  <div class="pb-3 border-b" style="position: relative">
    <div
      style="height: 90px; width: 90px; margin-top: -70px"
      class="mx-8 mb-3 bg-background rounded-circle d-flex align-center justify-center"
    >
      <ui-user-avatar :user="user" size="82" />
    </div>

    <div
      class="d-flex align-center justify-end ga-2"
      style="position: absolute; top: 80px; right: 20px"
    >
      <v-btn
        v-if="user.id === Store.session.user?.id"
        color="dark"
        variant="tonal"
        size="x-small"
        icon
        :to="
          $localePath({
            name: '@username-update-profile',
            params: { username: user.username },
          })
        "
      >
        <i class="fi fi-sr-user-pen" style="font-size: 16px"></i>
      </v-btn>
      <ui-user-follow :user="user" />
      <ui-user-options-modal :user="user">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            color="dark"
            variant="tonal"
            size="x-small"
            icon
          >
            <i class="fi fi-br-menu-dots-vertical" style="font-size: 16px"></i>
          </v-btn>
        </template>
      </ui-user-options-modal>
    </div>

    <div class="mx-8 d-flex flex-column ga-3">
      <div style="line-height: 1">
        <strong style="font-size: 18px">{{ user.name }}</strong>
        <div class="text-primary" style="font-size: 80%">
          @{{ user.username }}
        </div>
      </div>

      <div
        v-if="user.bio"
        style="
          display: -webkit-box;
          -webkit-line-clamp: 2; /* Limite le texte à 5 lignes */
          line-clamp: 2; /* Limite le texte à 5 lignes */
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        "
        v-html="user.bio"
      ></div>

      <div class="text-body-2">
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
  </div>

  <!-- <ui-post-list :filter="{ user: user.id }" /> -->
</template>
