import React from 'react';
import { ArrowLeftRight, Activity, Radio, RefreshCw, Briefcase, Factory, MessageCircle, HeartPulse, Plane } from 'lucide-react';
import { ConnectionStatus, TranslationMode, TRANSLATION_MODES } from '../types';

interface CentralControlProps {
  onSwapLanguages: () => void;
  status: ConnectionStatus;
  onReconnect: () => void;
  currentMode: TranslationMode;
  onOpenModeModal: () => void;
  autoListen: boolean;
  onToggleAutoListen: () => void;
}

export const CentralControl: React.FC<CentralControlProps> = ({
  onSwapLanguages,
  status,
  onReconnect,
  currentMode,
  onOpenModeModal,
  autoListen,
  onToggleAutoListen
}) => {
  const modeConfig = TRANSLATION_MODES.find((m) => m.id === currentMode) || TRANSLATION_MODES[0];

  const renderModeIcon = () => {
    switch (currentMode) {
      case 'factory':
        return <Factory className="w-3.5 h-3.5 text-amber-400" />;
      case 'casual':
        return <MessageCircle className="w-3.5 h-3.5 text-cyan-400" />;
      case 'medical':
        return <HeartPulse className="w-3.5 h-3.5 text-rose-400" />;
      case 'hospitality':
        return <Plane className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Briefcase className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live接続中
          </span>
        );
      case 'connecting':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded-full">
            <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
            接続準備中...
          </span>
        );
      case 'error':
        return (
          <button
            onClick={onReconnect}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-red-300 bg-red-500/15 border border-red-500/30 rounded-full hover:bg-red-500/25 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-red-400" />
            エラー (再接続)
          </button>
        );
      default:
        return (
          <button
            onClick={onReconnect}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-400 bg-slate-800/80 border border-slate-700 rounded-full hover:text-slate-200 transition-colors"
          >
            <Activity className="w-3 h-3" />
            未接続 (タップで接続)
          </button>
        );
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl backdrop-blur-md">
      {/* Mode trigger */}
      <button
        onClick={onOpenModeModal}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 text-xs font-medium text-slate-200 transition-colors"
      >
        {renderModeIcon()}
        <span>{modeConfig.name}</span>
      </button>

      {/* Language swap center button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSwapLanguages}
          className="group flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600/80 to-emerald-600/80 hover:from-blue-500 hover:to-emerald-500 text-white text-xs font-bold rounded-xl shadow-md border border-slate-700 transition-all active:scale-95"
          title="左右の言語を即時入れ替える"
        >
          <ArrowLeftRight className="w-4 h-4 transition-transform group-hover:rotate-180 duration-300" />
          <span className="hidden sm:inline">言語スワップ</span>
        </button>

        {/* Continuous / Auto Listen Mode Toggle */}
        <button
          onClick={onToggleAutoListen}
          title={autoListen ? "両者常時リスニング有効" : "プッシュツートーク（ボタン押下時のみ集音）"}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
            autoListen
              ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 shadow-sm'
              : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-300'
          }`}
        >
          <Radio className={`w-3.5 h-3.5 ${autoListen ? 'text-blue-400 animate-pulse' : ''}`} />
          <span className="hidden md:inline">{autoListen ? '常時リスニング' : '手動通話'}</span>
        </button>
      </div>

      {/* Connection status */}
      <div className="flex items-center gap-2">
        {getStatusBadge()}
      </div>
    </div>
  );
};
