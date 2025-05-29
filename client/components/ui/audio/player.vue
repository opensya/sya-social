<script setup lang="ts">
import type { IFile } from "~/interfaces";

const props = defineProps({
  audio: { type: Object as PropType<IFile>, required: true },
});

const audioContent = ref<HTMLDivElement>();
const audioPlayer = useAudioPlayer();
const id = ref<string>();
const timerFormated = ref();
const durationFormated = ref("");
const loading = ref(false);

onMounted(setupPlayer);
async function setupPlayer() {
  id.value = audioPlayer.init({
    audio: props.audio,
    container: audioContent.value!,
    onTimeFormat(t) {
      timerFormated.value = t;
    },
    getDuration(data) {
      durationFormated.value = data.formated;
    },
    onLoading(n) {
      loading.value = n < 100 ? true : false;
    },
  });
}

onDeactivated(destroy);
onBeforeUnmount(destroy);
function destroy() {
  if (id.value) audioPlayer.destroy(id.value);
}
</script>

<template>
  <div class="ui-audio-player d-flex align-center ga-2 w-100">
    <div
      v-if="loading"
      class="skeleton"
      style="
        position: absolute;
        inset: 0;
        border-radius: inherit;
        height: 100%;
        z-index: -1;
      "
    ></div>

    <slot name="prepend"></slot>

    <div style="font-size: 12px">
      {{ durationFormated }}
    </div>

    <v-btn
      v-if="id"
      icon
      size="x-small"
      variant="text"
      color="dark"
      :disabled="
        $audioRecord.isRecording.value ||
        (!audio && $audioPlayer.currentID.value !== id)
      "
      @click="$audioPlayer.playPause(id)"
    >
      <span style="font-size: 14px">
        <i v-if="$audioPlayer.isPlaying.value" class="fi fi-sr-pause"></i>
        <i v-else class="fi fi-sr-play"></i>
      </span>
    </v-btn>

    <div ref="audioContent" class="w-100"></div>

    <v-btn
      v-if="$audioPlayer.isPlaying.value && $audioPlayer.currentID.value === id"
      color="dark"
      variant="tonal"
      size="small"
      width="70"
      rounded
      readonly
    >
      {{ timerFormated }}
    </v-btn>
    <v-btn
      v-else
      color="dark"
      variant="tonal"
      size="small"
      width="70"
      rounded
      @click="$audioPlayer.switchSpeed()"
    >
      x{{ $audioPlayer.speed.value }}
    </v-btn>

    <slot name="append"></slot>
  </div>
</template>

<style lang="scss">
.ui-audio-player {
  position: relative;

  ::part(canvases) {
    opacity: 0.2 !important;
  }

  ::part(cursor) {
    background-color: transparent !important;

    &::after {
      content: "";
      top: 50% !important;
      right: 0;
      position: absolute;
      width: 15px !important;
      height: 15px !important;
      transform: translateY(-50%) !important;
      border-radius: 100% !important;
      background-color: rgba(var(--v-theme-primary));
    }
  }
}
</style>
