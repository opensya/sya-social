import type { IFile } from "~/interfaces";

export default defineNuxtPlugin(() => {
  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  let audioChunks: Blob[] = [];
  let mediaRecorder = ref<MediaRecorder>();
  const isRecording = ref(false);
  const $aborting = ref(false);

  function cleanupStream(stream: MediaStream) {
    stream.getTracks().forEach((track) => {
      track.stop();
      track.enabled = false;
    });
  }

  async function start({
    onStop,
    onChunk,
    canvasRef,
  }: {
    onStop: (audio: IFile) => void;
    onChunk: (audio: IFile) => void;
    canvasRef: HTMLCanvasElement;
  }) {
    const audioPlayer = useAudioPlayer();
    audioPlayer.wavesurfer.value?.stop();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("L'accès au micro n'est pas supporté sur ce navigateur.");
    }

    const isRecording = ref(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.value = new MediaRecorder(stream);

      // audioContext = new AudioContext();
      // analyser = audioContext.createAnalyser();
      // analyser.fftSize = 2048;

      // source = audioContext.createMediaStreamSource(stream);
      // source.connect(analyser);

      // drawWaveform();

      mediaRecorder.value.ondataavailable = async (event) => {
        // audioChunks.push(event.data);

        if (event.data.size > 0) {
          audioChunks.push(event.data);

          const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
          const base64Content = await blobToBase64(audioBlob);

          const audio = {
            name: `${Date.now()}-tmp.webm`,
            type: audioBlob.type,
            size: audioBlob.size,
            content: base64Content,
          };

          onChunk(audio);
        }
      };

      mediaRecorder.value.onstop = async () => {
        isRecording.value = false;

        if (!$aborting.value) {
          const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
          const base64Content = await blobToBase64(audioBlob);

          const audio = {
            name: `${Date.now()}.webm`,
            type: audioBlob.type,
            size: audioBlob.size,
            content: base64Content,
          };

          audioChunks = [];

          onStop(audio);
        }

        $aborting.value = false;
        cleanupStream(stream);
      };

      audioChunks = [];
      mediaRecorder.value.start(500);
      isRecording.value = true;
      $aborting.value = false;

      return mediaRecorder;
    } catch (error) {
      console.error("Error accessing microphone:", error);
      isRecording.value = false;
      $aborting.value = false;
    }
  }

  function stop(aborting = false) {
    $aborting.value = aborting;
    mediaRecorder.value?.stop();
  }

  return {
    provide: { audioRecord2: { start, stop, isRecording } },
  };
});
