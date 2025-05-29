import WaveSurfer from "wavesurfer.js";
import Hover from "wavesurfer.js/dist/plugins/hover.esm.js";
import type { IFile } from "~/interfaces";

export default defineNuxtPlugin(() => {
  const wavesurfers = ref<{ [x: string]: WaveSurfer }>({});
  const isPlaying = ref(false);
  const $id = ref<string>();
  const speed = ref(1);

  function init({
    audio,
    container,
    onTimeFormat,
    getDuration,
    onLoading,
    onLoad,
  }: {
    audio: IFile;
    container: HTMLElement;
    onTimeFormat: (timerFormated: string) => void;
    getDuration: (data: { formated: string; value: number }) => void;
    onLoading?: (n: number) => void;
    onLoad?: () => void;
  }) {
    const id = Math.random().toString().substring(2, 50);

    const onBackgroundColor = getComputedStyle(document.body).getPropertyValue(
      "--v-theme-on-background"
    );
    const primaryColor = getComputedStyle(document.body).getPropertyValue(
      "--v-theme-primary"
    );

    wavesurfers.value[id] = WaveSurfer.create({
      url: audio.url ?? audio.content,
      container,
      waveColor: `rgba(${onBackgroundColor}, 1)`,
      progressColor: `rgba(${onBackgroundColor}, 1)`,
      barWidth: 4,
      barGap: 2,
      barRadius: 2,
      height: 45,
      plugins: [
        Hover.create({
          lineWidth: 0,
          labelBackground: `rgba(${primaryColor}, 1)`,
          labelColor: "#fff",
          labelSize: "11px",
        }),
      ],
    });

    wavesurfers.value[id].on("play", () => {
      $id.value = id;
      isPlaying.value = true;

      for (const _id of Object.keys(wavesurfers.value)) {
        if (_id !== id) wavesurfers.value[_id].pause();
      }

      const audioRecord = useAudioRecord();
      if (audioRecord.isRecording.value) wavesurfers.value[id].pause();
    });
    wavesurfers.value[id].on("pause", () => {
      if ($id.value === id) isPlaying.value = false;
    });

    wavesurfers.value[id].on("timeupdate", () => {
      timeFormater();
    });

    wavesurfers.value[id].on("loading", (e) => {
      onLoading?.(e);
    });
    wavesurfers.value[id].on("load", () => {
      onLoad?.();
    });

    wavesurfers.value[id].on("ready", () => {
      timeFormater();

      const totalTime = wavesurfers.value[id].getDuration();
      const hours = Math.floor(totalTime / 3600);
      const minutes = Math.floor((totalTime % 3600) / 60);
      const seconds = totalTime % 60;
      const arrayTime = [minutes, seconds];
      if (hours > 0) arrayTime.unshift(hours);

      const timerFormated = arrayTime
        .map((t) => Math.floor(t))
        .map((t) => t.toString().padStart(2, "0").substring(0, 2))
        .join(":");
      getDuration({ formated: timerFormated, value: totalTime });

      wavesurfers.value[id].setPlaybackRate(speed.value, true);
    });

    wavesurfers.value[id].on("finish", () => {
      if ($id.value === id) isPlaying.value = false;
    });

    function timeFormater() {
      const totalTime = wavesurfers.value[id].getDuration();
      const currentTime = wavesurfers.value[id].getCurrentTime();
      const remainingTime = totalTime - currentTime;

      const hours = Math.floor(remainingTime / 3600);
      const minutes = Math.floor((remainingTime % 3600) / 60);
      const seconds = remainingTime % 60;
      const arrayTime = [minutes, seconds];
      if (hours > 0) arrayTime.unshift(hours);

      const timerFormated = arrayTime
        .map((t) => Math.floor(t))
        .map((t) => t.toString().padStart(2, "0").substring(0, 2))
        .join(":");

      onTimeFormat(timerFormated);
    }

    return id;
  }

  function playPause(id: string) {
    if (wavesurfers.value[id]) {
      wavesurfers.value[id].playPause();
    }
  }

  function pauseAll() {
    for (const _id of Object.keys(wavesurfers.value)) {
      wavesurfers.value[_id].pause();
    }
  }

  function switchSpeed() {
    if (speed.value === 1) speed.value = 1.5;
    else if (speed.value === 1.5) speed.value = 2;
    else if (speed.value === 1.5) speed.value = 2;
    else speed.value = 1;

    for (const _id of Object.keys(wavesurfers.value)) {
      wavesurfers.value[_id].setPlaybackRate(speed.value, true);
    }
  }

  function destroy(id: string) {
    if (wavesurfers.value[id]) {
      wavesurfers.value[id].pause();
      wavesurfers.value[id]?.destroy();

      if ($id.value === id) isPlaying.value = false;

      delete wavesurfers.value[id];
    }
  }

  return {
    provide: {
      audioPlayer: {
        init,
        destroy,
        isPlaying,
        currentID: $id,
        playPause,
        pauseAll,
        wavesurfers,
        speed,
        switchSpeed,
      },
    },
  };
});
