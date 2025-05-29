<script lang="ts" setup>
onMounted(() => {
  if (Store.session.user) {
    useRouter().replace({ name: "index" });
  }
});
</script>

<template>
  <v-container class="my-0 py-0">
    <v-row>
      <v-col cols="12" md="6" lg="4">
        <div
          class="pg-session--left d-flex flex-column mx-auto"
          style="width: 100%; max-width: 442px"
          :style="{ height: $vuetify.display.mdAndUp ? '100dvh' : 'unset' }"
        >
          <div class="my-auto py-16 d-flex flex-column ga-4">
            <ui-svg name="logo" size="64" classs="text-primary " />
            <!-- <i class="fi fi-brands-twitter text-primary text-h2"></i> -->

            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Consectetur commodi molestias sit, molestiae nulla, quia illo ex
              dolorum similique praesentium voluptate tenetur! Quasi esse
              consectetur dicta a voluptates nesciunt laborum?
            </p>
          </div>

          <div class="mb-5">
            <ui-svg name="flag/sn" size="24" />
          </div>
        </div>
      </v-col>
      <v-col cols="12" md="6" lg="8">
        <nuxt-page />
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss">
.pg-login {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  > div {
    width: 100%;
    max-width: 442px;
  }
}
</style>
