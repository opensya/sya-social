import type { IFile } from "~/interfaces";

export default defineNuxtPlugin(() => {
  let audioChunks: Blob[] = [];
  let mediaRecorder = ref<MediaRecorder>();

  const isRecording = ref(false);
  const isStarted = ref(false);
  const $abort = ref(false);
  const $id = ref<string | null>(null);
  const timerFormated = ref("");

  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let source: MediaStreamAudioSourceNode | null = null;

  function cleanupStream(stream: MediaStream) {
    stream.getTracks().forEach((track) => {
      track.stop();
      track.enabled = false;
    });
  }

  async function getAudioDuration(blob: Blob): Promise<number> {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    await audioContext.close();
    return audioBuffer.duration; // durée en secondes
  }

  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function checkVolume() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // 🔍 Analyse rapide du volume
    const tempAudioContext = new AudioContext();
    const tempSource = tempAudioContext.createMediaStreamSource(stream);
    const tempAnalyser = tempAudioContext.createAnalyser();
    tempAnalyser.fftSize = 2048;
    tempSource.connect(tempAnalyser);

    const tempBuffer = new Uint8Array(tempAnalyser.fftSize);

    await new Promise((resolve) => setTimeout(resolve, 1000)); // attendre 1 sec

    tempAnalyser.getByteTimeDomainData(tempBuffer);

    // 🧮 Calcul du volume moyen
    let sum = 0;
    for (let i = 0; i < tempBuffer.length; i++) {
      const value = (tempBuffer[i] - 128) / 128;
      sum += value * value;
    }
    const rms = Math.sqrt(sum / tempBuffer.length); // Root Mean Square
    if (rms < 0.01) {
      // cleanupStream(stream);
      await tempAudioContext.close();
      return false;
    }

    await tempAudioContext.close();
    return true;
  }

  async function init({
    container,
    onFinish,
    maxDuration = 150,
  }: {
    container: HTMLElement;
    onFinish: (audio: IFile | "abort", duration: number) => void;
    maxDuration?: number;
  }) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.log("L'accès au micro n'est pas supporté sur ce navigateur.");
      return;
    }

    try {
      timerFormated.value = "";

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorder.value = new MediaRecorder(stream);
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;

      source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const canvas = document.createElement("canvas");
      canvas.style.height = "100%";
      canvas.style.display = "block";
      container.appendChild(canvas);

      mediaRecorder.value.addEventListener("dataavailable", async (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);

          const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

          const time = await getAudioDuration(audioBlob);
          const hours = Math.floor(time / 3600);
          const minutes = Math.floor((time % 3600) / 60);
          const seconds = time % 60;
          const arrayTime = [minutes, seconds];
          if (hours > 0) arrayTime.unshift(hours);

          timerFormated.value = arrayTime
            .map((t) => Math.floor(t))
            .map((t) => t.toString().padStart(2, "0").substring(0, 2))
            .join(":");

          drawWaveform(audioBlob);

          if (time >= maxDuration) stop();
        }
      });

      mediaRecorder.value.addEventListener("stop", async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const base64Content = await blobToBase64(audioBlob);

        const audio = {
          name: `${Date.now()}.webm`,
          type: audioBlob.type,
          size: audioBlob.size,
          content: base64Content,
        };

        cleanupStream(stream);

        onFinish(
          $abort.value ? "abort" : audio,
          $abort.value ? 0 : await getAudioDuration(audioBlob)
        );

        $abort.value = false;
        $id.value = null;
        isRecording.value = false;
        isStarted.value = false;
        audioChunks = [];
        mediaRecorder.value = undefined;
      });

      audioChunks = [];
      isRecording.value = false;
      $abort.value = false;

      $id.value = Math.random().toString().substring(2, 50);

      function drawRoundedRect(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number
      ) {
        if (height < 1) height = 1;

        ctx.beginPath();
        radius = Math.min(radius, width / 2, height / 2); // empêche les débordements
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(
          x + width,
          y + height,
          x + width - radius,
          y + height
        );
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
      }

      async function drawWaveform(audioBlob: Blob) {
        const audioContext = new AudioContext();
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const rawData = audioBuffer.getChannelData(0); // mono
        const canvasHeight = canvas.offsetHeight;

        const barsPerSecond = 20; // 💡 ajustable : moins = plus lent
        const audioDuration = audioBuffer.duration;
        const samples = Math.floor(barsPerSecond * audioDuration);

        const spacing = 2;
        const barWidth = 4;
        const totalWidth = samples * (barWidth + spacing);

        canvas.width = totalWidth;
        canvas.height = canvasHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Calcul des valeurs moyennes par bloc
        const blockSize = Math.floor(rawData.length / samples);
        if (blockSize === 0) return;

        const filteredData = new Float32Array(samples);

        for (let i = 0; i < samples; i++) {
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(rawData[i * blockSize + j]);
          }
          filteredData[i] = sum / blockSize;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue(
          "--v-theme-on-background"
        );

        for (let i = 0; i < samples; i++) {
          const x = i * (barWidth + spacing);
          const gain = 3; // ou 4, ou 5 selon l'effet voulu
          const height = Math.min(
            filteredData[i] * canvasHeight * gain,
            canvasHeight
          );
          // const height = filteredData[i] * canvasHeight;
          const y = (canvasHeight - height) / 2;

          drawRoundedRect(ctx, x, y, barWidth, height, 2);
        }

        // Scroll automatique vers la fin (optionnel)
        canvas.parentElement?.scrollTo({
          left: canvas.width,
          behavior: "smooth",
        });
      }

      return $id.value;
    } catch (error) {
      console.error("Error accessing microphone:", error);
      isRecording.value = false;
      $abort.value = false;
    }
  }

  function start() {
    if (!mediaRecorder.value) return;

    const audioPlayer = useAudioPlayer();
    audioPlayer.pauseAll();

    $abort.value = false;
    isStarted.value = true;
    isRecording.value = true;

    mediaRecorder.value.start(100);
  }

  function stop(abort = false) {
    if (!mediaRecorder.value) return;

    $abort.value = abort;
    mediaRecorder.value.stop();
  }

  function playPause() {
    if (!mediaRecorder.value) return;
    if (isRecording.value) {
      mediaRecorder.value.pause();
      isRecording.value = false;
    } else {
      mediaRecorder.value.resume();
      isRecording.value = true;
    }
  }

  return {
    provide: {
      audioRecord: {
        init,
        start,
        stop,
        playPause,
        isRecording,
        isStarted,
        id: $id,
        timerFormated,
      },
    },
  };
});
