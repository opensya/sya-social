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
    <div class="d-flex align-center w-100">
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

      <v-spacer />

      <ui-user-follow :user="user" />
    </div>

    <div class="mb-5"></div>

    <v-btn
      v-if="user.id === Store.session.user?.id"
      color="dark"
      variant="text"
      size="large"
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
      variant="text"
      size="large"
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
      variant="text"
      size="large"
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
    <template v-if="user.id === Store.session.user?.id">
      <div class="mt-16"></div>

      <div class="mt-auto d-flex flex-column">
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

        <router-link class="text-red" :to="$localePath({ name: 'logout' })">
          {{ Lodash.capitalize($t("words.tologout")) }}
        </router-link>
      </div>
    </template>
  </div>
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
