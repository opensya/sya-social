<script lang="ts" setup></script>

<template>
  <div v-if="Store.session.user" class="ui-bottom border-t pa-5 px-10">
    <router-link
      :to="$localePath({ name: 'index' })"
      :class="{ 'opacity-50': $route.name !== 'index' }"
      class="text-dark"
    >
      <ui-svg name="home" size="24" />
    </router-link>

    <template v-if="$vuetify.display.smAndDown">
      <!-- <ui-user-options-modal :user="Store.session.user" /> -->

      <router-link
        :to="
          $localePath({
            name: '@username',
            params: { username: Store.session.user.username },
          })
        "
        style="line-height: 1"
        class="text-dark ml-3"
      >
        <ui-user-avatar :user="Store.session.user" size="36" />
      </router-link>
    </template>

    <v-spacer />

    <v-btn
      icon
      size="small"
      color="primary"
      variant="text"
      @click="
        $router.push({ query: { write: JSON.stringify({ files: true }) } })
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
        $router.push({ query: { write: JSON.stringify({ text: true }) } })
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
        $router.push({ query: { write: JSON.stringify({ record: true }) } })
      "
    >
      <ui-svg name="mic" size="22" />
    </v-btn>
  </div>
</template>

<style lang="scss">
.ui-bottom {
  margin-top: auto;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 70px;
  background-color: rgba(var(--v-theme-background));
  z-index: 150;
  position: sticky;
  display: flex;
  align-items: center;
  gap: 7px;
}
</style>
