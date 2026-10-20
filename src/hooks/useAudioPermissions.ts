import { useState, useEffect, useCallback, useRef } from 'react';

export type PermissionStateStatus = 'granted' | 'prompt' | 'denied' | 'unknown';

export interface AudioPermissionHook {
  permissionStatus: PermissionStateStatus;
  isTestingMic: boolean;
  micLevel: number;
  micTestSuccess: boolean;
  micErrorMessage: string | null;
  isPlayingTestTone: boolean;
  tonePlayedSuccess: boolean;
  checkPermission: () => Promise<PermissionStateStatus>;
  startMicTest: () => Promise<boolean>;
  stopMicTest: () => void;
  playTestTone: () => Promise<boolean>;
  isIOS: boolean;
  isAndroid: boolean;
}

export function useAudioPermissions(): AudioPermissionHook {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStateStatus>('unknown');
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [micTestSuccess, setMicTestSuccess] = useState(false);
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);
  const [isPlayingTestTone, setIsPlayingTestTone] = useState(false);
  const [tonePlayedSuccess, setTonePlayedSuccess] = useState(false);

  const testStreamRef = useRef<MediaStream | null>(null);
  const testAudioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);

  // Check current permission using Permissions API if available
  const checkPermission = useCallback(async (): Promise<PermissionStateStatus> => {
    try {
      if (typeof navigator !== 'undefined' && 'permissions' in navigator && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        const state = result.state as PermissionStateStatus;
        setPermissionStatus(state);

        result.onchange = () => {
          setPermissionStatus(result.state as PermissionStateStatus);
        };
        return state;
      }
    } catch {
      // iOS Safari does not support query for 'microphone'
    }
    setPermissionStatus('unknown');
    return 'unknown';
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Clean up mic test
  const stopMicTest = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (testStreamRef.current) {
      testStreamRef.current.getTracks().forEach((t) => t.stop());
      testStreamRef.current = null;
    }
    if (testAudioCtxRef.current && testAudioCtxRef.current.state !== 'closed') {
      testAudioCtxRef.current.close().catch(() => {});
      testAudioCtxRef.current = null;
    }
    setIsTestingMic(false);
    setMicLevel(0);
  }, []);

  // Start microphone test
  const startMicTest = useCallback(async (): Promise<boolean> => {
    stopMicTest();
    setIsTestingMic(true);
    setMicErrorMessage(null);
    setMicTestSuccess(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      testStreamRef.current = stream;
      setPermissionStatus('granted');
      setMicTestSuccess(true);

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      testAudioCtxRef.current = ctx;

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        if (!testStreamRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setMicLevel(normalized);
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
      return true;
    } catch (err: any) {
      console.error('[AudioPermission] Mic test failed:', err);
      stopMicTest();
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionStatus('denied');
        setMicErrorMessage('マイクへのアクセスが拒否されています。スマホやブラウザの設定でマイク許可をオンにしてください。');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setMicErrorMessage('マイクデバイスが見つかりません。マイクが接続されているか確認してください。');
      } else {
        setMicErrorMessage(`マイクの初期化に失敗しました: ${err.message || '不明なエラー'}`);
      }
      return false;
    }
  }, [stopMicTest]);

  // Play melodic test tone for speaker testing (unmutes and tests AudioContext)
  const playTestTone = useCallback(async (): Promise<boolean> => {
    setIsPlayingTestTone(true);
    setTonePlayedSuccess(false);

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Play 3 melodic ascending notes (C5=523.25, E5=659.25, G5=783.99)
      const now = ctx.currentTime;
      const notes = [
        { freq: 523.25, time: 0, dur: 0.15 },
        { freq: 659.25, time: 0.15, dur: 0.15 },
        { freq: 783.99, time: 0.30, dur: 0.35 }
      ];

      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.freq, now + n.time);

        gain.gain.setValueAtTime(0, now + n.time);
        gain.gain.linearRampToValueAtTime(0.3, now + n.time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + n.time);
        osc.stop(now + n.time + n.dur);
      });

      setTimeout(() => {
        setIsPlayingTestTone(false);
        setTonePlayedSuccess(true);
        try {
          ctx.close();
        } catch {}
      }, 750);

      return true;
    } catch (e) {
      console.error('[AudioPermission] Speaker test tone failed:', e);
      setIsPlayingTestTone(false);
      return false;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMicTest();
    };
  }, [stopMicTest]);

  return {
    permissionStatus,
    isTestingMic,
    micLevel,
    micTestSuccess,
    micErrorMessage,
    isPlayingTestTone,
    tonePlayedSuccess,
    checkPermission,
    startMicTest,
    stopMicTest,
    playTestTone,
    isIOS,
    isAndroid
  };
}
