import React, { useRef, useEffect, useState } from 'react';
import { 
  Play, 
  Square, 
  ArrowLeftRight, 
  Volume2, 
  Copy, 
  Check, 
  Sparkles, 
  Trash2, 
  Mic, 
  MicOff, 
  Send,
  Languages,
  ChevronDown
} from 'lucide-react';
import { Language, SUPPORTED_LANGUAGES, ConversationTurn, TranslationMode, TRANSLATION_MODES } from '../types';
import { AudioVisualizer } from './AudioVisualizer';

interface UnifiedChatViewProps {
  langA: Language;
  langB: Language;
  onSelectLangA: (lang: Language) => void;
  onSelectLangB: (lang: Language) => void;
  onSwapLanguages: () => void;
  currentMode: TranslationMode;
  onOpenModeModal: () => void;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  audioLevel: number;
  history: ConversationTurn[];
  onClearHistory: () => void;
  liveOriginalText: string;
  liveTranslatedText: string;
  isTranslating: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
  onSendCustomText?: (text: string) => void;
}

export const UnifiedChatView: React.FC<UnifiedChatViewProps> = ({
  langA,
  langB,
  onSelectLangA,
  onSelectLangB,
  onSwapLanguages,
  currentMode,
  onOpenModeModal,
  isListening,
  onStartListening,
  onStopListening,
  audioLevel,
  history,
  onClearHistory,
  liveOriginalText,
  liveTranslatedText,
  isTranslating,
  fontSize,
  onSendCustomText
}) => {
  const [openDropdown, setOpenDropdown] = useState<'A' | 'B' | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const modeConfig = TRANSLATION_MODES.find((m) => m.id === currentMode) || TRANSLATION_MODES[0];

  // Auto-scroll chat to bottom when new message arrives
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, liveOriginalText, liveTranslatedText]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReplaySpeech = (text: string, langLocale: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langLocale;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !onSendCustomText) return;
    onSendCustomText(inputText.trim());
    setInputText('');
  };

  const fontClass =
    fontSize === 'xlarge' ? 'text-xl sm:text-2xl' : fontSize === 'large' ? 'text-lg sm:text-xl' : 'text-base';

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden">
      
      {/* 1. TOP DUAL LANGUAGE SWITCHER & MODE BAR */}
      <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-30">
        
        {/* Language 1 ⇄ Language 2 Selector Box */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700/80 shadow-inner">
          {/* Language A Picker */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'A' ? null : 'A')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/60 border border-blue-500/40 hover:border-blue-400 text-blue-200 text-xs sm:text-sm font-bold transition-all"
            >
              <span className="text-base">{langA.flag}</span>
              <span>{langA.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
            </button>

            {openDropdown === 'A' && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                <div className="absolute left-0 top-full mt-1.5 w-52 max-h-60 overflow-y-auto z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">言語1 (話者A)</div>
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        onSelectLangA(l);
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        langA.code === l.code ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{l.flag}</span>
                        <span>{l.name}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Quick Swap Button */}
          <button
            onClick={onSwapLanguages}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 transition-transform active:scale-90"
            title="言語を入れ替える"
          >
            <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Language B Picker */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'B' ? null : 'B')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 hover:border-emerald-400 text-emerald-200 text-xs sm:text-sm font-bold transition-all"
            >
              <span className="text-base">{langB.flag}</span>
              <span>{langB.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
            </button>

            {openDropdown === 'B' && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                <div className="absolute right-0 top-full mt-1.5 w-52 max-h-60 overflow-y-auto z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">言語2 (話者B)</div>
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        onSelectLangB(l);
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        langB.code === l.code ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{l.flag}</span>
                        <span>{l.name}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Translation Mode & Clear History */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenModeModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{modeConfig.name}</span>
          </button>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors"
              title="チャット履歴を消去"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. UNIFIED CHAT CONVERSATION TIMELINE */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {history.length === 0 && !liveOriginalText && !liveTranslatedText ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-center text-slate-400">
              <Languages className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-300">リアルタイム双方向チャット通訳</h3>
              <p className="text-xs text-slate-500 max-w-md mt-1 leading-relaxed">
                下の「通訳スタート」ボタンを押すと常時リスニングが開始されます。どちらの言語で話しても、話した言葉（原文）と相手の言語への翻訳が画面上にリアルタイムで表示され、音声で返答します。
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-400">
              <span>{langA.flag} {langA.name}</span>
              <span className="text-slate-600">⇄</span>
              <span>{langB.flag} {langB.name}</span>
            </div>
          </div>
        ) : (
          <>
            {history.map((turn) => {
              const isSpeakerA = turn.speaker === 'A';
              const sourceLangObj = isSpeakerA ? langA : langB;
              const targetLangObj = isSpeakerA ? langB : langA;

              return (
                <div
                  key={turn.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isSpeakerA
                      ? 'bg-blue-950/20 border-blue-500/30 mr-4 sm:mr-12'
                      : 'bg-emerald-950/20 border-emerald-500/30 ml-4 sm:ml-12'
                  }`}
                >
                  {/* Top Bar of Bubble: Speaker and Languages */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[11px] border ${
                          isSpeakerA
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {isSpeakerA ? '話者 A (あなた)' : '話者 B (お相手)'}
                      </span>
                      <span className="text-slate-400 text-[11px] flex items-center gap-1">
                        <span>{sourceLangObj.flag} {sourceLangObj.name}</span>
                        <span>➔</span>
                        <span>{targetLangObj.flag} {targetLangObj.name}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <span>{new Date(turn.timestamp).toLocaleTimeString('ja-JP')}</span>
                      <button
                        onClick={() => handleCopy(turn.id, `${turn.originalText ? turn.originalText + '\n' : ''}${turn.text}`)}
                        className="p-1 hover:text-slate-200 transition-colors"
                        title="コピー"
                      >
                        {copiedId === turn.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 1. Spoken Original Language (原文) */}
                  {turn.originalText && (
                    <div className="mb-2.5 pb-2.5 border-b border-slate-800/80">
                      <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                        <span>🗣️ 原文 ({sourceLangObj.name}):</span>
                      </div>
                      <p className="text-slate-300 text-sm sm:text-base leading-relaxed pl-1 font-medium">
                        {turn.originalText}
                      </p>
                    </div>
                  )}

                  {/* 2. Translated Language (翻訳) */}
                  <div>
                    <div className="text-[11px] font-bold text-emerald-400 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span>🌐 翻訳 ({targetLangObj.name}):</span>
                      </span>
                      <button
                        onClick={() => handleReplaySpeech(turn.text, targetLangObj.locale)}
                        className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-emerald-300 transition-colors p-0.5"
                        title="翻訳音声を再再生"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>音声再生</span>
                      </button>
                    </div>
                    <p className={`font-bold text-white leading-relaxed pl-1 tracking-wide ${fontClass}`}>
                      {turn.text}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* LIVE ACTIVE TURN (IN PROGRESS) */}
            {(liveOriginalText || liveTranslatedText || isTranslating) && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-lg animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      リアルタイム通訳中...
                    </span>
                  </div>
                </div>

                {liveOriginalText && (
                  <div className="mb-2 pb-2 border-b border-slate-800">
                    <div className="text-[11px] font-semibold text-slate-400 mb-0.5">
                      🗣️ 聞き取った音声 (原文):
                    </div>
                    <p className="text-slate-300 text-sm font-medium">{liveOriginalText}</p>
                  </div>
                )}

                {liveTranslatedText ? (
                  <div>
                    <div className="text-[11px] font-bold text-cyan-400 mb-0.5">
                      🌐 翻訳結果:
                    </div>
                    <p className={`font-bold text-white ${fontClass}`}>{liveTranslatedText}</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-slate-400 py-1">
                    <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span>Gemini Live が翻訳音声を生成しています...</span>
                  </div>
                )}
              </div>
            )}

            <div ref={chatBottomRef} />
          </>
        )}
      </div>

      {/* 3. STICKY BOTTOM CONTROL BAR: START / STOP CONTINUOUS LISTENING */}
      <div className="p-3 sm:p-4 bg-slate-950/90 border-t border-slate-800 space-y-3 z-30">
        
        {/* Visualizer & Status */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isListening ? 'bg-red-500 animate-ping' : 'bg-slate-600'
              }`}
            />
            <span className="text-xs font-bold text-slate-300">
              {isListening
                ? '常時リスニング中（ストップを押すまで話した言葉を自動翻訳します）'
                : '停止中（スタートを押すとリスニングを開始します）'}
            </span>
          </div>

          {/* Audio Visualizer */}
          <div className="w-36 sm:w-48">
            <AudioVisualizer
              level={audioLevel}
              isActive={isListening}
              colorClass={isListening ? 'bg-red-400' : 'bg-slate-600'}
              barCount={14}
            />
          </div>
        </div>

        {/* Master START / STOP Button */}
        <div className="flex items-center gap-3">
          {!isListening ? (
            <button
              onClick={onStartListening}
              className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-black text-sm sm:text-base text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 shadow-xl shadow-emerald-950/50 active:scale-98 transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>通訳スタート (START)</span>
            </button>
          ) : (
            <button
              onClick={onStopListening}
              className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-black text-sm sm:text-base text-white bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-500 hover:to-pink-500 shadow-xl shadow-red-950/50 ring-4 ring-red-500/30 active:scale-98 transition-all animate-pulse"
            >
              <Square className="w-5 h-5 fill-current" />
              <span>通訳ストップ (STOP)</span>
            </button>
          )}

          {/* Quick text submit for testing / typing */}
          {onSendCustomText && (
            <form onSubmit={handleSubmitText} className="hidden sm:flex items-center gap-1.5 flex-1 max-w-xs">
              <input
                type="text"
                placeholder="テキスト入力でも翻訳可能..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700"
                title="送信"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};
