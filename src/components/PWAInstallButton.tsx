import React, { useState } from 'react';
import { Smartphone, Download, Check, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'settings' | 'compact';
  onOpenModal?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  variant = 'header',
  onOpenModal
}) => {
  const pwaState = usePWAInstall();
  const { isInstalled, hasNativePrompt, promptInstall } = pwaState;
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already running as standalone installed app, show badge in settings, otherwise hide
  if (isInstalled) {
    if (variant === 'settings') {
      return (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>ホーム画面にインストール済み（全画面モードで動作中）</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (onOpenModal) {
      onOpenModal();
      return;
    }

    if (hasNativePrompt) {
      const outcome = await promptInstall();
      if (outcome === 'guide') {
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  const renderContent = () => {
    if (variant === 'settings') {
      return (
        <button
          onClick={handleInstallClick}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-md active:scale-98 cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <div className="p-1 rounded-lg bg-white/20">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <div>スマホにアプリとしてインストール</div>
              <div className="text-[10px] font-normal text-blue-200">
                ホーム画面に追加して全画面で高速に通訳（PWA）
              </div>
            </div>
          </span>
          <Download className="w-4 h-4 text-blue-200" />
        </button>
      );
    }

    if (variant === 'banner') {
      return (
        <div className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/40 flex items-center justify-between gap-3 text-xs shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>スマホのホーム画面に追加可能</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-300 font-bold">
                  おすすめ
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                アプリ化するとアドレスバーが隠れ、対面通訳が全画面で快適に使えます
              </div>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>インストール</span>
          </button>
        </div>
      );
    }

    if (variant === 'compact') {
      return (
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow border border-blue-400/30 active:scale-95 transition-all cursor-pointer"
          title="スマホのホーム画面にインストール"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>インストール</span>
        </button>
      );
    }

    // Default 'header' variant
    return (
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md border border-blue-400/40 active:scale-95 transition-all cursor-pointer shrink-0"
        title="スマホのホーム画面にアプリとしてインストール"
      >
        <Smartphone className="w-3.5 h-3.5 text-blue-200" />
        <span className="hidden sm:inline">スマホにインストール</span>
        <span className="sm:hidden">インストール</span>
      </button>
    );
  };

  return (
    <>
      {renderContent()}

      <PWAInstallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pwaState={pwaState}
      />
    </>
  );
};
