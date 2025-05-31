<script lang="ts" setup>
import type { IPost } from "~/interfaces/Post";

import { Swiper, SwiperSlide } from "swiper/vue";
import { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const props = defineProps({
  post: { type: Object as PropType<IPost>, required: true },
  showResponse: { type: Boolean, default: false },
  showRipple: { type: Boolean, default: false },
});

const _swiper = ref<SwiperClass>();

const emit = defineEmits<(e: "removed") => void>();
</script>

<template>
  <div class="ui-post py-5">
    <div class="d-flex align-center ga-2">
      <div>
        <router-link
          :to="
            $localePath({
              name: '@username',
              params: { username: post.user.username },
            })
          "
        >
          <ui-user-avatar :user="post.user" />
        </router-link>
      </div>
      <div style="line-height: 1">
        <div class="d-flex align-center ga-2">
          <router-link
            class="font-weight-bold text-dark d-flex align-center flex-wrap ga-1"
            :to="
              $localePath({
                name: '@username',
                params: { username: post.user.username },
              })
            "
          >
            {{ post.user.name }}
            <span class="text-primary" style="font-size: 80%">
              @{{ post.user.username }}
            </span>
          </router-link>
        </div>
        <div class="opacity-40 mt-1" style="font-size: 14px">
          {{ $dayjs(post.createdAt).format("DD MMM YYYY HH:mm") }}
        </div>
      </div>

      <v-spacer />

      <ui-user-follow :user="post.user" only-unfollowed />
      <ui-post-remove :post="post" @removed="emit('removed')" />
    </div>

    <ui-post-text v-if="post.text" :post="post" />

    <div>
      <ui-audio-player
        v-if="post.audio"
        :audio="post.audio"
        class="rounded-xl border px-3 py-1"
      ></ui-audio-player>
    </div>

    <div v-if="post.files.length" class="w-100 px-0">
      <swiper
        :slidesPerView="'auto'"
        :grabCursor="true"
        :modules="[]"
        class="w-100"
        style="padding-left: 20px; padding-right: 20px"
        @init="(s) => (_swiper = s)"
      >
        <swiper-slide
          v-for="(file, f) in post.files"
          :key="f"
          :style="{
            width:
              post.files.length >= 3
                ? '45%'
                : post.files.length >= 2
                ? '50%'
                : '100%',
          }"
        >
          <div :class="{ 'pr-2': post.files.length >= 2 }">
            <v-card
              variant="flat"
              @click="
                Modal.push({
                  'post-files': JSON.stringify({ id: post.id, index: f }),
                })
              "
              style="border-radius: 0.9em; position: relative"
            >
              <img
                :src="file.url ?? file.content"
                style="
                  width: 100%;
                  display: block;
                  object-fit: cover;
                  object-position: center;
                "
              />
            </v-card>
          </div>
        </swiper-slide>
      </swiper>
      <!-- <div
        style="
          display: flex;
          border-radius: 0.9em;
          overflow: hidden;
          background-color: green;
        "
      >
        <div v-for="i in 2" style="width: 100%" class="bg-red">
          <v-card variant="flat" @click="">
            <img
              src="/images/avatar.jpg"
              style="
                width: 100%;
                display: block;
                object-fit: cover;
                object-position: center;
              "
            />
          </v-card>
        </div>
      </div> -->
    </div>

    <template v-if="post.response && (showResponse || post.repost)">
      <div>
        <router-link
          :to="
            $localePath({ name: 'post-id', params: { id: post.response.id } })
          "
          class="d-flex align-center ga-2 text-body-2 px-5 mb-2"
        >
          <i
            class="fi"
            :class="[
              post.repost ? 'fi-sr-arrows-retweet' : 'fi-sr-quote-right',
            ]"
            style="font-size: 20px"
          ></i>
          <div>
            <span v-if="!post.repost">
              {{ $t("words.inResponsTo") }}
            </span>
            {{ post.response.user.name }}
          </div>
        </router-link>
        <div class="border pa-0" style="border-radius: 0.9em; z-index: 2">
          <ui-post-block :post="post.response" show-ripple />
        </div>
      </div>
    </template>

    <slot />

    <v-card
      v-if="showRipple"
      variant="flat"
      color="transparent"
      style="position: absolute; inset: 0; border-radius: inherit; z-index: 0"
      :to="$localePath({ name: 'post-id', params: { id: post.id } })"
    ></v-card>
  </div>
</template>

<style lang="scss">
.ui-post {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  border-radius: inherit;

  > * {
    padding-left: 20px;
    padding-right: 20px;

    position: relative;
    z-index: 1;

    &:not(.v-card) {
      pointer-events: none;

      > * {
        pointer-events: auto;
      }
    }
  }
}
</style>
