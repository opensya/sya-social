<script lang="ts" setup>
import { createVNode } from "vue";
import { VForm } from "vuetify/components/VForm";

const form = ref<VForm>();
const data = ref({ username: "" });
const loading = ref(false);

async function submit() {
  if (!form.value) return;
  if (!form.value.isValid) return;

  try {
    loading.value = true;
    await Api.request({
      url: "session/request-password-reset",
      method: "post",
      body: { ...data.value },
    });

    Notify.push({
      text: createVNode(
        "div",
        { class: "d-flex flex-colum align-center ga-2" },
        [
          createVNode("i", {
            class: "fi fi-sr-check-circle text-success",
            style: { fontSize: "22px" },
          }),
          Use.i18n.t("success.request_reset_passeword"),
        ]
      ),
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="pg-login">
    <div>
      <v-form
        ref="form"
        class="d-flex flex-column ga-2"
        @submit.prevent="submit"
      >
        <v-text-field
          :label="Lodash.capitalize($t('words.emailOrUsername'))"
          :rules="[
            (v) => (!v ? Lodash.capitalize($t('words.requiredField')) : true),
          ]"
          variant="filled"
          v-model="data.username"
        ></v-text-field>

        <v-btn variant="flat" color="primary" type="submit">
          {{ Lodash.capitalize($t("words.send")) }}
        </v-btn>
        <div class="mt-5"></div>
        <router-link :to="$localePath({ name: 'session-login' })">
          {{ Lodash.capitalize($t("words.tologin")) }}
        </router-link>

        <router-link :to="$localePath({ name: 'session-register' })">
          {{ Lodash.capitalize($t("words.createAccount")) }}
        </router-link>
      </v-form>
    </div>
  </div>
  <ui-loading-page v-if="loading" />
</template>
