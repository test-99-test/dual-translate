import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Share, 
  PlusSquare, 
  Check, 
  Copy, 
  ExternalLink, 
  AlertTriangle, 
  Monitor, 
  Download, 
  Sparkles,
  Zap,
  Maximize2
} from 'lucide-react';
import { PWAInstallState } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  pwaState: PWAInstallState;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  pwaState
}) => {
  const {
    isIOS,
    isAndroid,
    isInAppBrowser,
    inAppBrowserName,
    hasNativePrompt,
    isInstalled,
    promptInstall
  } = pwaState;

  // Initial active tab based on detected device
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'desktop'>('ios');
  const [copied, setCopied] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (isAndroid) {
      setActiveTab('android');
    } else if (isIOS) {
      setActiveTab('ios');
    } else {
      setActiveTab('desktop');
    }
  }, [isAndroid, isIOS, isOpen]);

  if (!isOpen) return null;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const handleDirectInstall = async () => {
    setIsInstalling(true);
    const outcome = await promptInstall();
    setIsInstalling(false);
    if (outcome === 'accepted') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>スマホにアプリとしてインストール</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                  PWA対応
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                ホーム画面に追加して全画面で高速に通訳を利用できます
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/20 px-4 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'ios'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>iPhone / iPad</span>
            {isIOS && <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
          </button>

          <button
            onClick={() => setActiveTab('android')}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'android'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Android (Chrome)</span>
            {isAndroid && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
          </button>

          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'desktop'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/40 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>PC / Mac</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* In-App Browser Warning Alert */}
          {isInAppBrowser && (
            <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{inAppBrowserName} のアプリ内ブラウザで開いています</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-200/90">
                LINEやSNSの内部ブラウザからはホーム画面へのアプリ追加が制限されています。標準ブラウザ（Safari または Chrome）でお開きください。
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={handleCopyUrl}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-slate-950" />
                      <span>URLをコピーしました！</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>URLをコピーしてSafari/Chromeで開く</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Already installed banner */}
          {isInstalled && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 font-bold">
              <Check className="w-4 h-4 shrink-0" />
              <span>本端末にはすでにホーム画面アプリとしてインストールされています</span>
            </div>
          )}

          {/* Tab 1: iOS Safari Guide */}
          {activeTab === 'ios' && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-[11px]">
                <span className="font-bold text-blue-300">💡 iPhoneでの事前確認：</span>
                必ず標準の <span className="font-bold underline">Safari</span> でこのページを開いてください（Chrome for iOSやLINEアプリ内からは追加できません）。
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3.5">
                {/* Step 1 */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Safari下部の「共有ボタン」をタップ</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700">
                        <Share className="w-3 h-3 mr-1" />
                        共有
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      画面の一番下にある四角から矢印が飛び出たアイコンを押します。
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3 pt-3 border-t border-slate-800/80">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>メニューから「ホーム画面に追加」をタップ</span>
                      <PlusSquare className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      共有メニューを少し下にスクロールすると「ホーム画面に追加」があります。
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3 pt-3 border-t border-slate-800/80">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>右上の「追加」をタップして完了</span>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      ホーム画面に「Live通訳」アイコンが追加され、ネイティブアプリのように全画面で起動します。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Android Guide */}
          {activeTab === 'android' && (
            <div className="space-y-3.5">
              {/* If browser supports 1-click install prompt */}
              {hasNativePrompt && (
                <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 space-y-2.5">
                  <div className="font-bold text-emerald-300 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>ワンタップでインストール可能です！</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    お使いのブラウザは直接インストールに対応しています。下のボタンを押すと確認ダイアログが表示されます。
                  </p>
                  <button
                    onClick={handleDirectInstall}
                    disabled={isInstalling}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-950/40 active:scale-98 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isInstalling ? 'インストール中...' : '今すぐスマホにインストール'}</span>
                  </button>
                </div>
              )}

              {/* Manual Android Chrome Instructions */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3.5">
                <div className="font-bold text-slate-200 text-xs border-b border-slate-800 pb-2">
                  Chromeでの手動追加手順
                </div>

                {/* Step 1 */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-white">
                      Chrome右上のメニュー「︙（3点リーダー）」をタップ
                    </div>
                    <p className="text-[11px] text-slate-400">
                      画面右上の縦に並んだ3つの点（メニュー）を押します。
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3 pt-3 border-t border-slate-800/80">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>「アプリをインストール」または「ホーム画面に追加」をタップ</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      メニュー内にある「アプリをインストール」（または「ホーム画面に追加」）を選択します。
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3 pt-3 border-t border-slate-800/80">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>「インストール」をタップして完了</span>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      ダイアログで「インストール」を押すと、Androidホーム画面にアプリアイコンが登録されます。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Desktop Guide */}
          {activeTab === 'desktop' && (
            <div className="space-y-3.5">
              {hasNativePrompt && (
                <div className="p-4 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 space-y-2.5">
                  <div className="font-bold text-indigo-300 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-400" />
                    <span>PCアプリとしてインストール可能です</span>
                  </div>
                  <button
                    onClick={handleDirectInstall}
                    disabled={isInstalling}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>PCにアプリとしてインストール</span>
                  </button>
                </div>
              )}

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="font-bold text-slate-200 text-xs">Chrome / Edge (Windows & Mac)</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  アドレスバー（URL入力欄）の右側に表示される「⊕ インストール」アイコンをクリックするか、メニュー「︙」＞「キャスト・保存・共有」＞「アプリとしてインストール」を選択してください。
                </p>
              </div>
            </div>
          )}

          {/* PWA Benefits */}
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>インストールすると便利になること</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>全画面表示（アドレスバーが隠れ広々）</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>ホーム画面から1タップで即時起動</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={handleCopyUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>URLコピー完了</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>アプリのURLをコピー</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-md"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
