<script lang="ts" setup></script>

<template>
  <div
    v-if="Store.session.user && !$vuetify.display.mdAndUp"
    class="ui-bottom border-t pa-5"
  >
    <router-link
      :to="$localePath({ name: 'index' })"
      :class="{ 'opacity-50': $route.name !== 'index' }"
      class="text-dark"
    >
      <ui-svg name="home" size="24" />
    </router-link>

    <!-- <ui-user-options-modal :user="Store.session.user" /> -->

    <router-link
      :to="
        $localePath({
          name: '@username',
          params: { username: Store.session.user.username },
        })
      "
      style="line-height: 1"
      class="text-dark"
    >
      <ui-user-avatar :user="Store.session.user" size="36" />
    </router-link>

    <div>
      <v-speed-dial location="top center" transition="fade-transition">
        <template v-slot:activator="{ props: activatorProps }">
          <v-fab v-bind="activatorProps" variant="text" color="primary" icon>
            <ui-svg name="mic" size="24" />
          </v-fab>
        </template>

        <v-btn
          key="audio"
          size="large"
          variant="elevated"
          color="primary"
          icon
          @click="
            $router.push({ query: { write: JSON.stringify({ record: true }) } })
          "
        >
          <ui-svg name="mic" size="24" />
        </v-btn>

        <v-btn
          key="text"
          size="small"
          color="surface"
          variant="elevated"
          class="mx-auto"
          icon
          @click="
            $router.push({ query: { write: JSON.stringify({ text: true }) } })
          "
        >
          <i
            class="fi fi-bs-symbol"
            style="font-size: 18px; transform: rotateZ(180deg)"
          ></i>
          <!-- <i class="fi fi-bs-align-center" style="font-size: 18px"></i> -->
        </v-btn>
      </v-speed-dial>
    </div>

    <v-badge color="orange" content="soon">
      <v-btn size="small" variant="text" color="dark" icon>
        <i class="fi fi-br-waveform-path" style="font-size: 22px"></i>
      </v-btn>
    </v-badge>

    <v-btn class="text-none" variant="text" icon>
      <i class="fi fi-br-menu-burger" style="font-size: 22px"></i>
      <!-- <v-badge color="red" content="2">
        <i class="fi fi-ss-bell" style="font-size: 22px"></i>
      </v-badge> -->
    </v-btn>
  </div>

  <div
    v-if="$vuetify.display.mdAndUp"
    style="position: fixed; bottom: 20px; right: 20px"
  >
    <v-speed-dial location="top center" transition="fade-transition">
      <template v-slot:activator="{ props: activatorProps }">
        <v-fab
          v-bind="activatorProps"
          variant="elevated"
          color="primary"
          size="large"
          icon
        >
          <ui-svg name="mic" size="24" />
        </v-fab>
      </template>

      <v-btn
        key="audio"
        variant="tonal"
        color="primary"
        icon
        @click="
          $router.push({ query: { write: JSON.stringify({ record: true }) } })
        "
      >
        <ui-svg name="mic" size="24" />
      </v-btn>

      <v-btn
        key="text"
        color="primary"
        variant="tonal"
        class="mx-auto"
        icon
        @click="
          $router.push({ query: { write: JSON.stringify({ text: true }) } })
        "
      >
        <i
          class="fi fi-bs-symbol"
          style="font-size: 18px; transform: rotateZ(180deg)"
        ></i>
        <!-- <i class="fi fi-bs-align-center" style="font-size: 18px"></i> -->
      </v-btn>
    </v-speed-dial>
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
  justify-content: center;
  gap: 70px;

  @media (max-width: 662px) {
    gap: 30px;
    justify-content: space-between;
  }
}
</style>
