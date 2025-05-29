<script lang="ts" setup>
import { createVNode } from "vue";
import { VForm } from "vuetify/components/VForm";

const data = ref({ password: "", repeat: "" });
const form = ref<VForm>();
const loading = ref(false);

async function submit() {
  if (loading.value) return;
  if (!form.value) return;
  if (!form.value.isValid) return;

  try {
    loading.value = true;
    await Api.request({
      url: "user/update/password",
      method: "post",
      body: { ...data.value },
    });

    data.value = { password: "", repeat: "" };

    Notify.push({
      text: createVNode(
        "div",
        { class: "d-flex flex-colum align-center ga-2" },
        [
          createVNode("i", {
            class: "fi fi-sr-check-circle text-success",
            style: { fontSize: "22px" },
          }),
          Use.i18n.t("success.password_update"),
        ]
      ),
    });
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
  </div>

  <v-container>
    <v-form
      ref="form"
      class="d-flex flex-column ga-1 mx-auto mt-16"
      style="max-width: 552px"
      @submit.prevent="submit"
    >
      <v-text-field
        :label="Lodash.capitalize($t('words.newPassword'))"
        :rules="[
          (v) => (!v ? Lodash.capitalize($t('words.requiredField')) : true),
        ]"
        variant="filled"
        type="password"
        v-model="data.password"
      ></v-text-field>

      <v-text-field
        :label="Lodash.capitalize($t('words.toRepeatPassword'))"
        :rules="[
          (v) => (!v ? Lodash.capitalize($t('words.requiredField')) : true),
          (v: string) => (v !== data.password ? Lodash.capitalize($t('words.passwordsNotMatch')) : true),
        ]"
        variant="filled"
        type="password"
        v-model="data.repeat"
      ></v-text-field>

      <v-btn
        variant="flat"
        color="primary"
        type="submit"
        :loading="loading"
        rounded
      >
        {{ Lodash.capitalize($t("words.tosave")) }}
      </v-btn>
    </v-form>
  </v-container>
</template>
