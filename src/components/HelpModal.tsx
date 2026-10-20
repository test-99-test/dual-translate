import React from 'react';
import { X, HelpCircle, Smartphone, Mic, Sparkles, RotateCcw, Volume2, ShieldCheck } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">対面通訳アプリ 使い方ガイド</h2>
              <p className="text-xs text-slate-400">Gemini Live 双方向リアルタイム通訳の使い方</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[70vh] text-xs leading-relaxed text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="font-bold text-white flex items-center gap-1.5 text-sm">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              1. 机の上に対面で平置きして使用
            </div>
            <p>
              スマートフォンを自分とお相手の間の机に平置きします。上部（相手側エリア）の
              <span className="font-bold text-emerald-300">「対面反転」</span>
              ボタンを押すと、お相手側の画面が180度反転し、向かい合って座っている相手から正対して文字やボタンが見やすくなります。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="font-bold text-white flex items-center gap-1.5 text-sm">
              <Mic className="w-4 h-4 text-blue-400" />
              2. ボタンを押して発話（プッシュ通話）
            </div>
            <p>
              自分が話すときは自分の青色「話す」ボタンを押します。お相手が話すときは緑色の「話す」ボタンを押します。マイク入力はブラウザ標準のWeb Audio API（16kHz PCM）で高速処理され、100msごとにGemini Live APIへストリーミング送信されます。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="font-bold text-white flex items-center gap-1.5 text-sm">
              <Volume2 className="w-4 h-4 text-indigo-400" />
              3. ネイティブ24kHz音声で瞬時に翻訳
            </div>
            <p>
              Gemini Live APIが直接合成した超高品質な24kHz PCM音声を、途切れなく低遅延で即時スピーカー再生します。外部の文字起こしやTTSを中継しないため、圧倒的な応答速度を実現しています。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="font-bold text-white flex items-center gap-1.5 text-sm">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              4. 専門用語集と通訳モード
            </div>
            <p>
              製造業、医療、ビジネス商談など、特定の業界用語は「用語辞書」に登録することで、Geminiのプロンプト内に組み込まれ、誤訳を防ぐことができます。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-800 bg-slate-900/90">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            理解しました
          </button>
        </div>
      </div>
    </div>
  );
};
