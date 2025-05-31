<script lang="ts" setup>
import { createVNode } from "vue";
import type { IPost } from "~/interfaces/Post";
import { VForm } from "vuetify/components/VForm";
import { VBtn } from "vuetify/components/VBtn";
import type { IFile } from "~/interfaces";

import { Swiper, SwiperSlide } from "swiper/vue";
import { Swiper as SwiperClass } from "swiper";
import { Pagination, Keyboard, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const loading = ref(false);

const i18n = useI18n();
const route = useRoute();
const post = ref<IPost>();
const isModalOpen = ref(false);

const _swiper = ref<SwiperClass>();
const startSlide = ref(0);

onMounted(getPost);
watch(() => route.query, getPost, { deep: true });
async function getPost() {
  post.value = undefined;
  isModalOpen.value = false;

  if (!route.query["post-files"]) {
    post.value = undefined;
    return;
  }

  const params = JSON.parse(route.query["post-files"] as string);
  if (!params.id) return;

  startSlide.value = params.index ?? 0;

  try {
    loading.value = true;
    post.value = await Api.request<IPost>({
      url: `post/${params.id}`,
    });
  } finally {
    loading.value = false;
  }

  if (!post.value) {
    showError({ statusCode: 404, message: i18n.t("error.post_not_found") });
    return;
  }

  isModalOpen.value = true;
}

function goBack() {
  const query = { ...route.query };

  if (query["post-files"]) {
    delete query["post-files"];
    Use.router.push({ query, replace: true });
  }
}
</script>

<template>
  <v-dialog
    v-if="Store.session.user && isModalOpen && post"
    :fullscreen="$vuetify.display.mdAndDown"
    :persistent="loading"
    max-width="1200"
    model-value
    @update:model-value="(v) => (!v ? goBack() : null)"
  >
    <!-- <v-card
      variant="flat"
      color="background"
      class="border"
      :rounded="$vuetify.display.xs ? '0' : 'xl'"
      :class="{ 'border-lg': !$vuetify.display.xs }"
    > -->
    <div
      class="ui-post-files d-flex overflow-auto elevation-2 bg-background"
      :class="{ 'rounded-xl border-lg': $vuetify.display.lgAndUp }"
      :style="[$vuetify.display.mdAndDown ? 'height: 100%;' : 'height: 720px;']"
    >
      <swiper
        :grabCursor="true"
        :pagination="true"
        :modules="[Pagination, Keyboard, Navigation]"
        :slides-per-view="1"
        :keyboard="true"
        :navigation="true"
        direction="horizontal"
        class="ui-post-files---swiper"
        @init="
          (s) => {
            _swiper = s;
            s.slideTo(startSlide);
          }
        "
      >
        <swiper-slide
          v-for="(file, f) in post.files"
          :key="f"
          class="bg-black h-100"
        >
          <div
            style="
              height: 100%;
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
            "
          >
            <img
              :src="file.url ?? file.content"
              style="
                max-width: 100%;
                max-height: 100%;
                display: block;
                object-fit: cover;
                object-position: center;
                margin: auto;
              "
            />
          </div>
        </swiper-slide>
      </swiper>

      <div
        v-if="$vuetify.display.mdAndUp"
        style="max-width: 442px; height: 100%; overflow-y: auto"
      >
        <ui-post-page :post="post" />
      </div>
    </div>
    <!-- </v-card> -->
  </v-dialog>
</template>

<style lang="scss">
.ui-post-files {
  max-height: 100%;

  .ui-post-files---swiper {
    width: 100%;
    height: 772px;
    max-height: 100%;

    .swiper-button-next,
    .swiper-button-prev {
      width: 25px;
      height: 25px;

      &::after {
        width: 100%;
        height: 100%;
        font-size: 24px;
        color: rgba(var(--v-theme-primary));
      }
    }

    .swiper-pagination {
      .swiper-pagination-bullet {
        background-color: rgba(var(--v-theme-background));
        border: 1px solid rgba(var(--v-theme-on-background), 0.1);
        opacity: 1;

        &.swiper-pagination-bullet-active {
          background-color: rgba(var(--v-theme-primary));
        }
      }
    }
  }
}
</style>
