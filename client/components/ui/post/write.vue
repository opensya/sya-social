<script lang="ts" setup>
import { createVNode } from "vue";
import type { IPost } from "~/interfaces/Post";
import { VForm } from "vuetify/components/VForm";
import { VBtn } from "vuetify/components/VBtn";
import type { IFile } from "~/interfaces";

import { Swiper, SwiperSlide } from "swiper/vue";
import { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const form = ref<VForm>();
const loading = ref(false);
const data = ref<{ text: ""; files: IFile[]; audio?: IFile }>({
  text: "",
  files: [],
});

const i18n = useI18n();
const route = useRoute();
const post = ref<IPost>();
const isModalOpen = ref(false);

const autostartRecord = ref(false);
const autofocusText = ref(false);
const audioKey = ref(Math.random().toString().substring(0, 50));

const _swiper = ref<SwiperClass>();

const canSend = computed(() => {
  if (data.value.text.length) return true;
  else if (data.value.files.length) return true;
  else if (data.value.audio) return true;

  return false;
});

function load() {
  const input = document.createElement("input");
  input.multiple = true;
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

        data.value.files.push(f);
      };

      fileReader.readAsDataURL(file);
    }
  }

  input.addEventListener("change", readFile);
  input.click();
}

onMounted(getPost);
watch(() => route.query, getPost, { deep: true });
async function getPost() {
  post.value = undefined;
  isModalOpen.value = false;

  if (!route.query.write) {
    data.value = { text: "", files: [] };
    return;
  }

  if (route.query.write !== "new") {
    const params = JSON.parse(route.query.write as string);

    if (params.response) {
      try {
        loading.value = true;
        post.value = await Api.request<IPost>({
          url: `post/${params.response}`,
        });
      } finally {
        loading.value = false;
      }

      if (!post.value) {
        showError({ statusCode: 404, message: i18n.t("error.post_not_found") });
      }
    }

    autostartRecord.value = !!params.record;
    autofocusText.value = !params.record && !params.files;

    isModalOpen.value = true;

    if (params.files) load();
  }

  isModalOpen.value = true;
}

async function submit() {
  if (loading.value) return;
  // if (!form.value) return;

  // await form.value.validate();
  // console.log(form.value.isValid);

  // if (!form.value.isValid) return;

  try {
    loading.value = true;
    const _post = await Api.request<IPost>({
      url: `post`,
      method: "post",
      body: { ...data.value, response: post.value?.id },
    });

    Notify.push({
      text: createVNode(
        "div",
        { class: "d-flex flex-colum align-center ga-2" },
        [
          Use.i18n.t("success.post_write"),

          createVNode(
            VBtn,
            {
              variant: "text",
              active: false,
              color: "primary",
              rounded: true,
              onClick() {
                Use.router.push({
                  name: "post",
                  params: { id: _post.id },
                });
              },
            },
            Lodash.capitalize(Use.i18n.t("words.seePost"))
          ),
        ]
      ),
    });

    data.value = { text: "", files: [] };
    goBack();
  } finally {
    loading.value = false;
  }
}

function goBack() {
  const query = { ...route.query };

  if (query.write) {
    delete query.write;
    Use.router.push({ query, replace: true });
  }
}

function onRecordFinish(audio: IFile) {
  data.value.audio = audio;
  audioKey.value = Math.random().toString().substring(0, 50);
}
</script>

