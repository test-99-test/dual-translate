import { useState, useEffect, useCallback } from 'react';
import { CURRENT_APP_VERSION, VERSION_HISTORY, VersionRelease } from '../types/version';

export function useAppUpdate() {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [latestRelease, setLatestRelease] = useState<VersionRelease>(VERSION_HISTORY[0]);
  const [isChecking, setIsChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState<string | null>(null);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  const checkForUpdates = useCallback(async (manual: boolean = false) => {
    setIsChecking(true);
    setCheckMessage(null);

    try {
      // 1. Check ServiceWorker registration update
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            await registration.update();
            if (registration.waiting) {
              setWaitingWorker(registration.waiting);
              setHasUpdate(true);
              setCheckMessage('新しいアップデートが検出されました！');
              return;
            }
          }
        } catch (swErr) {
          console.warn('[SW] SW update check warning:', swErr);
        }
      }

      // 2. Fetch server version endpoint
      const res = await fetch(`/api/version?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.version && data.version !== CURRENT_APP_VERSION) {
          const dismissed = sessionStorage.getItem('dismissed_version');
          if (dismissed !== data.version || manual) {
            setLatestRelease({
              version: data.version,
              date: data.date || '',
              title: data.title || '最新アップデート',
              changes: data.changes || ['パフォーマンスと機能の改善'],
              isLatest: true
            });
            setHasUpdate(true);
            setCheckMessage(`新しいバージョン ${data.version} が利用可能です！`);
            return;
          }
        }
      }

      if (manual) {
        setCheckMessage(`お使いのバージョン（${CURRENT_APP_VERSION}）は最新です！`);
      }
    } catch (e) {
      console.warn('Update check failed:', e);
      if (manual) {
        setCheckMessage('アップデートの確認に失敗しました。接続をご確認ください。');
      }
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    // Initial check on mount
    checkForUpdates(false);

    // Listen to service worker update events
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (!reg) return;

        if (reg.waiting) {
          setWaitingWorker(reg.waiting);
          setHasUpdate(true);
        }

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setHasUpdate(true);
              }
            });
          }
        });
      });
    }
  }, [checkForUpdates]);

  // User explicitly chooses "Later / Don't update now"
  const dismissUpdate = useCallback(() => {
    sessionStorage.setItem('dismissed_version', latestRelease.version);
    setHasUpdate(false);
  }, [latestRelease.version]);

  // User explicitly chooses "Update Now"
  const applyUpdate = useCallback(async () => {
    try {
      if (waitingWorker) {
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch (err) {
      console.warn('[Update] Cache clearing warning:', err);
    }
    // Hard reload
    window.location.reload();
  }, [waitingWorker]);

  // Demo / Simulation helper so the user can test the optional update workflow
  const simulateNewVersion = useCallback((simulate: boolean) => {
    if (simulate) {
      setLatestRelease({
        version: 'v5.3.0 (プレビュー)',
        date: '2026-10-21',
        title: '【次期バージョン】同時通訳エンジン高速化＆多言語追加',
        changes: [
          'Gemini Live WebSocket 音声パケットバッファリングの最適化（遅延をさらに20%短縮）',
          '新しい事前設定音声モデル（Kore / Zephyr）の日本語イントネーション調整',
          '会話履歴のCSV/Excelエクスポート形式の追加',
          '※ このアップデートは任意です。更新しなくても現行バージョン（v5.2.0）をそのまま利用できます。'
        ],
        isLatest: true
      });
      setHasUpdate(true);
    } else {
      setLatestRelease(VERSION_HISTORY[0]);
      setHasUpdate(false);
    }
  }, []);

  return {
    hasUpdate,
    latestRelease,
    isChecking,
    checkMessage,
    checkForUpdates,
    dismissUpdate,
    applyUpdate,
    simulateNewVersion,
    currentVersion: CURRENT_APP_VERSION,
    history: VERSION_HISTORY
  };
}
