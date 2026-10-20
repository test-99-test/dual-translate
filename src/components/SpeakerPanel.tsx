import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  RotateCcw, 
  Volume2, 
  Languages, 
  Copy, 
  Check, 
  Send,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Language, SUPPORTED_LANGUAGES } from '../types';
import { AudioVisualizer } from './AudioVisualizer';

interface SpeakerPanelProps {
  speaker: 'A' | 'B';
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  isMicActive: boolean;
  onToggleMic: () => void;
  audioLevel: number;
  subtitle: string;
  isTranslating: boolean;
  partnerSpeaking: boolean;
  isReversed?: boolean;
  onToggleReverse?: () => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  onSendText?: (text: string) => void;
}

export const SpeakerPanel: React.FC<SpeakerPanelProps> = ({
  speaker,
  language,
  onSelectLanguage,
  isMicActive,
  onToggleMic,
  audioLevel,
  subtitle,
  isTranslating,
  partnerSpeaking,
  isReversed = false,
  onToggleReverse,
  fontSize,
  onSendText
}) => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inputText, setInputText] = useState('');
  const [showInput, setShowInput] = useState(false);

  const isSpeakerA = speaker === 'A';
  const theme = isSpeakerA
    ? {
        accent: 'blue',
        border: 'border-blue-500/30',
        bgGlow: 'bg-blue-600/10',
        textAccent: 'text-blue-400',
        badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        btnBg: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25',
        activeRing: 'ring-4 ring-blue-500/40 animate-pulse',
        visClass: 'bg-blue-400',
        title: '話者 A (あなた)',
        titleSub: 'Speaker A'
      }
    : {
        accent: 'emerald',
        border: 'border-emerald-500/30',
        bgGlow: 'bg-emerald-600/10',
        textAccent: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        btnBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/25',
        activeRing: 'ring-4 ring-emerald-500/40 animate-pulse',
        visClass: 'bg-emerald-400',
        title: '話者 B (お相手)',
        titleSub: 'Speaker B'
      };

  const handleCopySubtitle = () => {
    if (!subtitle) return;
    navigator.clipboard.writeText(subtitle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendCustomText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !onSendText) return;
    onSendText(inputText.trim());
    setInputText('');
    setShowInput(false);
  };

  const fontClass =
    fontSize === 'xlarge'
      ? 'text-2xl sm:text-3xl'
      : fontSize === 'large'
      ? 'text-xl sm:text-2xl'
      : 'text-base sm:text-lg';

  return (
    <div
      className={`relative flex flex-col justify-between h-full p-4 sm:p-5 rounded-2xl bg-slate-900/80 border ${theme.border} backdrop-blur-md overflow-hidden transition-all duration-300 ${
        isReversed ? 'rotate-180' : ''
      }`}
    >
      {/* Background glow */}
      <div className={`absolute -right-16 -top-16 w-56 h-56 ${theme.bgGlow} rounded-full blur-3xl pointer-events-none`} />

      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${theme.badgeBg}`}>
            {theme.title}
          </span>
          {partnerSpeaking && (
            <span className="flex items-center gap-1 px-2 py-0.5 text-xs text-amber-300 bg-amber-500/20 border border-amber-500/30 rounded-full animate-pulse">
              <Volume2 className="w-3 h-3" />
              相手発話中
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Face-to-Face 180° rotation toggle (Speaker B only) */}
          {speaker === 'B' && onToggleReverse && (
            <button
              onClick={onToggleReverse}
              title="対面反転表示（スマホを挟んで向かい合って座るときに向きを180度反転）"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isReversed
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isReversed ? 'rotate-180' : ''}`} />
              <span className="hidden sm:inline">対面反転</span>
            </button>
          )}

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 hover:border-slate-600 text-slate-200 text-sm font-medium transition-all"
            >
              <span className="text-base">{language.flag}</span>
              <span>{language.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isLangOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsLangOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 w-52 max-h-64 overflow-y-auto z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5">
                  <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    対応言語の選択
                  </div>
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        onSelectLanguage(l);
                        setIsLangOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                        language.code === l.code
                          ? 'bg-slate-800 text-white font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base">{l.flag}</span>
                        <span>{l.name}</span>
                      </span>
                      <span className="text-[11px] text-slate-400">{l.nativeName}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Subtitle Display Area */}
      <div className="relative flex-1 flex flex-col justify-center my-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 min-h-[140px] z-10">
        {subtitle ? (
          <div className="flex flex-col justify-between h-full">
            <div className="overflow-y-auto max-h-[160px] pr-1">
              <p className={`font-semibold leading-relaxed tracking-wide text-slate-100 ${fontClass}`}>
                {subtitle}
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800/60 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>翻訳完了 ({language.name})</span>
              </span>
              <button
                onClick={handleCopySubtitle}
                className="flex items-center gap-1 hover:text-slate-200 transition-colors p-1"
                title="字幕をコピー"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'コピー済み' : 'コピー'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-6 text-slate-500">
            {isMicActive ? (
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-1.5 items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-sm font-medium text-slate-300">
                    マイク集音中... 音声を聞き取っています
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {language.name}で話しかけてください
                </p>
              </div>
            ) : partnerSpeaking ? (
              <div className="flex flex-col items-center gap-2">
                <Volume2 className="w-6 h-6 text-amber-400 animate-bounce" />
                <span className="text-sm font-medium text-amber-300">
                  相手の話を同時通訳しています...
                </span>
              </div>
            ) : isTranslating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-slate-300">通訳音声を生成中...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <Languages className="w-7 h-7 text-slate-600 mb-1" />
                <p className="text-sm font-medium text-slate-400">
                  マイクを押して発話を開始
                </p>
                <p className="text-xs text-slate-600">
                  {language.name} ➔ 相手の言語へ低遅延翻訳
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Optional Quick Text Input */}
      {showInput && (
        <form onSubmit={handleSendCustomText} className="mb-3 flex gap-2 z-10">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`${language.name}でテキスト入力...`}
            className="flex-1 px-3 py-1.5 text-xs bg-slate-800/90 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-500 flex items-center gap-1 font-medium"
          >
            <Send className="w-3 h-3" />
            送信
          </button>
        </form>
      )}

      {/* Bottom Controls Row: Visualizer & Mic Button */}
      <div className="flex items-center justify-between gap-3 z-10 pt-1">
        {/* Audio Visualizer */}
        <div className="flex-1">
          <AudioVisualizer
            level={audioLevel}
            isActive={isMicActive || partnerSpeaking}
            colorClass={theme.visClass}
            barCount={20}
          />
        </div>

        {/* Text Input Toggle */}
        {onSendText && (
          <button
            onClick={() => setShowInput(!showInput)}
            className={`p-2.5 rounded-xl border text-xs transition-colors ${
              showInput
                ? 'bg-slate-700 text-white border-slate-600'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/80 hover:text-slate-200'
            }`}
            title="テキスト入力モード切替"
          >
            <Send className="w-4 h-4" />
          </button>
        )}

        {/* Big Mic Button */}
        <button
          onClick={onToggleMic}
          className={`relative group flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all transform active:scale-95 shadow-lg ${
            isMicActive
              ? 'bg-red-500 text-white shadow-red-500/40 ring-4 ring-red-500/30'
              : `${theme.btnBg} shadow-md`
          }`}
          title={isMicActive ? 'マイクを停止' : 'マイクを起動して話す'}
        >
          {isMicActive ? (
            <>
              <div className="relative">
                <MicOff className="w-5 h-5 text-white animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                </span>
              </div>
              <span className="text-sm tracking-wide">通話中</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span className="text-sm tracking-wide">話す</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
