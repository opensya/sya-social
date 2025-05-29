<script lang="ts" setup>
import type { IFile } from "~/interfaces";

// const props = defineProps({ autostart: { type: Boolean, default: false } });
const emit = defineEmits<(e: "finish", audio: IFile) => void>();

const id = ref<string>();
const audioRecord = useAudioRecord();
const audioContent = ref<HTMLCanvasElement>();

onMounted(init(true));
function init(first = false) {
  setTimeout(async () => {
    if (!audioContent.value) return;
    audioContent.value.innerHTML = "";

    id.value = await audioRecord.init({
      container: audioContent.value!,
      onFinish,
    });

    // if (first && props.autostart) audioRecord.start();
  }, 100);
}

function onFinish($audio: IFile | "abort") {
  if ($audio === "abort") init();
  else {
    emit("finish", $audio);
    init();
  }
}
</script>

<template>
  <div
    class="ui-audio-record d-flex align-center"
    :class="{
      'w-100': $audioRecord.isRecording.value && $audioRecord.id.value === id,
    }"
  >
    <v-btn
      v-if="$audioRecord.isRecording.value && $audioRecord.id.value === id"
      size="24"
      color="dark"
      variant="tonal"
      class="mr-2"
      icon
      @click="audioRecord.stop(true)"
    >
      <i class="fi fi-sr-cross-small"></i>
    </v-btn>

    <div
      ref="audioContent"
      class="ui-audio-record--content"
      :class="[
        $audioRecord.isRecording.value && $audioRecord.id.value === id
          ? 'w-100'
          : 'w-0',
      ]"
    ></div>

    <div
      v-if="$audioRecord.isRecording.value && $audioRecord.id.value === id"
      class="text-body-2 ml-2"
    >
      {{ $audioRecord.timerFormated.value }}
    </div>

    <v-spacer />
    <v-btn
      v-if="!$audioRecord.isStarted.value"
      :disabled="$audioRecord.id.value !== id"
      size="x-small"
      variant="text"
      color="primary"
      icon
      @click="$audioRecord.start()"
    >
      <ui-svg name="mic" size="22" />
    </v-btn>
    <template v-else>
      <v-btn
        size="x-small"
        variant="tonal"
        color="dark"
        class="ml-2"
        icon
        @click="$audioRecord.playPause()"
      >
        <i
          v-if="$audioRecord.isRecording.value"
          class="fi fi-sr-pause"
          style="font-size: 16px"
        ></i>
        <i v-else class="fi fi-sr-play" style="font-size: 16px"></i>
      </v-btn>
      <v-btn
        size="x-small"
        variant="tonal"
        color="dark"
        class="ml-2"
        icon
        @click="$audioRecord.stop()"
      >
        <i class="fi fi-sr-stop" style="font-size: 16px"></i>
      </v-btn>
    </template>
  </div>
</template>

<style lang="scss">
.ui-audio-record--content {
  width: 100%;
  height: 45px;
  overflow: scroll;
  position: relative;

  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, and Opera */
  }

  canvas {
    position: absolute;
    top: 0;
    right: 0;
  }
}
</style>
