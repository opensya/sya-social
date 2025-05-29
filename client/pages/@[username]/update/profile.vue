<script lang="ts" setup>
import { createVNode } from "vue";
import { VForm } from "vuetify/components/VForm";
import type { IUser } from "~/interfaces/User";

const data = ref({ ...Store.session.user });
const form = ref<VForm>();
const loading = ref(false);

function load() {
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "image/png, image/jpeg");

  function readFile() {
    const _files = input.files;
    if (!_files?.length) return;

    for (const file of _files) {
      const fileReader = new FileReader();

      fileReader.onload = () => {
        const f = {
          name: file.name,
          type: file.type,
          size: file.size,
          content: fileReader.result as string,
        };

        data.value.photo = f;
      };

      fileReader.readAsDataURL(file);
    }
  }

  input.addEventListener("change", readFile);
  input.click();
}

async function submit() {
  if (Lodash.isEqual(data.value, Store.session.user)) return;
  if (loading.value) return;
  if (!form.value) return;
  if (!form.value.isValid) return;

  try {
    loading.value = true;
    const user = await Api.request<IUser>({
      url: "user/update/profile",
      method: "post",
      body: { ...data.value },
    });

    Store.session.setUser(user);

    Notify.push({
      text: createVNode(
        "div",
        { class: "d-flex flex-colum align-center ga-2" },
        [
          createVNode("i", {
            class: "fi fi-sr-check-circle text-success",
            style: { fontSize: "22px" },
          }),
          Use.i18n.t("success.profile_update"),
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
      class="d-flex flex-column ga-2 mx-auto mt-16"
      style="max-width: 552px"
      @submit.prevent="submit"
    >
      <div style="position: relative; width: max-content">
        <div
          class="cursor-pointer bg-surface"
          style="
            object-fit: cover;
            object-position: center;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 96px;
            height: 96px;
            border-radius: 100%;
          "
          @click="load"
        >
          <img
            v-if="data.photo"
            :src="data.photo.content || data.photo.url"
            style="
              width: 100%;
              height: 100%;
              object-fit: cover;
              object-position: center;
            "
          />
          <ui-svg v-else name="avatar" class="opacity-40" />
        </div>

        <v-btn
          v-if="data.photo"
          size="22"
          color="red"
          variant="flat"
          style="position: absolute; bottom: 0; right: 8px"
          icon
          @click="data.photo = undefined"
        >
          <i class="fi fi-sr-cross-small"></i>
        </v-btn>
      </div>

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
          (v: string) => (v?.length < 2 ? Lodash.capitalize($t('user.name.min')) : true),
          (v: string) => (v?.length > 50 ? Lodash.capitalize($t('user.name.max')) : true),
        ]"
        variant="filled"
        v-model="data.name"
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
