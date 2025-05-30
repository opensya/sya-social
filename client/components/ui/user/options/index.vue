<script lang="ts" setup>
import type { IUser } from "~/interfaces/User";

const props = defineProps({
  user: { type: Object as PropType<IUser>, required: true },
});

const logouting = ref(false);

async function logout() {
  logouting.value = true;

  try {
    await Store.session.logout();
  } finally {
    logouting.value = false;
  }
}
</script>

<template>
  <div class="ui-user-options d-flex flex-column ga-2 align-start">
    <router-link
      :to="
        $localePath({
          name: '@username',
          params: { username: user.username },
        })
      "
      class="d-flex align-center ga-2 text-dark"
    >
      <ui-user-avatar :user="user" size="54" />

      <div style="line-height: 1">
        {{ user.name }}
        <div class="text-body-2 text-primary">@{{ user.username }}</div>
      </div>
    </router-link>

    <div class="mb-5"></div>

    <ui-user-follow :user="user" />

    <v-btn
      v-if="user.id === Store.session.user?.id"
      color="dark"
      variant="tonal"
      rounded
      :to="
        $localePath({
          name: '@username-update-profile',
          params: { username: user.username },
        })
      "
    >
      <template #prepend>
        <i class="fi fi-sr-user-pen"></i>
      </template>
      {{ Lodash.capitalize($t("words.updateYourProfile")) }}
    </v-btn>

    <v-btn
      v-if="user.id === Store.session.user?.id"
      color="dark"
      variant="tonal"
      rounded
      :to="
        $localePath({
          name: '@username-update-password',
          params: { username: user.username },
        })
      "
    >
      <template #prepend>
        <i class="fi fi-sr-lock"></i>
      </template>
      {{ Lodash.capitalize($t("words.updateYourPassword")) }}
    </v-btn>

    <v-btn
      color="dark"
      variant="tonal"
      rounded
      :to="
        $localePath({
          name: '@username-follow',
          params: { username: user.username },
        })
      "
    >
      <template #prepend>
        <i class="fi fi-sr-users"></i>
      </template>
      {{ Lodash.capitalize($t("words.following", 2)) }}
    </v-btn>

    <!-- <v-btn
      v-if="user.id === Store.session.user?.id"
      color="dark"
      variant="tonal"
      rounded
      @click="logout"
    >
      <template #prepend>
        <i class="fi fi-rr-arrow-left-from-arc text-red"></i>
      </template>
      <span class="text-red">
        {{ Lodash.capitalize($t("words.tologout")) }}
      </span>
    </v-btn> -->

    <template v-if="user.id === Store.session.user?.id">
      <div class="mt-16"></div>

      <div class="mt-auto d-flex flex-column">
        <router-link class="text-red" :to="$localePath({ name: 'logout' })">
          {{ Lodash.capitalize($t("words.tologout")) }}
        </router-link>

        <router-link
          :to="
            $localePath({
              name: '@username-update-preferencies',
              params: { username: user.username },
            })
          "
        >
          {{ Lodash.capitalize($t("words.preferencies")) }}
        </router-link>

        <a> Mentions légales </a>
        <a> Politique de confidentialité </a>
        <a> Conditions d'utilisations </a>
      </div>
    </template>
  </div>

  <!-- <ui-loading-page v-if="logouting" /> -->
</template>

<style lang="scss">
.ui-block__left {
  .ui-user-options {
    padding-top: 40px;
    padding-bottom: 40px;
    min-height: 100dvh;
  }
}
</style>
