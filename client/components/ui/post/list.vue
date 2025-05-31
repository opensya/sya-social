<script lang="ts" setup>
import type { IResult } from "~/interfaces";
import type { IPost } from "~/interfaces/Post";

const props = defineProps({
  filter: {
    type: Object as PropType<{ [key: string]: any }>,
    default: () => {},
  },
  showResponse: { type: Boolean, default: true },
});

const result = ref<IResult<IPost>>();
const loading = ref(false);

onMounted(listPost);
async function listPost(reload = false) {
  if (loading.value) return;
  if (reload) result.value = undefined;

  if (!result.value) window.scrollTo({ top: 0, behavior: "smooth" });

  const querys = [];
  for (const key in props.filter) {
    if (Object.prototype.hasOwnProperty.call(props.filter, key)) {
      let value = props.filter[key];

      if (Lodash.isPlainObject(value)) value = JSON.stringify(value);
      if (Lodash.isArray(value)) value = JSON.stringify(value);

      querys.push(`${key}=${value}`);
    }
  }

  if (result.value) {
    if (result.value.page >= result.value.totalPages) return;

    querys.push(`page=${result.value.page + 1}`);
    querys.push(`pageSize=${result.value.pageSize}`);
  }

  try {
    loading.value = true;
    const _result = await Api.request<IResult<IPost>>({
      url: `post?${querys.join("&")}`,
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

function remove(post: IPost) {
  if (!result.value) return;

  result.value.data = result.value.data.filter((p) => p.id != post.id);
}
</script>

<template>
  <div v-if="result" class="ui-post-list d-flex flex-column w-100">
    <div v-for="post in result.data" :key="post.id">
      <ui-post-block
        class="border-b"
        :post="post"
        :show-response="showResponse"
        show-ripple
        @removed="remove(post)"
      >
        <div class="d-flex align-center justify-center ga-2">
          <div class="w-100" style="z-index: 1; position: relative">
            <v-btn
              @click="
                Modal.push({
                  write: JSON.stringify({ response: post.id }),
                })
              "
              color="dark"
              variant="text"
              rounded
              block
            >
              <template #prepend>
                <ui-svg name="mic" size="18" class="opacity-50" />
                <i
                  class="fi fi-bs-align-center ml-1 opacity-50"
                  style="font-size: 16px"
                ></i>
              </template>
              {{ Lodash.capitalize($t("words.toanswer")) }}
            </v-btn>
          </div>

          <div class="w-100" style="z-index: 1; position: relative">
            <v-btn
              color="dark"
              variant="text"
              rounded
              block
              :to="$localePath({ name: 'post-id', params: { id: post.id } })"
            >
              <template #prepend>
                <i
                  class="fi fi-sr-message-quote opacity-50"
                  style="font-size: 16px"
                ></i>
              </template>

              {{ post.nResponse }} {{ $t("words.answer", post.nResponse) }}
            </v-btn>
          </div>

          <div
            style="z-index: 1; position: relative"
            class="d-flex align-center justify-center ga-2"
          >
            <ui-post-repost :post="post" />
            <ui-post-share :post="post" />
          </div>
        </div>
      </ui-post-block>

      <!-- <div
        class="mt-2"
        style="
          border-bottom: 1px solid rgba(var(--v-theme-on-background), 0.07);
        "
      ></div> -->
    </div>

    <template v-if="!loading">
      <v-infinite-scroll
        v-if="result.page < result.totalPages"
        @load="listPost()"
      >
        <template #loading>
          <div></div>
        </template>
      </v-infinite-scroll>
    </template>
  </div>

  <div v-if="loading" class="ui-post-list d-flex flex-column ga-5 w-100 py-6">
    <div v-for="i in 4">
      <ui-post-skeleton />

      <div
        class="mt-2"
        style="
          border-bottom: 1px solid rgba(var(--v-theme-on-background), 0.07);
        "
      ></div>
    </div>
  </div>
</template>
