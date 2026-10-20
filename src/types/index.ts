export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  locale: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'ja', name: '日本語', nativeName: '日本語', flag: '🇯🇵', locale: 'ja-JP' },
  { code: 'en', name: '英語', nativeName: 'English', flag: '🇺🇸', locale: 'en-US' },
  { code: 'zh', name: '中国語 (簡体字)', nativeName: '简体中文', flag: '🇨🇳', locale: 'zh-CN' },
  { code: 'vi', name: 'ベトナム語', nativeName: 'Tiếng Việt', flag: '🇻🇳', locale: 'vi-VN' },
  { code: 'pt', name: 'ポルトガル語', nativeName: 'Português', flag: '🇧🇷', locale: 'pt-BR' },
  { code: 'my', name: 'ミャンマー語', nativeName: 'မြန်မာဘာသာ', flag: '🇲🇲', locale: 'my-MM' },
  { code: 'th', name: 'タイ語', nativeName: 'ไทย', flag: '🇹🇭', locale: 'th-TH' },
  { code: 'id', name: 'インドネシア語', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', locale: 'id-ID' },
  { code: 'es', name: 'スペイン語', nativeName: 'Español', flag: '🇪🇸', locale: 'es-ES' },
  { code: 'ko', name: '韓国語', nativeName: '한국어', flag: '🇰🇷', locale: 'ko-KR' },
  { code: 'fr', name: 'フランス語', nativeName: 'Français', flag: '🇫🇷', locale: 'fr-FR' },
  { code: 'de', name: 'ドイツ語', nativeName: 'Deutsch', flag: '🇩🇪', locale: 'de-DE' },
  { code: 'tl', name: 'タガログ語', nativeName: 'Filipino', flag: '🇵🇭', locale: 'fil-PH' },
  { code: 'hi', name: 'ヒンディー語', nativeName: 'हिन्दी', flag: '🇮🇳', locale: 'hi-IN' }
];

export type TranslationMode = 'business' | 'factory' | 'casual' | 'medical' | 'hospitality';

export interface TranslationModeConfig {
  id: TranslationMode;
  name: string;
  icon: string;
  description: string;
  instructionPrompt: string;
}

export const TRANSLATION_MODES: TranslationModeConfig[] = [
  {
    id: 'business',
    name: 'ビジネス・丁寧',
    icon: 'Briefcase',
    description: 'フォーマルで礼儀正しい敬語・丁寧表現。商談や公式ミーティングに最適。',
    instructionPrompt: 'トーンはビジネス向けの礼儀正しい敬語・丁寧語を用いてください。相手に失礼のない洗練された表現を選択してください。'
  },
  {
    id: 'factory',
    name: '製造現場・作業指示',
    icon: 'Factory',
    description: '工場・工事現場等での安全確認・明確かつ簡潔な作業指示モード。',
    instructionPrompt: '製造工場や現場作業での通訳です。誤解を避けるため、冗長な前置きを排除し、極めて明確、簡潔、具体的に指示内容や安全確認を翻訳してください。'
  },
  {
    id: 'casual',
    name: '日常会話・フレンドリー',
    icon: 'MessageCircle',
    description: '親しみやすく自然な日常コミュニケーション表現。',
    instructionPrompt: '自然でフレンドリーな日常会話の口調で翻訳してください。堅苦しすぎず、スムーズな会話のキャッチボールができる表現にしてください。'
  },
  {
    id: 'medical',
    name: '医療・健康相談',
    icon: 'HeartPulse',
    description: '体調や症状、処置内容を正確・慎重に伝える医療サポートモード。',
    instructionPrompt: '医療・健康に関する通訳です。症状の部位、痛みの程度、服用方法などを正確かつ慎重に、安心感のある落ち着いたトーンで翻訳してください。'
  },
  {
    id: 'hospitality',
    name: '接客・観光トラベル',
    icon: 'Plane',
    description: 'ホテル、飲食店、観光案内での温かみのある接客モード。',
    instructionPrompt: '観光・接客サービス向けです。親切丁寧で温かみのあるおもてなしの表現を用いて翻訳してください。'
  }
];

export interface GlossaryTerm {
  id: string;
  source: string;
  target: string;
  note?: string;
}

export interface ConversationTurn {
  id: string;
  timestamp: number;
  speaker: 'A' | 'B';
  sourceLanguage: string;
  targetLanguage: string;
  text: string;
  originalText?: string;
  audioDurationSeconds?: number;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export type VoiceName = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr' | 'Aoede';

export interface AppSettings {
  voiceName: VoiceName;
  micSensitivity: number; // 0.5 - 2.0
  playbackVolume: number; // 0 - 1.0
  playbackSpeed: number; // 0.75 - 1.5x (pitch-preserved time stretching)
  autoListen: boolean; // Continuous VAD or Push-to-talk
  fontSize: 'normal' | 'large' | 'xlarge';
  soundEffects: boolean;
}
