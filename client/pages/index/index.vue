<script lang="ts" setup>
useSeoMeta({ title: null });

const key = ref(Math.random().toString());
const route = useRoute();

watch(() => route.query.hashtag, onRoute);
function onRoute() {
  key.value = Math.random().toString();
}
</script>

<template>
  <div
    class="ui-block__middle--heeader bg-background d-flex align-center pa-3 px-5 ga-2"
    style="border-bottom: 1px solid rgba(var(--v-theme-on-background), 0.07)"
  >
    <div
      class="d-flex align-center ga-2 cursor-pointer"
      @click="
        $router.replace($localePath({ name: 'index' }));
        key = Math.random().toString();
      "
    >
      <ui-svg name="logo" class="text-primary" size="24" />
    </div>

    <v-spacer />

    <v-btn
      color="primary"
      variant="text"
      rounded="pill"
      height="34"
      :width="$route.query.hashtag ? undefined : 34"
      :icon="!$route.query.hashtag"
      :to="{ path: $localePath({ name: 'index-hashtag' }), replace: true }"
    >
      <div
        v-if="$route.query.hashtag"
        class="font-weight-bold"
        style="color: rgba(var(--v-theme-primary), 1)"
      >
        #{{ $route.query.hashtag }}
      </div>
      <i v-else class="fi fi-sr-hastag" style="font-size: 18px"></i>
    </v-btn>
  </div>

  <ui-post-list :key="key" :filter="{ ...$route.query, follow: true }" />
</template>
