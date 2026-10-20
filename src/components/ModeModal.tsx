import React from 'react';
import { X, Briefcase, Factory, MessageCircle, HeartPulse, Plane, Check } from 'lucide-react';
import { TranslationMode, TRANSLATION_MODES } from '../types';

interface ModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: TranslationMode;
  onSelectMode: (mode: TranslationMode) => void;
}

export const ModeModal: React.FC<ModeModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  onSelectMode
}) => {
  if (!isOpen) return null;

  const renderIcon = (id: TranslationMode) => {
    switch (id) {
      case 'factory':
        return <Factory className="w-5 h-5 text-amber-400" />;
      case 'casual':
        return <MessageCircle className="w-5 h-5 text-cyan-400" />;
      case 'medical':
        return <HeartPulse className="w-5 h-5 text-rose-400" />;
      case 'hospitality':
        return <Plane className="w-5 h-5 text-purple-400" />;
      default:
        return <Briefcase className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">通訳スタイル・運用モード設定</h2>
              <p className="text-xs text-slate-400">シーンに応じた語彙やトーンを最適化します</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modes List */}
        <div className="p-6 space-y-2.5 max-h-[70vh] overflow-y-auto">
          {TRANSLATION_MODES.map((mode) => {
            const isSelected = mode.id === currentMode;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  onSelectMode(mode.id);
                  onClose();
                }}
                className={`w-full flex items-start gap-3.5 p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-blue-600/15 border-blue-500/60 shadow-md ring-1 ring-blue-500/30'
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                  {renderIcon(mode.id)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{mode.name}</span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-xs font-bold text-blue-400">
                        <Check className="w-4 h-4" />
                        適用中
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {mode.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-800 bg-slate-900/90">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            完了
          </button>
        </div>
      </div>
    </div>
  );
};
