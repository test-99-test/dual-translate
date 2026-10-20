import React, { useState } from 'react';
import { Sparkles, X, RefreshCw, CheckCircle2, ArrowRight, History, ShieldCheck, Info, FlaskConical } from 'lucide-react';
import { CURRENT_APP_VERSION, VERSION_HISTORY, VersionRelease } from '../types/version';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasUpdate: boolean;
  latestRelease: VersionRelease;
  onApplyUpdate: () => void;
  onDismissUpdate: () => void;
  onCheckForUpdates: (manual?: boolean) => Promise<void>;
  isChecking: boolean;
  checkMessage?: string | null;
  onSimulateNewVersion?: (simulate: boolean) => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  hasUpdate,
  latestRelease,
  onApplyUpdate,
  onDismissUpdate,
  onCheckForUpdates,
  isChecking,
  checkMessage,
  onSimulateNewVersion
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const handleApply = async () => {
    setIsUpdating(true);
    setTimeout(() => {
      onApplyUpdate();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>アプリの更新・新機能情報</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                  {CURRENT_APP_VERSION}
                </span>
              </h2>
              <p className="text-xs text-slate-400">アップデートの確認と変更点（Changelog）</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switch */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 text-xs font-bold">
          <button
            onClick={() => setActiveTab('current')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'current'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{hasUpdate ? '最新アップデート内容' : '現在のバージョン内容'}</span>
            {hasUpdate && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>過去の更新履歴一覧</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          {activeTab === 'current' ? (
            <div className="space-y-4">
              {/* Optional Update Notice Banner */}
              {hasUpdate ? (
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/80 via-indigo-950/60 to-emerald-950/80 border border-blue-500/50 shadow-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-black text-sm text-white">
                      <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                      新しいバージョン {latestRelease.version} が届いています
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{latestRelease.date}</span>
                  </div>
                  <p className="text-slate-200 font-bold text-xs">
                    {latestRelease.title}
                  </p>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-blue-500/30 text-slate-300 text-[11px] leading-relaxed flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <p>
                      <strong>※ アップデートは任意です。</strong>
                      「あとで」を選択すれば、更新せずに現在のバージョンのままでも全く問題なくアプリを引き続きご利用いただけます。
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">最新バージョンを利用中です</div>
                      <div className="text-[11px] text-slate-400">Version {CURRENT_APP_VERSION}（正常稼働中）</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onCheckForUpdates(true)}
                    disabled={isChecking}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                    <span>{isChecking ? '確認中...' : '更新を確認'}</span>
                  </button>
                </div>
              )}

              {/* Status or check feedback */}
              {checkMessage && (
                <div className="p-2.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 text-center font-bold text-xs animate-fade-in">
                  {checkMessage}
                </div>
              )}

              {/* What's Changed Section */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                    <span>何が変わったのか（新機能・変更点）</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {latestRelease.version}
                  </span>
                </div>

                <ul className="space-y-2">
                  {latestRelease.changes.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-slate-300 leading-relaxed text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Data Safety Notice */}
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-slate-400 leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px]">
                  <strong>ユーザーデータの安全保護：</strong>
                  アップデートを実施しても、登録済みの対訳辞書・設定・会話履歴・APIキーは消去されず安全に引き継がれます。
                </p>
              </div>

              {/* Optional Test Simulation Tool for Verification */}
              {onSimulateNewVersion && (
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
                    <span>更新通知の動作確認</span>
                  </span>
                  <button
                    onClick={() => onSimulateNewVersion(!hasUpdate)}
                    className="text-xs text-purple-400 hover:text-purple-300 underline font-bold"
                  >
                    {hasUpdate ? 'テスト通知を解除' : '次期バージョンの更新通知をテスト表示'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Changelog History Tab */
            <div className="space-y-3">
              {VERSION_HISTORY.map((rel) => (
                <div key={rel.version} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-2">
                      <span className="text-blue-400 font-mono text-xs">{rel.version}</span>
                      <span className="text-xs">{rel.title}</span>
                      {rel.isLatest && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          現在
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">{rel.date}</span>
                  </div>
                  <ul className="space-y-1 pl-1">
                    {rel.changes.map((c, i) => (
                      <li key={i} className="text-slate-400 text-[11px] flex items-start gap-1.5">
                        <span className="text-slate-600">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Opt-in Update Buttons */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/80">
          {hasUpdate ? (
            <>
              <button
                onClick={() => {
                  onDismissUpdate();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors text-xs"
              >
                あとで（更新しない）
              </button>
              <button
                onClick={handleApply}
                disabled={isUpdating}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-black shadow-lg shadow-blue-950/50 active:scale-95 transition-all text-xs"
              >
                <span>{isUpdating ? 'アップデート適用中...' : '今すぐアップデート'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-slate-500">任意更新＆Changelog明示対応</span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors text-xs"
              >
                閉じる
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
