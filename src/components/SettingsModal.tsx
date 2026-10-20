import React, { useState } from 'react';
import { X, Settings, Volume2, Mic, Type, UserCheck, Gauge, Key, CheckCircle2, ExternalLink, Sparkles, RefreshCw, ShieldCheck } from 'lucide-react';
import { AppSettings, VoiceName } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { CURRENT_APP_VERSION } from '../types/version';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onOpenUpdateModal?: () => void;
  onOpenPermissionModal?: () => void;
  hasUpdate?: boolean;
}

const VOICES: { id: VoiceName; label: string; desc: string }[] = [
  { id: 'Puck', label: 'Puck (標準・軽快)', desc: '明瞭で聞き取りやすい標準的な男性寄りのニュートラルトーン' },
  { id: 'Charon', label: 'Charon (深み・低音)', desc: '落ち着いた知的なトーン。ビジネス・会議に最適' },
  { id: 'Kore', label: 'Kore (温和・女性的)', desc: '親しみやすく自然な女性トーン。日常会話や接客向け' },
  { id: 'Fenrir', label: 'Fenrir (力強さ・明確)', desc: '明瞭でメリハリがあり、工場や現場指示に最適' },
  { id: 'Zephyr', label: 'Zephyr (穏やか・ソフト)', desc: '優しく安心感を与えるトーン。医療・相談向け' },
  { id: 'Aoede', label: 'Aoede (明朗・エレガント)', desc: '明るく丁寧な発音で観光やプレゼン向け' }
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onOpenUpdateModal,
  onOpenPermissionModal,
  hasUpdate = false
}) => {
  const [apiKeyFeedback, setApiKeyFeedback] = useState<{ msg: string; isError: boolean } | null>(null);
  const [isCheckingKey, setIsCheckingKey] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">通訳環境・音声設定</h2>
              <p className="text-xs text-slate-400">Gemini Live 合成音声・音量・表示カスタマイズ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 max-h-[70vh]">
          {/* API Key Settings & Google AI Studio Link Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Key className="w-4 h-4 text-amber-400" />
                Google AI Studio API キー設定
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-bold transition-colors"
              >
                <span>AI Studioでキー取得</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex gap-2">
              <input
                type="password"
                placeholder="AIzaSy... (自身のAPIキーを入力)"
                defaultValue={localStorage.getItem('gemini_user_api_key') || ''}
                id="user-gemini-key-input"
                className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                type="button"
                disabled={isCheckingKey}
                onClick={async () => {
                  const input = document.getElementById('user-gemini-key-input') as HTMLInputElement;
                  const val = input ? input.value.trim() : '';
                  if (val) {
                    localStorage.setItem('gemini_user_api_key', val);
                  } else {
                    localStorage.removeItem('gemini_user_api_key');
                  }
                  setIsCheckingKey(true);
                  setApiKeyFeedback(null);
                  try {
                    const testUrl = `/api/status?key=${encodeURIComponent(val)}`;
                    const res = await fetch(testUrl);
                    const data = await res.json();
                    if (data.hasApiKey) {
                      setApiKeyFeedback({ msg: 'APIキーの接続確認に成功しました！', isError: false });
                    } else {
                      setApiKeyFeedback({ msg: 'APIキーが無効または未設定です。キーを確認してください。', isError: true });
                    }
                  } catch {
                    setApiKeyFeedback({ msg: 'キーを保存しました。', isError: false });
                  } finally {
                    setIsCheckingKey(false);
                  }
                }}
                className="px-3 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shrink-0 disabled:opacity-50"
              >
                {isCheckingKey ? '確認中...' : '保存＆確認'}
              </button>
            </div>

            {/* Inline Feedback Banner */}
            {apiKeyFeedback && (
              <div className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                apiKeyFeedback.isError
                  ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                  : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              }`}>
                {apiKeyFeedback.isError ? (
                  <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
                <span>{apiKeyFeedback.msg}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>
                {localStorage.getItem('gemini_user_api_key')
                  ? '現在：カスタム設定キーを使用中'
                  : '現在：AI Studio環境のキーを自動適用中'}
              </span>
              {localStorage.getItem('gemini_user_api_key') && (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('gemini_user_api_key');
                    const input = document.getElementById('user-gemini-key-input') as HTMLInputElement;
                    if (input) input.value = '';
                    setApiKeyFeedback({ msg: 'カスタムAPIキーをクリアしました。', isError: false });
                  }}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  キーを削除
                </button>
              )}
            </div>
          </div>

          {/* Gemini Native Voice selection */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              Gemini Live 合成音声 (Prebuilt Voice)
            </label>
            <div className="grid grid-cols-1 gap-2">
              {VOICES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => onUpdateSettings({ ...settings, voiceName: v.id })}
                  className={`flex items-start justify-between p-3 rounded-xl border text-left transition-all ${
                    settings.voiceName === v.id
                      ? 'bg-blue-600/15 border-blue-500/60 shadow-sm'
                      : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{v.label}</span>
                      {settings.voiceName === v.id && (
                        <span className="px-1.5 py-0.2 text-[10px] bg-blue-500 text-white rounded font-bold">
                          選択中
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{v.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Playback Volume */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                通訳音声の再生音量
              </span>
              <span className="font-bold text-slate-300">
                {Math.round(settings.playbackVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.playbackVolume}
              onChange={(e) =>
                onUpdateSettings({ ...settings, playbackVolume: parseFloat(e.target.value) })
              }
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Playback Speed (Pitch-Preserved Time Stretching) */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                生成音声の再生速度 (ピッチ保持)
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 text-xs">
                {(settings.playbackSpeed || 1.0).toFixed(2)}x
              </span>
            </div>
            
            <input
              type="range"
              min="0.75"
              max="1.50"
              step="0.05"
              value={settings.playbackSpeed || 1.0}
              onChange={(e) =>
                onUpdateSettings({ ...settings, playbackSpeed: parseFloat(e.target.value) })
              }
              className="w-full accent-cyan-500 cursor-pointer"
            />

            {/* Quick preset buttons */}
            <div className="flex items-center justify-between gap-1.5 pt-1">
              {[
                { speed: 0.8, label: '0.8x' },
                { speed: 1.0, label: '1.0x (標準)' },
                { speed: 1.15, label: '1.15x' },
                { speed: 1.25, label: '1.25x' },
                { speed: 1.5, label: '1.5x' }
              ].map((p) => {
                const isActive = Math.abs((settings.playbackSpeed || 1.0) - p.speed) < 0.02;
                return (
                  <button
                    key={p.speed}
                    onClick={() =>
                      onUpdateSettings({ ...settings, playbackSpeed: p.speed })
                    }
                    className={`flex-1 py-1 px-1 text-[11px] font-bold rounded-lg border transition-all ${
                      isActive
                        ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              SOLA (Synchronized Overlap-Add) 制御により、声の高さ（ピッチ）を変えずに話速のみを自然に伸縮します。
            </p>
          </div>

          {/* Subtitle Font Size */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-indigo-400" />
              字幕文字サイズ
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'normal', label: '標準' },
                { id: 'large', label: '大 (見やすい)' },
                { id: 'xlarge', label: '特大 (対面推薦)' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() =>
                    onUpdateSettings({ ...settings, fontSize: opt.id as any })
                  }
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    settings.fontSize === opt.id
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mic Sensitivity */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-blue-400" />
                マイク集音ゲイン (感度補正)
              </span>
              <span className="font-bold text-slate-300">
                {Math.round(settings.micSensitivity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.micSensitivity}
              onChange={(e) =>
                onUpdateSettings({ ...settings, micSensitivity: parseFloat(e.target.value) })
              }
              className="w-full accent-blue-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              工場や周囲が騒がしい場所では感度を下げ、静かな部屋では100%以上に設定してください。
            </p>
          </div>

          {/* Microphone & Audio Permission Checker */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                マイク・音声権限と動作テスト
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30 text-[10px]">
                通訳前チェック
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              スマートフォンでの利用時にマイク入力やスピーカー音声が正常に機能するか、事前にテスト・確認できます。
            </p>

            <button
              type="button"
              onClick={() => {
                if (onOpenPermissionModal) {
                  onOpenPermissionModal();
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-blue-200 text-xs font-bold border border-slate-700 transition-colors"
            >
              <Mic className="w-3.5 h-3.5 text-blue-400" />
              <span>マイク・スピーカーの動作テストを開く</span>
            </button>
          </div>

          {/* Smartphone PWA Install Option */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <label className="text-xs font-semibold text-slate-200 block">
              スマートフォンへのアプリ追加
            </label>
            <PWAInstallButton variant="settings" />
          </div>

          {/* App Version & Update Information */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-400" />
                アプリバージョン・更新管理
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[11px] border border-blue-500/30">
                {CURRENT_APP_VERSION}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              アップデートは常に任意です。新しい機能や改善点（Changelog）を確認した上で、更新するか現行のまま使い続けるかを選択できます。
            </p>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenUpdateModal) {
                  onOpenUpdateModal();
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
              <span>更新を確認・何が変わったか（変更履歴）を見る</span>
              {hasUpdate && (
                <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[10px] font-black">
                  更新あり
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-800 bg-slate-900/90">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            設定を保存
          </button>
        </div>
      </div>
    </div>
  );
};
