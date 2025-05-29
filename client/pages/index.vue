<template>
  <v-app v-if="Store.session.user">
    <ui-block>
      <nuxt-page />

      <template #right>
        <div class="pl-10 pr-5">
          <v-text-field
            :placeholder="Lodash.capitalize($t('words.searchUserToFollow'))"
            class="mb-2"
            variant="filled"
            rounded="pill"
            flat
            readonly
            @click="$router.push($localePath({ name: 'tofollow' }))"
          >
            <template #prepend-inner>
              <i class="fi fi-sr-user ml-3 text-primary"></i>
            </template>
          </v-text-field>

          <ui-user-tofollow :max-user-show="4" hide-search />
        </div>
      </template>
    </ui-block>

    <!-- <ui-user-navbar
      v-if="$vuetify.display.smAndDown"
      :user="Store.session.user"
    /> -->
  </v-app>
</template>
