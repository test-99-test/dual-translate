/**
 * Web Audio API utilities for Gemini Live API
 * - Input: 16kHz Mono 16-bit linear PCM (Little-endian) sent every ~100ms
 * - Output: 24kHz Mono 16-bit linear PCM decoded & seamlessly queued for playback
 */

export function floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToFloat32Array(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  
  const int16Array = new Int16Array(bytes.buffer);
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }
  return float32Array;
}

function resampleTo16k(input: Float32Array, fromRate: number): Float32Array {
  if (fromRate === 16000) return input;
  const ratio = fromRate / 16000;
  const newLength = Math.round(input.length / ratio);
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const originIdx = i * ratio;
    const idx0 = Math.floor(originIdx);
    const idx1 = Math.min(idx0 + 1, input.length - 1);
    const frac = originIdx - idx0;
    result[i] = input[idx0] * (1 - frac) + input[idx1] * frac;
  }
  return result;
}

/**
 * Microphone Recorder for Gemini Live (16kHz PCM stream)
 */
export class AudioRecorder {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private isRecording: boolean = false;
  private bufferAccumulator: number[] = [];
  private onChunkCallback: ((base64PCM: string) => void) | null = null;
  private onLevelCallback: ((level: number) => void) | null = null;
  private animFrameId: number | null = null;
  private targetChunkSamples = 1600; // 100ms at 16000Hz

  async start(
    onChunk: (base64PCM: string) => void,
    onLevel?: (level: number) => void
  ): Promise<boolean> {
    if (this.isRecording) return true;

    try {
      this.onChunkCallback = onChunk;
      this.onLevelCallback = onLevel || null;

      // Mobile-safe constraints (DO NOT force sampleRate in getUserMedia or mobile browsers reject)
      const constraints: MediaStreamConstraints = {
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Create AudioContext (fallback to hardware rate if custom 16000 rate throws on iOS)
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      let ctx: AudioContext;
      try {
        ctx = new AudioCtx({ sampleRate: 16000 });
      } catch {
        ctx = new AudioCtx();
      }
      this.audioContext = ctx;

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;

      // ScriptProcessor with buffer size 2048
      this.processorNode = this.audioContext.createScriptProcessor(2048, 1, 1);
      this.bufferAccumulator = [];

      this.processorNode.onaudioprocess = (e) => {
        if (!this.isRecording) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const actualSampleRate = this.audioContext ? this.audioContext.sampleRate : 16000;
        const resampled = resampleTo16k(inputData, actualSampleRate);

        // Accumulate 16kHz samples
        for (let i = 0; i < resampled.length; i++) {
          this.bufferAccumulator.push(resampled[i]);
        }

        // When we have >= 1600 samples (100ms), emit PCM chunk
        while (this.bufferAccumulator.length >= this.targetChunkSamples) {
          const chunkSamples = new Float32Array(this.bufferAccumulator.slice(0, this.targetChunkSamples));
          this.bufferAccumulator = this.bufferAccumulator.slice(this.targetChunkSamples);

          const pcmBuffer = floatTo16BitPCM(chunkSamples);
          const base64 = arrayBufferToBase64(pcmBuffer);
          if (this.onChunkCallback) {
            this.onChunkCallback(base64);
          }
        }
      };

      this.sourceNode.connect(this.analyserNode);
      this.sourceNode.connect(this.processorNode);
      this.processorNode.connect(this.audioContext.destination);

      this.isRecording = true;
      this.startLevelMonitoring();
      return true;
    } catch (err) {
      console.error('[AudioRecorder] Failed to start recording:', err);
      this.stop();
      return false;
    }
  }

  private startLevelMonitoring() {
    if (!this.analyserNode || !this.onLevelCallback) return;
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);

    const checkLevel = () => {
      if (!this.isRecording || !this.analyserNode) return;
      this.analyserNode.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      const normalized = Math.min(100, Math.round((avg / 128) * 100));
      if (this.onLevelCallback) {
        this.onLevelCallback(normalized);
      }
      this.animFrameId = requestAnimationFrame(checkLevel);
    };

    checkLevel();
  }

  stop() {
    this.isRecording = false;

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode.onaudioprocess = null;
      this.processorNode = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.analyserNode) {
      this.analyserNode.disconnect();
      this.analyserNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }

    this.bufferAccumulator = [];
    if (this.onLevelCallback) {
      this.onLevelCallback(0);
    }
  }

  get active(): boolean {
    return this.isRecording;
  }
}

/**
/**
 * Pitch-preserving time-scale modification (SOLA - Synchronized Overlap-Add)
 * Scales audio duration by (1 / speed) while keeping the pitch and formants unchanged.
 */
