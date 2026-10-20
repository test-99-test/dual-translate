import { GlossaryTerm, Language, TranslationMode, TRANSLATION_MODES, VoiceName } from '../types';

export interface GeminiLiveCallbacks {
  onAudioData: (base64Audio: string) => void;
  onTextData: (text: string, isDone: boolean) => void;
  onInterrupted: () => void;
  onStatusChange: (status: 'disconnected' | 'connecting' | 'connected' | 'error', errorMsg?: string) => void;
}

export function buildSystemInstruction(
  langA: Language,
  langB: Language,
  mode: TranslationMode,
  glossary: GlossaryTerm[]
): string {
  const modeConfig = TRANSLATION_MODES.find((m) => m.id === mode) || TRANSLATION_MODES[0];

  let glossarySection = '';
  if (glossary.length > 0) {
    glossarySection = `\n【専門用語・固有名詞対訳辞書】\n以下の対訳を必ず厳格に使用してください:\n` +
      glossary.map((g) => `- "${g.source}" ⇄ "${g.target}"${g.note ? ` (${g.note})` : ''}`).join('\n');
  }

  return `あなたは世界最高峰のプロフェッショナル同時音声通訳者です。
二者間の対面コミュニケーションをリアルタイムに通訳します。

【通訳言語ペア】
- 話者Aの言語: ${langA.name} (${langA.nativeName} / ${langA.locale})
- 話者Bの言語: ${langB.name} (${langB.nativeName} / ${langB.locale})

【現在の通訳スタイル・運用モード】
モード: ${modeConfig.name}
指針: ${modeConfig.instructionPrompt}
${glossarySection}

【絶対遵守ルール】
1. 音声が入力されたら、直ちにもう一方の話者の言語へ滑らか、自然かつ正確に翻訳した音声を出力してください。
   - 話者A (${langA.name}) の音声を受信したら ➔ ${langB.name} で発話。
   - 話者B (${langB.name}) の音声を受信したら ➔ ${langA.name} で発話。
2. 「翻訳します」「彼はこう言いました」などの前置きや相槌、挨拶、補足説明は絶対に言わないでください。翻訳された音声のみを瞬時に発話してください。
3. 専門用語集に指定された用語は必ず指定の対訳を使用してください。
4. 言語のニュアンス、数値、安全指示、敬意を正確に保ち、不自然な機械翻訳調を避けてください。`;
}

export class GeminiLiveService {
  private ws: WebSocket | null = null;
  private callbacks: GeminiLiveCallbacks;
  private isSetupDone: boolean = false;
  private currentTurnText: string = '';

  constructor(callbacks: GeminiLiveCallbacks) {
    this.callbacks = callbacks;
  }

