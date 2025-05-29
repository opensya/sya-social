<script lang="ts" setup>
import { createVNode } from "vue";
import type { IUser } from "~/interfaces/User";

const i18n = useI18n();

const data = ref({ ...Store.session.user! });
const loading = ref(false);

watch(() => data.value.preferencies, submit, { deep: true });
async function submit() {
  if (loading.value) return;

  try {
    loading.value = true;
    const user = await Api.request<IUser>({
      url: "user/update/profile",
      method: "post",
      body: { ...data.value },
    });

    Store.session.setUser(user);

    setTimeout(() => {
      Notify.push({
        text: createVNode(
          "div",
          { class: "d-flex flex-colum align-center ga-2" },
          [
            createVNode("i", {
              class: "fi fi-sr-check-circle text-success",
              style: { fontSize: "22px" },
            }),
            Use.i18n.t("success.preferencies_update"),
          ]
        ),
      });
    }, 100);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div
    class="ui-block__middle--heeader bg-background d-flex align-center pa-3 px-5 ga-2"
    style="border-bottom: 1px solid rgba(var(--v-theme-on-background), 0.07)"
  >
    <div
      class="d-flex align-center ga-2 cursor-pointer"
      @click="$router.push($localePath({ name: 'index' }))"
    >
      <ui-svg name="logo" class="text-primary" size="24" />
    </div>

    <v-spacer />
    {{ Lodash.capitalize($t("words.preferencies")) }}
  </div>

  <v-container>
    <div class="d-flex flex-column ga-5">
      <div>
        <v-menu offset="5">
          <template v-slot:activator="{ props, isActive }">
            <v-btn
              v-bind="props"
              variant="text"
              size="x-large"
              color="dark"
              class="px-7 border"
              style="justify-content: flex-start; min-width: 200px"
              :loading="loading"
              rounded="xl"
            >
              <template #prepend>
                <ui-svg name="language" size="22" class="text-primary" />
              </template>
              <div class="text-left text-body-2">
                <div>{{ Lodash.capitalize($t("words.language")) }}</div>
                <div class="font-weight-bold">
                  {{ i18n.localeProperties.value.name }}
                </div>
              </div>
            </v-btn>
          </template>

          <v-card color="background" elevation="1">
            <div class="d-flex flex-column align-center justify-center">
              <v-btn
                v-for="lang in i18n.locales.value"
                :key="lang.code"
                :variant="'text'"
                color="dark"
                rounded="0"
                size="x-large"
                style="justify-content: flex-start"
                block
                @click="data.preferencies.lang = lang.code"
              >
                <template #prepend>
                  <div style="width: 20px">
                    <i
                      v-if="$i18n.locale === lang.code"
                      class="fi fi-sr-check-circle ml-auto text-primary"
                    ></i>
                  </div>
                </template>
                {{ lang.name }}
              </v-btn>
            </div>
          </v-card>
        </v-menu>
      </div>

      <div class="d-flex flex-wrap ga-2">
        <v-btn
          :loading="loading"
          :variant="Store.session.mode.value === 'light' ? 'flat' : 'text'"
          :color="Store.session.mode.value === 'light' ? 'primary' : 'dark'"
          rounded="pill"
          class="border"
          @click="data.preferencies.mode = 'light'"
        >
          <template #prepend>
            <i class="fi fi-sr-brightness"></i>
          </template>
          {{ $t("theme.light") }}
        </v-btn>
        <v-btn
          :loading="loading"
          :variant="Store.session.mode.value === 'dark' ? 'flat' : 'text'"
          :color="Store.session.mode.value === 'dark' ? 'primary' : 'dark'"
          rounded="pill"
          class="border"
          @click="data.preferencies.mode = 'dark'"
        >
          <template #prepend>
            <i class="fi fi-ss-moon"></i>
          </template>
          {{ $t("theme.dark") }}
        </v-btn>
        <v-btn
          :loading="loading"
          :variant="!Store.session.mode.value ? 'flat' : 'text'"
          :color="!Store.session.mode.value ? 'primary' : 'dark'"
          rounded="pill"
          class="border"
          @click="data.preferencies.mode = null"
        >
          <template #prepend>
            <i class="fi fi-sr-circle-half-stroke"></i>
          </template>
          {{ $t("theme.default") }}
        </v-btn>
      </div>
    </div>
  </v-container>
</template>