<template>
  <v-dialog
    v-if="Store.session.user && isModalOpen"
    :fullscreen="$vuetify.display.xs"
    :max-width="662"
    :persistent="loading"
    model-value
    @update:model-value="(v) => (!v ? goBack() : null)"
  >
    <v-card
      variant="flat"
      color="background"
      class="border"
      :rounded="$vuetify.display.xs ? '0' : 'xl'"
      :class="{ 'border-lg': !$vuetify.display.xs }"
    >
      <div
        class="border-b px-3 py-2 bg-background"
        style="position: sticky; top: 0; z-index: 15"
      >
        <v-btn
          color="surface"
          variant="flat"
          type="button"
          size="24"
          icon
          @click="goBack"
        >
          <i class="fi fi-sr-cross-small"></i>
          <!-- {{ Lodash.capitalize($t("words.cancel")) }} -->
        </v-btn>
      </div>
      <v-form ref="form" class="ui-post-write h-100" @submit.prevent="submit">
        <div class="d-flex align-center ga-2 px-3">
          <ui-user-avatar :user="Store.session.user" size="54" />
          <div style="line-height: 1">
            {{ Store.session.user.name }}
            <div class="text-body-2 text-primary">
              <template v-if="post">
                {{ $t("words.inResponsTo") }}
                {{ post.user.name }}
              </template>
              <template v-else> @{{ Store.session.user.username }} </template>
            </div>
          </div>

          <v-spacer />
          <v-btn
            :color="canSend ? 'primary' : 'dark'"
            :variant="canSend ? 'flat' : 'text'"
            :disabled="!canSend"
            type="submit"
            size="small"
            icon
          >
            <i class="fi fi-sr-paper-plane" style="font-size: 16px"></i>
            <!-- {{ Lodash.capitalize($t("words.topost")) }} -->
          </v-btn>
        </div>

        <div class="px-5">
          <ui-post-text-editor
            v-model="data.text"
            :placeholder="$t('post.placeholder')"
            :autofocus="autofocusText"
          />
        </div>

        <div v-if="data.audio" :key="audioKey" class="px-5">
          <div class="rounded-xl border px-3 py-1">
            <ui-audio-player :audio="data.audio">
              <template #prepend>
                <v-btn
                  size="x-small"
                  variant="text"
                  color="red"
                  icon
                  @click="data.audio = undefined"
                >
                  <i class="fi fi-sr-trash-xmark" style="font-size: 16px"></i>
                </v-btn>
              </template>
            </ui-audio-player>
          </div>
        </div>

        <!-- <v-textarea
          v-model="data.text"
          variant="solo"
          base-color="background"
          bg-color="rgba(var(--v-theme-on-background), 0.03)"
          rounded="0"
          :placeholder="$t('post.placeholder')"
          :rules="[
              (v) => (!v ? Lodash.capitalize($t('post.required')) : true),
              (v:string) => (v.length > 250 ? Lodash.capitalize($t('post.outOfRange')) : true),
            ]"
          no-resize
          flat
          autofocus
        ></v-textarea> -->

        <swiper
          :slidesPerView="'auto'"
          :grabCursor="true"
          :modules="[]"
          @init="(s) => (_swiper = s)"
          class="px-5 w-100"
        >
          <swiper-slide
            v-for="(file, f) in data.files"
            :key="f"
            :class="{
              'w-50': data.files.length >= 2,
              'w-100': data.files.length <= 1,
            }"
          >
            <div :class="{ 'pr-2': data.files.length >= 2 }">
              <v-card
                variant="flat"
                @click=""
                style="border-radius: 0.9em; position: relative"
              >
                <img
                  :src="file.url ?? file.content"
                  style="
                    width: 100%;
                    display: block;
                    object-fit: cover;
                    object-position: center;
                  "
                />

                <div style="position: absolute; top: 10px; right: 10px">
                  <v-btn
                    size="x-small"
                    variant="flat"
                    color="dark"
                    icon
                    @click="data.files.splice(f, 1)"
                  >
                    <i class="fi fi-sr-cross"></i>
                  </v-btn>
                </div>
              </v-card>
            </div>
          </swiper-slide>
        </swiper>

        <div
          class="d-flex align-center ga-2 mt-auto px-3 bg-background"
          style="height: 70px; position: sticky; bottom: 0; z-index: 50"
        >
          <v-btn color="dark" variant="text" type="button" size="small" icon>
            <i class="fi fi-rr-smile" style="font-size: 18px"></i>
          </v-btn>

          <v-spacer />

          <template v-if="!$audioRecord.isRecording.value">
            <v-btn
              color="primary"
              variant="text"
              type="button"
              size="small"
              icon
              @click="load"
            >
              <i class="fi fi-rr-picture" style="font-size: 18px"></i>
            </v-btn>
          </template>

          <ui-audio-record
            :autostart="autostartRecord"
            @finish="onRecordFinish"
          />
        </div>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<style lang="scss">
.ui-post-write {
  width: 100%;
  margin: 0 auto;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
}
</style>
