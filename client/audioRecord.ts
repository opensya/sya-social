import WaveSurfer, { type WaveSurferOptions } from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";
import type { IFile } from "~/interfaces";

export default defineNuxtPlugin(() => {
  const wavesurfer = ref<WaveSurfer>();
  const record = ref<RecordPlugin>();
  const isRecording = ref(false);
  const isStarted = ref(false);
  const abort = ref(false);
  const $id = ref<string>();

  const formatTimer = ref("");

  const updateProgress = (time: number) => {
    // time will be in milliseconds, convert it to mm:ss format
    const formattedTime = [
      Math.floor((time % 3600000) / 60000), // minutes
      Math.floor((time % 60000) / 1000), // seconds
    ]
      .map((v) => (v < 10 ? "0" + v : v))
      .join(":");

    formatTimer.value = formattedTime;
  };

  function init({ container }: { container: HTMLElement }) {
    const audioPlayer = useAudioPlayer();
    audioPlayer.wavesurfer.value?.stop();

    wavesurfer.value?.destroy();
    wavesurfer.value = undefined;
    abort.value = false;

    const onBackgroundColor = getComputedStyle(document.body).getPropertyValue(
      "--v-theme-on-background"
    );
    const primaryColor = getComputedStyle(document.body).getPropertyValue(
      "--v-theme-primary"
    );

    wavesurfer.value = WaveSurfer.create({
      container,
      waveColor: `rgb(${onBackgroundColor}, 0.5)`,
      progressColor: `rgb(${primaryColor}, 1)`,
      barWidth: 3,
      barGap: 1.5,
      barRadius: 2,
      height: 42,
    });

    record.value = wavesurfer.value.registerPlugin(
      RecordPlugin.create({
        renderRecordedAudio: false,
        scrollingWaveform: false,
        continuousWaveform: true,
        continuousWaveformDuration: 30, // optional
      })
    );

    record.value.on("record-progress", (time) => {
      updateProgress(time);
    });

    record.value.on("record-resume", () => {
      isRecording.value = true;
    });
    record.value.on("record-start", () => {
      isRecording.value = true;
    });

    record.value.on("record-pause", () => {
      isRecording.value = false;
    });

    record.value.on("record-end", () => {
      isRecording.value = false;
    });

    $id.value = Math.random().toString().substring(2, 50);
    return $id.value;
  }

  function start() {
    if (!record.value) return;
    record.value.startRecording().then(() => {});
    isStarted.value = true;
    abort.value = false;
  }

  function stop(abort = false) {
    if (!record.value) return;
    record.value.stopRecording();
    isStarted.value = false;
  }

  function playPause() {
    if (!record.value) return;
    if (record.value.isPaused()) record.value.resumeRecording();
    else record.value.pauseRecording();
  }

  function destroy() {
    wavesurfer.value?.destroy();
    wavesurfer.value = undefined;
    isRecording.value = false;
  }

  return {
    provide: {
      audioRecord: {
        init,
        start,
        stop,
        destroy,
        playPause,
        isRecording,
        isStarted,
        record,
        id: $id,
      },
    },
  };
});
