import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mic, 
  Volume2, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Smartphone, 
  RefreshCw, 
  ShieldCheck, 
  ExternalLink,
  VolumeX,
  Radio
} from 'lucide-react';
import { useAudioPermissions } from '../hooks/useAudioPermissions';

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReason?: string;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
  isOpen,
  onClose,
  initialReason
}) => {
  const {
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
  } = useAudioPermissions();

  const [activeGuideTab, setActiveGuideTab] = useState<'ios' | 'android' | 'pc'>('ios');

  useEffect(() => {
    if (isIOS) {
      setActiveGuideTab('ios');
    } else if (isAndroid) {
      setActiveGuideTab('android');
    } else {
      setActiveGuideTab('pc');
    }
  }, [isIOS, isAndroid]);

  useEffect(() => {
    if (isOpen) {
      checkPermission();
    } else {
      stopMicTest();
    }
  }, [isOpen, checkPermission, stopMicTest]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>マイク・音声の許可と事前テスト</span>
              </h2>
              <p className="text-xs text-slate-400">スマホでの双方向通訳に必要な権限の確認</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Reason Alert (if triggered by mic failure) */}
          {initialReason && (
            <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5 leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300">マイクの準備が必要です</p>
                <p className="mt-0.5">{initialReason}</p>
              </div>
            </div>
          )}

          {/* How permissions work on Smartphone Web / PWA */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-400" />
              スマホアプリ・ブラウザの許可ルールについて
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              スマートフォンのブラウザ（SafariやChrome）およびホーム画面に追加したPWAアプリでは、
              プライバシー保護のため、<span className="text-blue-300 font-bold">画面のボタン（話す・テスト）をタップした初回</span>に
              OS標準の「マイク使用の許可」ダイアログが表示されます。
            </p>
          </div>

          {/* Test 1: Microphone Permission & Live Level */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">マイク権限と集音テスト</h4>
                  <p className="text-[11px] text-slate-400">マイクが音声を拾えているか確認します</p>
                </div>
              </div>

              {/* Status Badge */}
              {permissionStatus === 'granted' || micTestSuccess ? (
                <span className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  許可済み
                </span>
              ) : permissionStatus === 'denied' ? (
                <span className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-rose-300 bg-rose-500/20 border border-rose-500/30 rounded-full">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  ブロック中
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 rounded-full">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  未テスト
                </span>
              )}
            </div>

            {/* Live Volume Meter if testing */}
            {isTestingMic && (
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    マイク入力検知中（何か声を出してください）
                  </span>
                  <span className="font-mono font-bold text-blue-400">{micLevel}%</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-400 rounded-full transition-all duration-75"
                    style={{ width: `${micLevel}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {micErrorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {micErrorMessage}
              </div>
            )}

            {/* Success Message */}
            {micTestSuccess && !isTestingMic && (
              <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>マイクへのアクセスが確認できました。通訳を開始できます！</span>
              </div>
            )}

            {/* Action Button */}
            <div>
              {isTestingMic ? (
                <button
                  type="button"
                  onClick={stopMicTest}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-600 transition-colors"
                >
                  マイクテストを終了する
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startMicTest}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
                >
                  <Mic className="w-4 h-4" />
                  <span>{micTestSuccess ? 'マイクを再テストする' : 'マイクの許可ダイアログを表示・集音テスト'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Test 2: Speaker & Sound Output Test */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">スピーカー音声再生テスト</h4>
                  <p className="text-[11px] text-slate-400">Geminiの通訳音声が聞こえるか確認します</p>
                </div>
              </div>

              {tonePlayedSuccess && (
                <span className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  再生テスト完了
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={playTestTone}
              disabled={isPlayingTestTone}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold border border-slate-700 hover:border-emerald-500/40 transition-all active:scale-95 disabled:opacity-50"
            >
              {isPlayingTestTone ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>テスト音を再生中... (ピロリン♪)</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>テストチャイム音を鳴らす</span>
                </>
              )}
            </button>

            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <VolumeX className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <p>
                <strong className="text-slate-300">音が聞こえない場合:</strong> iPhoneやスマホ側面の<span className="text-amber-300 font-bold">「消音スイッチ（マナーモード）」</span>がオンになっているとWebブラウザの音声が消音される場合があります。解除して音量を上げてください。
              </p>
            </div>
          </div>

          {/* Troubleshooting Guide Tabs */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              もし許可ダイアログが出ない・拒否してしまった場合の手順
            </h4>

            {/* OS Tabs */}
            <div className="flex gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveGuideTab('ios')}
                className={`flex-1 py-1.5 px-2 rounded-md text-xs font-bold transition-all ${
                  activeGuideTab === 'ios'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                iPhone (iOS / Safari)
              </button>
              <button
                type="button"
                onClick={() => setActiveGuideTab('android')}
                className={`flex-1 py-1.5 px-2 rounded-md text-xs font-bold transition-all ${
                  activeGuideTab === 'android'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Android (Chrome)
              </button>
              <button
                type="button"
                onClick={() => setActiveGuideTab('pc')}
                className={`flex-1 py-1.5 px-2 rounded-md text-xs font-bold transition-all ${
                  activeGuideTab === 'pc'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                パソコン (Chrome/Edge)
              </button>
            </div>

            {/* iOS Guide */}
            {activeGuideTab === 'ios' && (
              <ol className="text-xs text-slate-300 space-y-2.5 list-decimal list-inside pl-1 leading-relaxed">
                <li>
                  iPhoneのホーム画面で<strong className="text-white">「設定」</strong>アプリを開きます。
                </li>
                <li>
                  一覧から<strong className="text-blue-300">「Safari」</strong>（または「プライバシーとセキュリティ」➔「マイク」）をタップします。
                </li>
                <li>
                  <strong className="text-white">「マイク」</strong>の項目をタップし、<strong className="text-emerald-300">「許可」</strong>または「確認」に設定します。
                </li>
                <li>
                  ホーム画面に追加したPWAアプリの場合は、このアプリ画面を上から下にスワイプするか再起動すると設定が反映されます。
                </li>
              </ol>
            )}

            {/* Android Guide */}
            {activeGuideTab === 'android' && (
              <ol className="text-xs text-slate-300 space-y-2.5 list-decimal list-inside pl-1 leading-relaxed">
                <li>
                  Chromeのアドレスバー左側にある<strong className="text-white">「設定 / 鍵 / 調整アイコン」</strong>をタップします。
                </li>
                <li>
                  <strong className="text-blue-300">「権限」</strong>または<strong className="text-white">「マイク」</strong>をタップします。
                </li>
                <li>
                  マイクの権限を<strong className="text-emerald-300">「許可」</strong>または「アプリ使用時のみ許可」に変更します。
                </li>
                <li>
                  ページを再読み込み（リロード）するとすぐに使えるようになります。
                </li>
              </ol>
            )}

            {/* PC Guide */}
            {activeGuideTab === 'pc' && (
              <ol className="text-xs text-slate-300 space-y-2.5 list-decimal list-inside pl-1 leading-relaxed">
                <li>
                  ブラウザのURL入力欄の左側にある<strong className="text-white">「南京錠（またはサイト情報）」</strong>アイコンをクリックします。
                </li>
                <li>
                  <strong className="text-white">「マイク」</strong>のトグルスイッチを<strong className="text-emerald-300">「オン（許可）」</strong>にします。
                </li>
                <li>
                  「再読み込み」ボタンを押してページを更新します。
                </li>
              </ol>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-900/90">
          <button
            type="button"
            onClick={checkPermission}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>状態を再確認</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-md"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
