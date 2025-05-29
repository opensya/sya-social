<script lang="ts" setup>
import type { IResult } from "~/interfaces";
import type { IUser } from "~/interfaces/User";

const q = ref("");
</script>

<template>
  <v-app v-if="Store.session.user">
    <ui-block>
      <div
        class="ui-block__middle--heeader bg-background d-flex align-center pa-3 px-5 ga-2"
        style="
          border-bottom: 1px solid rgba(var(--v-theme-on-background), 0.07);
        "
      >
        <div
          class="d-flex align-center ga-2 cursor-pointer"
          @click="$router.push($localePath({ name: 'index' }))"
        >
          <ui-svg name="logo" size="24" classs="text-primary " />
        </div>

        <v-spacer />
      </div>

      <v-container>
        <v-text-field
          v-model="q"
          :placeholder="Lodash.capitalize($t('words.searchUserToFollow'))"
          class="mb-2"
          variant="filled"
          rounded="pill"
          flat
          hide-details
          autofocus
        >
          <template #prepend-inner>
            <i class="fi fi-sr-user ml-3 text-primary"></i>
          </template>
        </v-text-field>

        <div class="mt-10 mx-5">
          <ui-user-tofollow :q="q" :key="q" />
        </div>
      </v-container>

      <template #right> </template>
    </ui-block>

    <ui-user-navbar
      v-if="$vuetify.display.smAndDown"
      :user="Store.session.user"
    />
  </v-app>
</template>
