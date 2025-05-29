<script lang="ts" setup>
import type { IResult } from "~/interfaces";
import type { IFollow, IUser } from "~/interfaces/User";

const props = defineProps({
  user: { type: Object as PropType<IUser>, required: true },
});

const route = useRoute();

const q = ref("");
const result = ref<IResult<IFollow>>();
const loading = ref(false);
const controller = ref<AbortController>();
const side = ref<"me" | "follow">("me");
const nFollows = ref({ followings: 0, followers: 0 });

onMounted(getNFollows);
async function getNFollows() {
  try {
    loading.value = true;
    nFollows.value = await Api.request({
      url: `user/@${route.params.username}/follow/n`,
    });
  } finally {
    loading.value = false;
  }
}

watch(() => route.query, onRoute, { deep: true });
onMounted(onRoute);
function onRoute() {
  side.value =
    !route.query.side || route.query.side === "followings" ? "follow" : "me";
  result.value = undefined;
  q.value = "";

  getFollows();
}

async function getFollows() {
  if (controller.value) controller.value.abort();

  const querys = [`q=${q.value}`];

  if (result.value) {
    if (result.value.page >= result.value.totalPages) return;

    querys.push(`page=${result.value.page + 1}`);
    querys.push(`pageSize=${result.value.pageSize}`);
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  controller.value = new AbortController();
  const signal = controller.value.signal;

  try {
    loading.value = true;

    const side =
      !route.query.side || route.query.side === "followings" ? "i" : "he";
    const _result = await Api.request({
      url: `user/@${props.user.username}/follow/list/${side}?${querys.join(
        "&"
      )}`,
      signal,
    });

    if (!result.value) result.value = _result;
    else {
      result.value = {
        ..._result,
        data: [...result.value.data, ..._result.data],
      };
    }
  } finally {
    loading.value = false;
  }
}

watch(() => q.value, onQ);
function onQ() {
  result.value = undefined;
  getFollows();
}
</script>

<template>
  <div
    class="ui-block__middle--heeader bg-background"
    style="border-bottom: 1px solid rgba(var(--v-theme-on-background), 0.07)"
  >
    <div class="d-flex align-center pa-3 px-5 ga-2">
      <div
        class="d-flex align-center ga-2 cursor-pointer"
        @click="$router.push($localePath({ name: 'index' }))"
      >
        <ui-svg name="logo" size="26" class="text-primary" />
      </div>

      <router-link
        :to="$localePath({ name: '@username' })"
        class="d-flex align-center ga-2 text-dark"
        style="line-height: 1"
      >
        <div>
          <ui-user-avatar :user="user" size="28" />
        </div>
        <div>
          {{ user.name }}
          <div class="text-primary" style="font-size: 80%">
            @{{ user.username }}
          </div>
        </div>
      </router-link>
    </div>

    <div
      class="d-flex align-center w-100"
      style="border-top: 1px solid rgba(var(--v-theme-on-background), 0.07)"
    >
      <div class="w-50">
        <v-btn
          :to="{ query: { side: 'followings' } }"
          variant="text"
          color="primary"
          size="small"
          rounded="0"
          :active="!route.query.side || route.query.side === 'followings'"
          block
        >
          {{ Lodash.capitalize($t("words.following", 2)) }}
        </v-btn>
      </div>
      <div class="w-50">
        <v-btn
          :to="{ query: { side: 'followers' } }"
          variant="text"
          color="primary"
          size="small"
          rounded="0"
          :active="route.query.side === 'followers'"
          block
        >
          {{ Lodash.capitalize($t("words.follower", 2)) }}
        </v-btn>
      </div>
    </div>
  </div>

  <v-container>
    <v-text-field
      v-model="q"
      :placeholder="Lodash.capitalize($t('words.tosearch'))"
      class="mb-2"
      variant="filled"
      rounded="pill"
      flat
      hide-details
      autofocus
    >
      <template #prepend-inner>
        <i class="fi fi-rs-search ml-3"></i>
      </template>

      <template #append-inner>
        <div class="mr-5 d-flex align-center" style="width: max-content">
          <template v-if="side === 'me'">
            {{ nFollows.followers }}
            {{ $t("words.follower", nFollows.followers) }}
          </template>
          <template v-else>
            {{ nFollows.followings }}
            {{ $t("words.following", nFollows.followings) }}
          </template>
        </div>
      </template>
    </v-text-field>

    <div class="my-10 mx-5">
      <div v-if="result" class="d-flex flex-column ga-5">
        <div v-for="follow in result.data" :key="follow.id">
          <div class="d-flex align-center ga-2 w-100">
            <nuxt-link
              class="d-flex align-center ga-2 text-dark"
              :to="
                $localePath({
                  name: '@username',
                  params: { username: follow[side].username },
                })
              "
              style="line-height: 1"
            >
              <div>
                <ui-user-avatar :user="follow[side]" size="36" />
              </div>

              <div>
                {{ follow[side].name }}
                <div class="opacity-40" style="font-size: 80%">
                  @{{ follow[side].username }}
                </div>
              </div>
            </nuxt-link>

            <v-spacer />
            <ui-user-follow :user="follow[side]" />
          </div>
        </div>

        <v-infinite-scroll
          v-if="!loading && result.page < result.totalPages"
          @load="getFollows()"
        >
          <template #loading>
            <div></div>
          </template>
        </v-infinite-scroll>
      </div>

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
    </div>
  </v-container>
</template>