export function timeStretchFloat32(
  input: Float32Array,
  speed: number,
  sampleRate: number = 24000
): Float32Array {
  if (Math.abs(speed - 1.0) < 0.02 || input.length < 512) {
    return input;
  }

  // 25ms window size: ~600 samples at 24000Hz
  const windowSize = Math.round(sampleRate * 0.025);
  const overlap = Math.round(windowSize / 2);
  const synthesisHop = overlap;
  const analysisHop = Math.round(synthesisHop * speed);
  const maxOffset = Math.round(sampleRate * 0.008); // ±8ms search range

  const estimatedOutputLength = Math.max(windowSize, Math.round(input.length / speed));
  const output = new Float32Array(estimatedOutputLength + windowSize * 2);
  const weights = new Float32Array(estimatedOutputLength + windowSize * 2);

  let inPos = 0;
  let outPos = 0;

  // First window
  for (let i = 0; i < windowSize && i < input.length; i++) {
    const w = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (windowSize - 1)));
    output[i] += input[i] * w;
    weights[i] += w;
  }
  outPos += synthesisHop;
  inPos += analysisHop;

  while (inPos + windowSize + maxOffset < input.length && outPos < output.length - windowSize) {
    let bestOffset = 0;
    let maxCorr = -Infinity;

    for (let offset = -maxOffset; offset <= maxOffset; offset += 2) {
      const candidatePos = inPos + offset;
      if (candidatePos < 0 || candidatePos + overlap >= input.length) continue;

      let corr = 0;
      for (let j = 0; j < overlap; j += 4) {
        corr += output[outPos + j] * input[candidatePos + j];
      }

      if (corr > maxCorr) {
        maxCorr = corr;
        bestOffset = offset;
      }
    }

    const naturalInPos = inPos + bestOffset;

    for (let i = 0; i < windowSize; i++) {
      const w = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (windowSize - 1)));
      output[outPos + i] += input[naturalInPos + i] * w;
      weights[outPos + i] += w;
    }

    outPos += synthesisHop;
    inPos += analysisHop;
  }

  const finalLen = Math.min(outPos, output.length);
  const result = new Float32Array(finalLen);
  for (let i = 0; i < finalLen; i++) {
    result[i] = weights[i] > 0.001 ? output[i] / weights[i] : output[i];
  }

  return result;
}

/**
 * Output Audio Player for Gemini Live (24kHz PCM stream)
 */
export class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private nextPlayTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private onLevelCallback: ((level: number) => void) | null = null;
  private animFrameId: number | null = null;
  private volume: number = 1.0;
  private playbackSpeed: number = 1.0;

  constructor() {
    // Lazy initialized on first user interaction or playback
  }

  private initContext() {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      try {
        this.audioContext = new AudioCtx({ sampleRate: 24000 });
      } catch {
        this.audioContext = new AudioCtx();
      }
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);

      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;

      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioContext.destination);
      this.nextPlayTime = this.audioContext.currentTime;

      this.startLevelMonitoring();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
  }

  setLevelCallback(cb: ((level: number) => void) | null) {
    this.onLevelCallback = cb;
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.audioContext) {
      this.gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
    }
  }

  setPlaybackSpeed(speed: number) {
    this.playbackSpeed = Math.max(0.5, Math.min(2.0, speed));
  }

  private startLevelMonitoring() {
    if (!this.analyserNode) return;
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);

    const checkLevel = () => {
      if (!this.analyserNode || !this.audioContext) return;
      this.analyserNode.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      const normalized = Math.min(100, Math.round((avg / 128) * 100));
      if (this.onLevelCallback) {
        this.onLevelCallback(normalized);
      }
      this.animFrameId = requestAnimationFrame(checkLevel);
    };

    checkLevel();
  }

  /**
   * Enqueue a 24kHz Base64 PCM chunk
   */
  queueAudioChunk(base64PCM: string) {
    this.initContext();
    if (!this.audioContext || !this.gainNode) return;

    try {
      let float32Data = base64ToFloat32Array(base64PCM);
      if (float32Data.length === 0) return;

      if (Math.abs(this.playbackSpeed - 1.0) >= 0.02) {
        float32Data = timeStretchFloat32(float32Data, this.playbackSpeed, 24000);
      }

      const audioBuffer = this.audioContext.createBuffer(1, float32Data.length, 24000);
      audioBuffer.getChannelData(0).set(float32Data);

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.gainNode);

      const currentTime = this.audioContext.currentTime;
      // If we fell behind or this is the start of a new utterance, start right now
      if (this.nextPlayTime < currentTime) {
        this.nextPlayTime = currentTime;
      }

      source.start(this.nextPlayTime);
      this.nextPlayTime += audioBuffer.duration;

      this.activeSources.push(source);
      source.onended = () => {
        const index = this.activeSources.indexOf(source);
        if (index > -1) {
          this.activeSources.splice(index, 1);
        }
      };
    } catch (err) {
      console.error('[AudioPlayer] Error queuing audio chunk:', err);
    }
  }

  /**
   * Stop all playing audio immediately (e.g. user interruption or speaker change)
   */
  interrupt() {
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // ignore already stopped sources
      }
    }
    this.activeSources = [];
    if (this.audioContext) {
      this.nextPlayTime = this.audioContext.currentTime;
    }
    if (this.onLevelCallback) {
      this.onLevelCallback(0);
    }
  }

  destroy() {
    this.interrupt();
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }
}
