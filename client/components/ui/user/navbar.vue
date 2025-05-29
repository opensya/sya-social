<script lang="ts" setup>
import type { IUser } from "~/interfaces/User";

const props = defineProps({
  user: { type: Object as PropType<IUser>, required: true },
});
</script>

<template>
  <div class="ui-user-navbar bg-background border-t">
    <div class="pl-1"></div>

    <v-bottom-sheet>
      <template #activator="{ props }">
        <div v-bind="props" class="cursor-pointer">
          <ui-user-avatar :user="user" size="36" />
        </div>
      </template>

      <v-card color="background" class="rounded-t-xl">
        <v-container>
          <ui-user-options :user="user" />
        </v-container>
      </v-card>
    </v-bottom-sheet>

    <router-link
      :to="
        $localePath({ name: '@username', params: { username: user.username } })
      "
      style="line-height: 1"
      class="text-dark"
    >
      {{ user.name }}
      <div class="text-primary" style="font-size: 80%">
        @{{ user.username }}
      </div>
    </router-link>

    <v-spacer />

    <v-btn
      v-if="user.id === Store.session.user?.id"
      color="primary"
      variant="flat"
      rounded
      @click="$router.push({ query: { write: 'new' } })"
    >
      <template #prepend>
        <i class="fi fi-br-plus fi-sr-pen-nib"></i>
      </template>
      {{ Lodash.capitalize($t("words.topost")) }}
    </v-btn>
    <ui-user-follow v-else :user="user" />
    <div class="pr-1"></div>
  </div>
</template>

<style lang="scss">
.ui-user-navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 50;
  height: 70px;
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
