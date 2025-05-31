<script lang="ts" setup>
import type { IPost } from "~/interfaces/Post";

const props = defineProps({
  post: { type: Object as PropType<IPost>, required: true },
});
</script>

<template>
  <div style="min-height: 100%" class="d-flex flex-column">
    <div class="d-flex flex-column">
      <div
        class="ui-block__middle--heeader bg-background d-flex align-center pa-3 px-5 ga-2"
        style="
          border-bottom: 1px solid rgba(var(--v-theme-on-background), 0.07);
        "
      >
        <router-link :to="{ name: 'index' }" class="d-flex">
          <ui-svg name="logo" size="26" class="text-primary" />
        </router-link>

        <div style="line-height: 1">
          <!-- <div>
              <ui-user-avatar :user="post.user" size="28" />
            </div> -->
          <div>
            {{ post.user.name }}
            <div class="text-primary" style="font-size: 80%">
              @{{ post.user.username }}
            </div>
          </div>
        </div>

        <v-spacer />

        <ui-user-follow :user="post.user" />

        <ui-user-options-modal
          v-if="$vuetify.display.smAndDown"
          :user="post.user"
        />
      </div>

      <div class="mt-5">
        <ui-post-block :post="post"> </ui-post-block>
      </div>

      <div class="px-5 py-3 d-flex align-center ga-2">
        <i class="fi fi-sr-message-quote text-primary"></i>
        {{ post.nResponse }} {{ $t("words.answer", post.nResponse) }}

        <i
          class="fi fi-sr-arrows-retweet text-primary"
          style="font-size: 16px"
        ></i>
        {{ post.nRepost }} {{ $t("words.nRepost", post.nRepost) }}

        <v-spacer />

        <ui-post-repost :post="post" />
        <ui-post-share :post="post" />
      </div>

      <div class="border-t">
        <ui-post-list
          v-if="post.nResponse"
          :filter="{ responseTo: post.id }"
          :show-response="false"
        >
        </ui-post-list>
      </div>
    </div>

    <div
      class="mt-auto bg-background mt-auto"
      style="
        position: sticky;
        bottom: 0;
        height: 70px;
        border-top: 1px solid rgba(var(--v-theme-on-background), 0.1);
        z-index: 20;
      "
    >
      <div
        class="w-100 h-100 d-flex align-center px-5 ga-2 cursor-pointer"
        style="background-color: rgba(var(--v-theme-on-background), 0.05)"
      >
        <i class="fi fi-sr-quote-right opacity-40" style="font-size: 22px"></i>
        <div class="opacity-40">
          {{
            Lodash.upperFirst($t("words.responseTo", { name: post.user.name }))
          }}
        </div>

        <div
          @click="
            $router.push({
              query: { write: JSON.stringify({ response: post.id }) },
            })
          "
          style="
            position: absolute;
            inset: 0;
            background-color: rgba(0, 0, 0, 0.00001);
          "
        ></div>

        <v-spacer />

        <v-btn
          icon
          size="small"
          color="primary"
          variant="text"
          @click="
            $router.push({
              query: {
                write: JSON.stringify({ files: true, response: post.id }),
              },
            })
          "
        >
          <i class="fi fi-br-picture" style="font-size: 18px"></i>
        </v-btn>

        <v-btn
          icon
          size="small"
          color="primary"
          variant="text"
          @click="
            $router.push({
              query: {
                write: JSON.stringify({ text: true, response: post.id }),
              },
            })
          "
        >
          <i class="fi fi-bs-align-center" style="font-size: 18px"></i>
        </v-btn>

        <v-btn
          size="x-small"
          variant="text"
          color="primary"
          icon
          @click="
            $router.push({
              query: {
                write: JSON.stringify({
                  record: true,
                  response: post.id,
                }),
              },
            })
          "
        >
          <ui-svg name="mic" size="22" />
        </v-btn>
      </div>
    </div>
  </div>
</template>

<style lang="scss"></style>
