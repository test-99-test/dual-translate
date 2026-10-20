import React from 'react';
import { 
  Sparkles, 
  BookOpen, 
  History, 
  Settings, 
  FileCode, 
  HelpCircle,
  Briefcase,
  Mic
} from 'lucide-react';
import { TranslationMode, TRANSLATION_MODES } from '../types';
import { CURRENT_APP_VERSION } from '../types/version';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onOpenGlossary: () => void;
  glossaryCount: number;
  onOpenHistory: () => void;
  historyCount: number;
  onOpenSettings: () => void;
  onOpenExport: () => void;
  onOpenModeModal: () => void;
  currentMode: TranslationMode;
  onOpenHelp: () => void;
  onOpenUpdateModal?: () => void;
  onOpenPermissionModal?: () => void;
  hasUpdate?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenGlossary,
  glossaryCount,
  onOpenHistory,
  historyCount,
  onOpenSettings,
  onOpenExport,
  onOpenModeModal,
  currentMode,
  onOpenHelp,
  onOpenUpdateModal,
  onOpenPermissionModal,
  hasUpdate = false
}) => {
  const modeConfig = TRANSLATION_MODES.find((m) => m.id === currentMode) || TRANSLATION_MODES[0];

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md z-30">
      {/* Brand & Live Indicator */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 shadow-md">
          <Sparkles className="w-5 h-5 text-white" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              <span>Gemini Live</span>
              <button
                onClick={onOpenUpdateModal}
                title="バージョン情報・更新履歴を見る"
                className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-bold border border-blue-500/30 transition-colors cursor-pointer"
              >
                {CURRENT_APP_VERSION}
              </button>
            </h1>

            {/* If update is available, show prominent optional update badge */}
            {hasUpdate && (
              <button
                onClick={onOpenUpdateModal}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold animate-pulse hover:bg-amber-500/30 transition-colors"
                title="新しいバージョンが利用可能です（タップして変更点を確認）"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>更新あり</span>
              </button>
            )}

            <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              API連携済
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            双方向リアルタイム音声通訳（Gemini Live WebSocket / 24kHz Native Audio）
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Smartphone Install Button */}
        <PWAInstallButton variant="header" />

        {/* Mode Selector */}
        <button
          onClick={onOpenModeModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          title="通訳モード切替"
        >
          <Briefcase className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden md:inline">{modeConfig.name}</span>
        </button>

        {/* Glossary Modal Button */}
        <button
          onClick={onOpenGlossary}
          className="relative flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          title="カスタム用語集・対訳辞書"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">用語辞書</span>
          {glossaryCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950">
              {glossaryCount}
            </span>
          )}
        </button>

        {/* History Modal Button */}
        <button
          onClick={onOpenHistory}
          className="relative flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          title="会話履歴・ログのエクスポート"
        >
          <History className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">履歴</span>
          {historyCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-emerald-500 text-slate-950">
              {historyCount}
            </span>
          )}
        </button>

        {/* Standalone HTML Export */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-blue-700/70 to-indigo-700/70 hover:from-blue-600 hover:to-indigo-600 text-white border border-blue-500/40 shadow-sm transition-all"
          title="単一HTMLファイル出力（オフライン・GitHub Pages配布用）"
        >
          <FileCode className="w-3.5 h-3.5 text-blue-200" />
          <span className="hidden md:inline">HTML出力</span>
        </button>

        {/* Mic & Audio Permission Test Button */}
        <button
          onClick={onOpenPermissionModal}
          className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700 text-blue-400 hover:text-blue-300 border border-slate-700 transition-colors"
          title="マイク・音声の許可と事前テスト"
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          title="環境・音声設定"
        >
          <Settings className="w-4 h-4 text-slate-300" />
        </button>

        {/* Help Guide */}
        <button
          onClick={onOpenHelp}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
          title="対面通訳の使い方"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
