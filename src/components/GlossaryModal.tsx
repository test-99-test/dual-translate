import React, { useState } from 'react';
import { X, Plus, Trash2, BookOpen, Sparkles, Check, Download } from 'lucide-react';
import { GlossaryTerm } from '../types';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  glossary: GlossaryTerm[];
  onUpdateGlossary: (terms: GlossaryTerm[]) => void;
}

const PRESET_PACKS = [
  {
    name: '製造・現場作業',
    icon: '🏭',
    terms: [
      { source: 'NC旋盤', target: 'CNC Lathe', note: '機械設備' },
      { source: 'バリ取り', target: 'Deburring', note: '加工仕上げ' },
      { source: '歩留まり', target: 'Yield rate', note: '生産性指標' },
      { source: '治具', target: 'Jig / Fixture', note: '位置決め固定具' },
      { source: '公差', target: 'Tolerance', note: '許容誤差寸法' },
      { source: '金型', target: 'Mold / Die', note: '成型用' },
      { source: '安全第一', target: 'Safety First', note: '安全標語' }
    ]
  },
  {
    name: 'ビジネス・商談',
    icon: '👔',
    terms: [
      { source: '相見積もり', target: 'Competitive bidding / Multiple quotes', note: '価格比較' },
      { source: '秘密保持契約', target: 'Non-Disclosure Agreement (NDA)', note: '法務' },
      { source: '検収', target: 'Acceptance inspection', note: '納品確認' },
      { source: '納期', target: 'Delivery date / Lead time', note: 'スケジュール' },
      { source: '請求書', target: 'Invoice', note: '経理' }
    ]
  },
  {
    name: '医療・健康',
    icon: '🏥',
    terms: [
      { source: '問診票', target: 'Medical questionnaire', note: '受付' },
      { source: '処方箋', target: 'Prescription', note: '調剤' },
      { source: 'アレルギー', target: 'Allergy', note: '体質' },
      { source: '副作用', target: 'Side effects', note: '薬効' }
    ]
  }
];

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  isOpen,
  onClose,
  glossary,
  onUpdateGlossary
}) => {
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [note, setNote] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source.trim() || !target.trim()) return;

    const newTerm: GlossaryTerm = {
      id: Date.now().toString(),
      source: source.trim(),
      target: target.trim(),
      note: note.trim() || undefined
    };

    onUpdateGlossary([...glossary, newTerm]);
    setSource('');
    setTarget('');
    setNote('');
  };

  const handleDeleteTerm = (id: string) => {
    onUpdateGlossary(glossary.filter((t) => t.id !== id));
  };

  const handleImportPreset = (presetTerms: { source: string; target: string; note?: string }[]) => {
    const existingSources = new Set(glossary.map((g) => g.source.toLowerCase()));
    const newItems: GlossaryTerm[] = [];

    presetTerms.forEach((pt) => {
      if (!existingSources.has(pt.source.toLowerCase())) {
        newItems.push({
          id: (Date.now() + Math.random()).toString(),
          source: pt.source,
          target: pt.target,
          note: pt.note
        });
      }
    });

    if (newItems.length > 0) {
      onUpdateGlossary([...glossary, ...newItems]);
      setNotification(`${newItems.length}件のプリセット用語を追加しました`);
      setTimeout(() => setNotification(null), 2500);
    } else {
      setNotification('指定されたプリセット用語は既に追加されています');
      setTimeout(() => setNotification(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">カスタム用語集・対訳辞書</h2>
              <p className="text-xs text-slate-400">Gemini Live の System Instruction へ即時注入されます</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification pill */}
        {notification && (
          <div className="px-6 py-2 bg-emerald-500/20 text-emerald-300 text-xs font-medium border-b border-emerald-500/30 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            {notification}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Preset Packs Section */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 block">
              業種別プリセット一括追加
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESET_PACKS.map((pack) => (
                <button
                  key={pack.name}
                  onClick={() => handleImportPreset(pack.terms)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-all group"
                >
                  <span className="text-xl">{pack.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300 truncate">
                      {pack.name}
                    </div>
                    <div className="text-[10px] text-slate-400">+{pack.terms.length}語を追加</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Add Form */}
          <form onSubmit={handleAddTerm} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              単語の個別追加
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <input
                  type="text"
                  placeholder="元言語の単語 (例: NC旋盤)"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="翻訳後の指定対訳 (例: CNC Lathe)"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="補足メモ (任意: 工場ライン3番専用 など)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1 shadow-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                追加
              </button>
            </div>
          </form>

          {/* Existing Terms List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                登録済み用語一覧 ({glossary.length}件)
              </label>
              {glossary.length > 0 && (
                <button
                  onClick={() => onUpdateGlossary([])}
                  className="text-[11px] text-red-400 hover:text-red-300 transition-colors"
                >
                  すべて削除
                </button>
              )}
            </div>

            {glossary.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-slate-500 text-xs">
                登録された専門用語はありません。上のプリセットまたはフォームから登録してください。
              </div>
            ) : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {glossary.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                      <span className="font-bold text-amber-300 truncate">{item.source}</span>
                      <span className="text-slate-500">➔</span>
                      <span className="font-semibold text-slate-200 truncate">{item.target}</span>
                      {item.note && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/80 text-slate-400 truncate">
                          {item.note}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteTerm(item.id)}
                      className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                      title="削除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
