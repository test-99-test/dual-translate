export interface VersionRelease {
  version: string;
  date: string;
  title: string;
  changes: string[];
  isLatest?: boolean;
}

export const CURRENT_APP_VERSION = 'v5.2.2';

export const VERSION_HISTORY: VersionRelease[] = [
  {
    version: 'v5.2.2',
    date: '2026-10-20',
    title: 'スマホのマイク・音声権限事前テスト＆トラブル解決ガイド',
    changes: [
      '【マイク・音声権限事前チェック】通訳開始前にマイク権限の状態（許可・拒否・未確認）を確認し、リアルタイム集音メーターでマイクテストできる新機能を搭載',
      '【スピーカー出力テスト】スマートフォンの消音モード（マナーモード）や音量制限に気づけるよう、テストチャイム（音出し）機能を新設',
      '【OS別（iPhone/Android/PC）許可復旧手順】誤ってマイクを「拒否」してしまった場合でも、端末設定から許可を復旧する詳細ガイドを案内',
      '【ダイアログ改善】ブラウザのalert警告を廃止し、アプリ内で視覚的に分かりやすいガイダンスモーダルへ刷新'
    ],
    isLatest: true
  },
  {
    version: 'v5.2.1',
    date: '2026-10-20',
    title: 'スマホPWAインストール完全対応＆端末別手順ガイド',
    changes: [
      '【Android Chrome PWA要件対応】192x192・512x512 PNGアイコン及びmaskableアイコンを生成・配備し、ChromeのPWA判定を正常化',
      '【iOS Safari対応】apple-touch-icon.png（180x180）の配備と、Safariでの「ホーム画面に追加」ステップナビゲーションを搭載',
      '【アプリ内ブラウザ検知】LINEやSNSの内部ブラウザで開いた場合の制限警告と、ワンタップURLコピー案内を追加',
      '【端末別スマート案内】iPhone / Android / PCを自動判別し、ご利用の端末に応じたインストール手順を案内するモーダルを新設'
    ]
  },
  {
    version: 'v5.2.0',
    date: '2026-10-20',
    title: '任意アップデート機能・PWAホーム画面追加・APIキー設定',
    changes: [
      '【任意アップデート対応】更新を強制せず、現在のバージョンのままでも継続して使い続けられるオプトイン設計を採用',
      '【変更点（Changelog）の明示】アップデート時に「何が変わったのか」がひと目で分かる詳細リストと過去履歴表示を追加',
      '【PWAホーム画面追加】スマートフォンのホーム画面にアプリとして登録可能（アドレスバー無しの全画面起動に対応）',
      '【Google AI Studio APIキー設定】他の人が利用する際にも個別のAPIキーを入力して接続テストできる設定UIを搭載',
      '【通訳スタートの動作改善】STARTボタンを押した際のマイク初期化とWebSocket接続ハンドシェイクを堅牢化'
    ]
  },
  {
    version: 'v5.1.0',
    date: '2026-10-20',
    title: '統合チャットタイムライン＆常時通訳仕様',
    changes: [
      '上下2分割レイアウトから、原文と翻訳が一覧できる見やすい統合チャット画面へ刷新',
      '一度STARTを押せばSTOPを押すまで途切れない「常時リスニング」に対応',
      'スマートフォンでのマイク初期化エラー（OverconstrainedError）を完全解消',
      'ピッチ保持（声の高さを変えない）再生速度スライダーを搭載'
    ]
  },
  {
    version: 'v5.0.0',
    date: '2026-10-19',
    title: 'Gemini Live 双方向リアルタイム通訳 初版リリース',
    changes: [
      'Gemini Live API (WebSocket BidiGenerateContent) ネイティブ24kHz音声通訳',
      '14言語ペアの自動判別とリアルタイム相互通訳',
      '業種別対訳辞書（製造現場・ビジネス・医療）プロンプト注入',
      'スタンドアロン単一HTML版のエクスポート機能'
    ]
  }
];