  connect(
    langA: Language,
    langB: Language,
    mode: TranslationMode,
    glossary: GlossaryTerm[],
    voiceName: VoiceName = 'Puck'
  ) {
    this.disconnect();
    this.callbacks.onStatusChange('connecting');
    this.isSetupDone = false;
    this.currentTurnText = '';

    // Determine WebSocket URL: uses current host's /ws/live proxy with optional user API key
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const userApiKey = localStorage.getItem('gemini_user_api_key')?.trim();
    const queryParam = userApiKey ? `?key=${encodeURIComponent(userApiKey)}` : '';
    const wsUrl = `${protocol}//${window.location.host}/ws/live${queryParam}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[GeminiLiveService] WebSocket connection opened');
        this.sendSetup(langA, langB, mode, glossary, voiceName);
      };

      this.ws.onmessage = (event) => {
        try {
          const raw = typeof event.data === 'string' ? event.data : '';
          if (!raw) return;

          const data = JSON.parse(raw);

          // Handle server-level messages from our proxy
          if (data.type === 'error') {
            console.error('[GeminiLiveService] Server error message:', data.error);
            this.callbacks.onStatusChange('error', data.error);
            return;
          }

          if (data.type === 'live_connected') {
            console.log('[GeminiLiveService] Live session acknowledged by proxy');
            return;
          }

          if (data.type === 'live_closed') {
            console.warn('[GeminiLiveService] Live session closed:', data.reason);
            this.callbacks.onStatusChange('disconnected', data.reason);
            return;
          }

          // Handle Gemini Live BidiGenerateContent messages
          if (data.setupComplete) {
            console.log('[GeminiLiveService] Setup complete confirmed by Gemini');
            this.isSetupDone = true;
            this.callbacks.onStatusChange('connected');
            return;
          }

          const serverContent = data.serverContent;
          if (serverContent) {
            // Check for interruption
            if (serverContent.interrupted) {
              console.log('[GeminiLiveService] Model interrupted by user speech');
              this.callbacks.onInterrupted();
              this.currentTurnText = '';
              return;
            }

            // Extract modelTurn parts
            const modelTurn = serverContent.modelTurn;
            if (modelTurn?.parts) {
              for (const part of modelTurn.parts) {
                // Incoming Audio chunk (24kHz Mono PCM)
                if (part.inlineData?.data) {
                  this.callbacks.onAudioData(part.inlineData.data);
                }
                // Incoming text / transcription
                if (part.text) {
                  this.currentTurnText += part.text;
                  this.callbacks.onTextData(this.currentTurnText, false);
                }
              }
            }

            // Turn completed
            if (serverContent.turnComplete) {
              this.callbacks.onTextData(this.currentTurnText, true);
              this.currentTurnText = '';
            }
          }
        } catch (err) {
          console.error('[GeminiLiveService] Error handling message:', err);
        }
      };

      this.ws.onerror = (err) => {
        console.error('[GeminiLiveService] WebSocket error:', err);
        this.callbacks.onStatusChange('error', 'WebSocket接続エラーが発生しました。');
      };

      this.ws.onclose = (e) => {
        console.log('[GeminiLiveService] WebSocket closed:', e.code, e.reason);
        this.isSetupDone = false;
        if (e.code !== 1000) {
          this.callbacks.onStatusChange('disconnected', e.reason || '接続が切断されました');
        } else {
          this.callbacks.onStatusChange('disconnected');
        }
      };
    } catch (err: any) {
      console.error('[GeminiLiveService] Connection error:', err);
      this.callbacks.onStatusChange('error', err.message || '接続に失敗しました');
    }
  }

  private sendSetup(
    langA: Language,
    langB: Language,
    mode: TranslationMode,
    glossary: GlossaryTerm[],
    voiceName: VoiceName
  ) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const systemInstruction = buildSystemInstruction(langA, langB, mode, glossary);

    const setupMessage = {
      setup: {
        model: 'models/gemini-2.0-flash-exp',
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            }
          }
        },
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        }
      }
    };

    console.log('[GeminiLiveService] Sending setup message...');
    this.ws.send(JSON.stringify(setupMessage));
  }

  /**
   * Send realtime PCM 16kHz audio chunk to Gemini Live API
   */
  sendAudioChunk(base64PCM: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const audioMessage = {
      realtimeInput: {
        mediaChunks: [
          {
            mimeType: 'audio/pcm;rate=16000',
            data: base64PCM
          }
        ]
      }
    };

    this.ws.send(JSON.stringify(audioMessage));
  }

  /**
   * Optional text input message for typing
   */
  sendTextMessage(text: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const message = {
      clientContent: {
        turns: [
          {
            role: 'user',
            parts: [{ text }]
          }
        ],
        turnComplete: true
      }
    };

    this.ws.send(JSON.stringify(message));
  }

  disconnect() {
    if (this.ws) {
      try {
        this.ws.close(1000, 'User initiated disconnect');
      } catch {
        // ignore
      }
      this.ws = null;
    }
    this.isSetupDone = false;
    this.currentTurnText = '';
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN && this.isSetupDone;
  }
}
