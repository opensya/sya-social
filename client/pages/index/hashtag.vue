<script lang="ts" setup>
import type { IResult } from "~/interfaces";
import type { IHastag } from "~/interfaces/Post";

const q = ref("");
const loading = ref(false);
const result = ref<IResult<IHastag>>();
const controller = ref<AbortController>();

onMounted(getHashtags);
async function getHashtags() {
  if (controller.value) controller.value.abort();

  const querys = [`q=${q.value}`];

  if (result.value) {
    if (result.value.page >= result.value.totalPages) return;

    querys.push(`page=${result.value.page + 1}`);
    querys.push(`pageSize=${result.value.pageSize}`);
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  loading.value = true;
  controller.value = new AbortController();
  const signal = controller.value.signal;

  try {
    const _result = await Api.request<IResult<IHastag>>({
      url: `post/hashtag/?${querys.join("&")}`,
      method: "get",
      signal,
    });

    if (!result.value) result.value = _result;
    else {
      result.value = {
        ..._result,
        data: [...result.value.data, ..._result.data],
      };
    }
    console.log(result.value);
  } finally {
    loading.value = false;
  }
}

watch(() => q.value, onQ);
function onQ() {
  result.value = undefined;
  getHashtags();
}
</script>

<template>
  <div
    class="ui-block__middle--heeader bg-background d-flex align-center pa-3 px-5 ga-2"
    style="border-bottom: 1px solid rgba(var(--v-theme-on-background), 0.07)"
  >
    <div
      class="d-flex align-center ga-2 cursor-pointer"
      @click="$router.replace($localePath({ name: 'index' }))"
    >
      <ui-svg name="logo" class="text-primary" size="24" />
    </div>

    {{ Lodash.capitalize($t("words.trends")) }}

    <v-spacer />
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
    </v-text-field>

    <div class="my-10 mx-5">
      <div v-if="result" class="d-flex flex-column ga-5">
        <v-list bg-color="transparent">
          <div v-for="hashtag in result.data" :key="hashtag.id">
            <v-list-item
              :to="
                $localePath({
                  name: 'index',
                  query: { hashtag: hashtag.name },
                })
              "
              bg-color="tranparent"
              style="height: 70px"
              :active="false"
              rounded="lg"
            >
              <template #prepend>
                <div class="mr-3">
                  <i class="fi fi-sr-hastag"></i>
                </div>
              </template>

              <div>
                <div style="font-size: 120%">
                  {{ hashtag.name }}
                </div>
                <div class="opacity-40" style="font-size: 80%">
                  {{ hashtag.n ?? 0 }} {{ $t("words.post", hashtag.n) }}
                </div>
              </div>
            </v-list-item>
          </div>
        </v-list>

        <v-infinite-scroll
          v-if="!loading && result.page < result.totalPages"
          @load="getHashtags()"
        >
          <template #loading>
            <div></div>
          </template>
        </v-infinite-scroll>
      </div>

      <div v-if="loading" class="d-flex flex-column ga-5">
        <div v-for="i in 4" :key="i" class="d-flex align-center ga-2">
          <div class="skeleton" style="width: 24px; height: 24px"></div>

          <div>
            <div class="skeleton" style="width: 150px"></div>
            <div
              class="skeleton"
              style="width: 100px; height: 10px; margin-top: 3px"
            ></div>
          </div>

          <v-spacer />
        </div>
      </div>
    </div>
  </v-container>
</template>
