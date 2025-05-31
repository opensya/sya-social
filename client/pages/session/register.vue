<script lang="ts" setup>
import { VForm } from "vuetify/components/VForm";

const form = ref<VForm>();
const data = ref({
  username: "",
  name: "",
  password: "",
  repeatPassword: "",
  email: "",
});
const loading = ref(false);

const localePath = useLocalePath();
const router = useRouter();

async function submit() {
  if (!form.value) return;
  if (!form.value.isValid) return;

  try {
    loading.value = true;
    const response = await Api.request({
      url: "session/register",
      method: "post",
      body: { ...data.value },
    });

    await Store.session.fetchUser();
    router.push(localePath({ name: "index" }));
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
          :label="Lodash.capitalize($t('words.username'))"
          :rules="[
            (v) => (!v ? Lodash.capitalize($t('words.requiredField')) : true),
          ]"
          variant="filled"
          v-model="data.username"
        ></v-text-field>

        <v-text-field
          :label="Lodash.capitalize($t('words.yourName'))"
          :rules="[
            (v) => (!v ? Lodash.capitalize($t('words.requiredField')) : true),
          ]"
          variant="filled"
          v-model="data.name"
        ></v-text-field>

        <!-- <v-text-field
          :label="Lodash.capitalize($t('words.email'))"
          :rules="[
            (v) => (!v ? Lodash.capitalize($t('words.requiredField')) : true),
          ]"
          variant="filled"
          type="email"
          v-model="data.email"
        ></v-text-field> -->

        <v-text-field
          :label="Lodash.capitalize($t('words.password'))"
          :rules="[
            (v) => (!v ? Lodash.capitalize($t('words.requiredField')) : true),
          ]"
          type="password"
          variant="filled"
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
          v-model="data.repeatPassword"
        ></v-text-field>

        <v-btn variant="flat" color="primary" type="submit">
          {{ Lodash.capitalize($t("words.toregister")) }}
        </v-btn>
        <div class="mt-5"></div>
        <router-link :to="$localePath({ name: 'session-login' })">
          {{ Lodash.capitalize($t("words.tologin")) }}
        </router-link>
      </v-form>
    </div>
  </div>
  <ui-loading-page v-if="loading" />
</template>
