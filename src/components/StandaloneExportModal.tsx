import React, { useState } from 'react';
import { X, FileCode, Download, Copy, Check, ExternalLink } from 'lucide-react';

interface StandaloneExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StandaloneExportModal: React.FC<StandaloneExportModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownloadFile = async () => {
    setDownloading(true);
    try {
      const response = await fetch('/standalone.html');
      const text = await response.text();
      const blob = new Blob([text], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gemini-live-interpreter-v5.html';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      const response = await fetch('/standalone.html');
      const text = await response.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">単一HTMLスタンドアロン版のエクスポート</h2>
              <p className="text-xs text-slate-400">外部ビルド不要・1ファイル完結で動作する確定版 v5.0</p>
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
        <div className="p-6 space-y-4 text-xs leading-relaxed text-slate-300">
          <p>
            指示書の【基本仕様（共通100項目）】に完全準拠した、インラインCSS・JavaScript完結の
            <span className="font-bold text-blue-400">「完全スタンドアロン単一HTMLファイル」</span>
            を出力・ダウンロードできます。
          </p>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="font-bold text-white text-xs">特徴と互換性:</div>
            <ul className="space-y-1 text-slate-400 list-disc list-inside">
              <li>npm や Node.js のインストール不要で、ダブルクリックやGitHub Pagesに置くだけで稼働</li>
              <li>ブラウザ標準 Web Audio API (16kHz PCM マイク入力 & 24kHz PCM 出力) 完結</li>
              <li>対面スプリットビュー ＆ 180°反転表示機能内蔵</li>
              <li>PWA対応・オフライン耐性キャッシュ設計</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={handleDownloadFile}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? '生成中...' : '単一HTMLをダウンロード (.html)'}</span>
            </button>
            <button
              onClick={handleCopyCode}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'コピー完了' : 'コードをコピー'}</span>
            </button>
          </div>
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
