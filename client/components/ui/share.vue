<script lang="ts" setup>
import QRCode from "qrcode";
import convert, { type RGB } from "color-convert";
import { createVNode } from "vue";

// const props = defineProps({
//   url: { type: String, required: true },
//   text: { type: String },
//   title: { type: String },
// });

const data = ref<{ url: string; title?: string; text?: string }>();
const isModalOpen = ref(false);
const route = useRoute();
const i18n = useI18n();
const canvas = ref<HTMLCanvasElement>();
const isShareAvailable = ref(false);

function copyLinkModel() {
  navigator.clipboard.writeText(data.value!.url).then(() => {
    Notify.push({
      text: createVNode(
        "div",
        { class: "d-flex flex-colum align-center ga-2" },
        [
          createVNode("i", { class: "fi fi-sr-check-circle text-success" }),
          Use.i18n.t("success.copy"),
        ]
      ),
    });
    goBack();
  });
}

function dataURLtoFile(dataurl: string, filename: string) {
  const arr = dataurl.split(",");
  let mime = arr[0].match(/:(.*?);/)![1];
  let bstr = atob(arr[arr.length - 1]);
  let n = bstr.length;
  let u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

onMounted(openModal);
watch(() => route.query, openModal, { deep: true });
async function openModal() {
  data.value = undefined;
  isModalOpen.value = false;

  if (!route.query.share) {
    data.value = undefined;
    return;
  }
  data.value = JSON.parse(route.query.share as string);
  isModalOpen.value = true;

  setTimeout(useQrcode, 100);
}

function useQrcode() {
  isShareAvailable.value = !!navigator.canShare;
  const primaryColorPlain = getComputedStyle(document.body).getPropertyValue(
    "--v-theme-primary"
  );
  const primaryColor: RGB = [
    parseInt(primaryColorPlain.split(",")[0]),
    parseInt(primaryColorPlain.split(",")[1]),
    parseInt(primaryColorPlain.split(",")[2]),
  ];

  if (!canvas.value) return;

  QRCode.toCanvas(
    canvas.value,
    data.value!.url,
    {
      margin: 3,
      errorCorrectionLevel: "H", // Important pour tolérer une image centrale
      color: {
        light: `#${convert.rgb.hex(primaryColor)}`,
        dark: "#fff",
      },
    },
    function (error) {
      if (error) console.error(error);
      else addLogoToQR();
    }
  );

  function addLogoToQR() {
    const ctx = canvas.value!.getContext("2d");
    if (!ctx) return;

    const logo = new Image();
    logo.src = "/images/logo.png";

    logo.onload = () => {
      const logoSize = canvas.value!.width * 0.2;

      const div = document.createElement("div");
      div.style.backgroundColor = "#fff";
      div.style.width = `${logoSize}px`;
      div.style.height = `${logoSize}px`;

      const x = (canvas.value!.width - logoSize) / 2;
      const y = (canvas.value!.height - logoSize) / 2;

      const fillSize = logoSize * 1.2;
      const xFill = (canvas.value!.width - fillSize) / 2;
      const yFill = (canvas.value!.height - fillSize) / 2;
      ctx.fillStyle = "#fff";
      ctx.fillRect(xFill, yFill, fillSize, fillSize);

      ctx!.drawImage(logo, x, y, logoSize, logoSize);
    };
  }
}

function share() {
  if (data.value) return;
  if (!canvas.value) return;
  if (!navigator.canShare) return;

  goBack();

  const dataURL = canvas.value.toDataURL("image/png");
  navigator.share({
    files: [dataURLtoFile(dataURL, `${data.value!.title ?? "sya"}.png`)],
    url: data.value!.url,
    text: data.value!.title,
    title: data.value!.title,
  });
}

function downloadImg() {
  if (!canvas.value) return;

  const dataURL = canvas.value.toDataURL("image/png");

  const link = document.createElement("a");
  link.href = dataURL;
  link.download = data.value!.title ?? "Sya";
  link.innerText = data.value!.text ?? i18n.t("meta.description");
  link.click();
  goBack();
}

function integrate() {
  const iframe = `<iframe src="${data.value!.url}" title="${
    data.value!.title ?? "Sya"
  }" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
  navigator.clipboard.writeText(iframe).then(() => {
    Notify.push({
      text: createVNode(
        "div",
        { class: "d-flex flex-colum align-center ga-2" },
        [
          createVNode("i", { class: "fi fi-sr-check-circle text-success" }),
          Use.i18n.t("success.copy"),
        ]
      ),
    });
    goBack();
  });
}

function goBack() {
  const query = { ...route.query };

  if (query.share) {
    delete query.share;
    Use.router.push({ query, replace: true });
  }
}
</script>

<template>
  <v-dialog
    v-if="isModalOpen"
    :fullscreen="$vuetify.display.xs"
    :max-width="442"
    model-value
    @update:model-value="(v) => (!v ? goBack() : null)"
  >
    <v-card color="background" elevation="1" rounded="xl" class="border">
      <div
        class="border-b px-3 py-2 bg-background d-flex"
        style="position: sticky; top: 0; z-index: 15"
      >
        <div class="ml-5">
          {{ Lodash.capitalize($t("words.toshare")) }}
        </div>

        <v-spacer />
        <v-btn
          color="surface"
          variant="flat"
          type="button"
          size="24"
          icon
          @click="goBack"
        >
          <i class="fi fi-sr-cross-small"></i>
        </v-btn>
      </div>
      <div class="ma-5">
        <canvas ref="canvas" class="mx-auto d-block"></canvas>

        <div class="d-flex align-center justify-center ga-3 mt-5">
          <v-tooltip
            location="top center"
            content-class="rounded-pill"
            :text="Lodash.capitalize($t('words.copyLink'))"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                color="dark"
                variant="text"
                class="border"
                icon
                @click="copyLinkModel()"
              >
                <i class="fi fi-br-link" style="font-size: 18px"></i>
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip
            v-if="isShareAvailable"
            location="top center"
            content-class="rounded-pill"
            :text="Lodash.capitalize($t('words.toshare'))"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                color="dark"
                variant="text"
                class="border"
                icon
                @click="share()"
              >
                <i class="fi fi-sr-share" style="font-size: 18px"></i>
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip
            location="top center"
            content-class="rounded-pill"
            :text="Lodash.capitalize($t('words.todownload'))"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                color="dark"
                variant="text"
                class="border"
                icon
                @click="downloadImg()"
              >
                <i class="fi fi-sr-picture" style="font-size: 18px"></i>
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip
            location="top center"
            content-class="rounded-pill"
            :text="Lodash.capitalize($t('words.integrate'))"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                color="dark"
                variant="text"
                class="border"
                icon
                @click="integrate()"
              >
                <i class="fi fi-br-code-simple" style="font-size: 18px"></i>
              </v-btn>
            </template>
          </v-tooltip>
        </div>

        <!-- <v-btn
            color="dark"
            variant="text"
            class="border mt-2"
            rounded="lg"
            block
            :to="{ name: 'input-id', params: { id: options.id } }"
            target="_blank"
            @click="isActive.value = false"
          >
            <template #prepend>
              <ui-svg name="link" width="18" height="18" />
            </template>
            {{ $t("remplir") }}
          </v-btn> -->
      </div>
    </v-card>
  </v-dialog>
</template>
