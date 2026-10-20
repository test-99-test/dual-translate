import React, { useState } from 'react';
import { X, History, Copy, Download, Trash2, Check, Filter } from 'lucide-react';
import { ConversationTurn } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ConversationTurn[];
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory
}) => {
  const [filterSpeaker, setFilterSpeaker] = useState<'ALL' | 'A' | 'B'>('ALL');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    if (filterSpeaker === 'ALL') return true;
    return item.speaker === filterSpeaker;
  });

  const generateMarkdown = (): string => {
    const lines = [
      `# Gemini Live 対面音声通訳 記録ログ`,
      `エクスポート日時: ${new Date().toLocaleString('ja-JP')}`,
      `総発話件数: ${history.length}件\n`,
      `---`,
      ''
    ];

    history.forEach((turn, idx) => {
      const timeStr = new Date(turn.timestamp).toLocaleTimeString('ja-JP');
      const speakerName = turn.speaker === 'A' ? '話者 A (あなた)' : '話者 B (お相手)';
      lines.push(`### [${timeStr}] ${speakerName} (${turn.sourceLanguage} ➔ ${turn.targetLanguage})`);
      if (turn.originalText) {
        lines.push(`- **原文**: ${turn.originalText}`);
      }
      lines.push(`- **通訳**: ${turn.text}`);
      lines.push('');
    });

    return lines.join('\n');
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdown();
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini-live-transcript-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">会話ログ・翻訳タイムライン</h2>
              <p className="text-xs text-slate-400">時系列の通訳記録（Markdown保存・コピー対応）</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-slate-950/40 border-b border-slate-800 text-xs">
          {/* Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">話者:</span>
            <div className="flex rounded-lg bg-slate-800/80 p-0.5 border border-slate-700">
              {(['ALL', 'A', 'B'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterSpeaker(s)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                    filterSpeaker === s
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s === 'ALL' ? '全員' : s === 'A' ? '話者 A' : '話者 B'}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              disabled={history.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'コピー完了' : 'Markdownコピー'}</span>
            </button>
            <button
              onClick={handleDownloadMarkdown}
              disabled={history.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 disabled:opacity-40 text-white border border-emerald-500/40 transition-colors font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.md保存</span>
            </button>
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                title="履歴を全消去"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-slate-500 text-xs">
              まだ会話の記録はありません。マイクを押して通話を開始するとここにログが蓄積されます。
            </div>
          ) : (
            filteredHistory.map((turn) => {
              const isA = turn.speaker === 'A';
              return (
                <div
                  key={turn.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isA
                      ? 'bg-blue-950/30 border-blue-500/30 ml-0 mr-8'
                      : 'bg-emerald-950/30 border-emerald-500/30 ml-8 mr-0'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full ${
                        isA
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {isA ? '話者 A (あなた)' : '話者 B (お相手)'}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {new Date(turn.timestamp).toLocaleTimeString('ja-JP')}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-100 leading-relaxed">
                    {turn.text}
                  </p>

                  <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {turn.sourceLanguage} ➔ {turn.targetLanguage}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-800 bg-slate-900/90">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
