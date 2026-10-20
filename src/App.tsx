import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  SUPPORTED_LANGUAGES, 
  Language, 
  TranslationMode, 
  GlossaryTerm, 
  ConversationTurn, 
  ConnectionStatus, 
  AppSettings 
} from './types';
import { AudioRecorder, AudioPlayer } from './utils/audioUtils';
import { GeminiLiveService } from './services/geminiLiveService';
import { Header } from './components/Header';
import { UnifiedChatView } from './components/UnifiedChatView';
import { GlossaryModal } from './components/GlossaryModal';
import { HistoryModal } from './components/HistoryModal';
import { ModeModal } from './components/ModeModal';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import { StandaloneExportModal } from './components/StandaloneExportModal';
import { UpdateModal } from './components/UpdateModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { PermissionModal } from './components/PermissionModal';
import { useAppUpdate } from './hooks/useAppUpdate';
import { usePWAInstall } from './hooks/usePWAInstall';
import { Sparkles, ArrowRight, X, Smartphone, Mic } from 'lucide-react';

const DEFAULT_SETTINGS: AppSettings = {
  voiceName: 'Puck',
  micSensitivity: 1.0,
  playbackVolume: 1.0,
  playbackSpeed: 1.0,
  autoListen: true,
  fontSize: 'large',
  soundEffects: true
};

export default function App() {
  // State
  const [langA, setLangA] = useState<Language>(() => {
    const saved = localStorage.getItem('gemini_live_lang_a');
    return saved ? JSON.parse(saved) : SUPPORTED_LANGUAGES[0]; // 日本語
  });

  const [langB, setLangB] = useState<Language>(() => {
    const saved = localStorage.getItem('gemini_live_lang_b');
    return saved ? JSON.parse(saved) : SUPPORTED_LANGUAGES[1]; // 英語
  });

  const [mode, setMode] = useState<TranslationMode>(() => {
    return (localStorage.getItem('gemini_live_mode') as TranslationMode) || 'business';
  });

  const [glossary, setGlossary] = useState<GlossaryTerm[]>(() => {
    const saved = localStorage.getItem('gemini_live_glossary');
    return saved ? JSON.parse(saved) : [
      { id: '1', source: 'NC旋盤', target: 'CNC Lathe', note: '現場設備' },
      { id: '2', source: 'バリ取り', target: 'Deburring', note: '仕上げ' }
    ];
  });

  const [history, setHistory] = useState<ConversationTurn[]>(() => {
    const saved = localStorage.getItem('gemini_live_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('gemini_live_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  // Continuous listening state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // Live in-progress text
  const [liveOriginalText, setLiveOriginalText] = useState<string>('');
  const [liveTranslatedText, setLiveTranslatedText] = useState<string>('');

  // Modals state
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isModeOpen, setIsModeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [showUpdateBanner, setShowUpdateBanner] = useState(true);
  const [isPWAInstallModalOpen, setIsPWAInstallModalOpen] = useState(false);
  const [showMobileInstallBanner, setShowMobileInstallBanner] = useState(() => {
    return localStorage.getItem('dismiss_mobile_install_banner') !== 'true';
  });
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [permissionModalReason, setPermissionModalReason] = useState<string | undefined>(undefined);

  // PWA install state & device detection
  const pwaState = usePWAInstall();

  // App version & optional update management
  const {
    hasUpdate,
    latestRelease,
    isChecking: isUpdateChecking,
    checkMessage: updateCheckMessage,
    checkForUpdates,
    dismissUpdate,
    applyUpdate,
    simulateNewVersion
  } = useAppUpdate();

  // Audio refs
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioPlayerRef = useRef<AudioPlayer | null>(null);
  const liveServiceRef = useRef<GeminiLiveService | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const accumulatedOriginalRef = useRef<string>('');

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('gemini_live_lang_a', JSON.stringify(langA));
  }, [langA]);

  useEffect(() => {
    localStorage.setItem('gemini_live_lang_b', JSON.stringify(langB));
  }, [langB]);

  useEffect(() => {
    localStorage.setItem('gemini_live_mode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('gemini_live_glossary', JSON.stringify(glossary));
  }, [glossary]);

  useEffect(() => {
    localStorage.setItem('gemini_live_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('gemini_live_settings', JSON.stringify(settings));
    if (audioPlayerRef.current) {
      audioPlayerRef.current.setVolume(settings.playbackVolume);
      audioPlayerRef.current.setPlaybackSpeed(settings.playbackSpeed || 1.0);
    }
  }, [settings]);

  // Handle incoming translated text chunk or completion
  const handleIncomingText = useCallback((text: string, isDone: boolean) => {
    setLiveTranslatedText(text);

    if (isDone && text.trim().length > 0) {
      const originalText = accumulatedOriginalRef.current.trim() || undefined;

      const newTurn: ConversationTurn = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        speaker: 'A', // dynamically tagged
        sourceLanguage: langA.name,
        targetLanguage: langB.name,
        text: text.trim(),
        originalText: originalText
      };

      setHistory((prev) => [...prev, newTurn]);
      setIsTranslating(false);
      setLiveTranslatedText('');
      setLiveOriginalText('');
      accumulatedOriginalRef.current = '';
    }
  }, [langA, langB]);

  // Initialize AudioPlayer and GeminiLiveService
  useEffect(() => {
    const player = new AudioPlayer();
    player.setVolume(settings.playbackVolume);
    player.setPlaybackSpeed(settings.playbackSpeed || 1.0);
    player.setLevelCallback((level) => {
      setAudioLevel(level);
    });
    audioPlayerRef.current = player;

    const recorder = new AudioRecorder();
    audioRecorderRef.current = recorder;

    const liveService = new GeminiLiveService({
      onAudioData: (base64Audio) => {
        setIsTranslating(false);
        if (audioPlayerRef.current) {
          audioPlayerRef.current.queueAudioChunk(base64Audio);
        }
      },
      onTextData: handleIncomingText,
      onInterrupted: () => {
        if (audioPlayerRef.current) {
          audioPlayerRef.current.interrupt();
        }
        setIsTranslating(false);
      },
      onStatusChange: (status, errorMsg) => {
        setConnectionStatus(status);
        if (errorMsg) {
          setStatusMessage(errorMsg);
        } else {
          setStatusMessage('');
        }
      }
    });

    liveServiceRef.current = liveService;

    // Connect automatically
    liveService.connect(langA, langB, mode, glossary, settings.voiceName);

    return () => {
      recorder.stop();
      player.destroy();
      liveService.disconnect();
    };
  }, []);

  // Re-connect when configuration (languages, mode, voice, glossary) changes
  const reconnectSession = useCallback(() => {
    if (liveServiceRef.current) {
      liveServiceRef.current.connect(langA, langB, mode, glossary, settings.voiceName);
    }
  }, [langA, langB, mode, glossary, settings.voiceName]);

  // Start continuous listening
  const handleStartListening = useCallback(async () => {
    if (isListening) return;

    if (!liveServiceRef.current?.isConnected()) {
      reconnectSession();
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.interrupt();
    }

    setIsListening(true);
    setLiveOriginalText('');
    setLiveTranslatedText('');
    accumulatedOriginalRef.current = '';

    // Initialize local speech recognition if available for instant original transcript
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = langA.locale;

        recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            interim += event.results[i][0].transcript;
          }
          if (interim.trim()) {
            setLiveOriginalText(interim);
            accumulatedOriginalRef.current = interim;
            setIsTranslating(true);
          }
        };

        recognition.onerror = () => {
          // Ignore speech recognition error (audio continues via Gemini Live)
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
      } catch (e) {
        console.warn('SpeechRecognition not available or failed to start:', e);
      }
    }

    // Audio stream to Gemini Live
    const onAudioChunk = (base64PCM: string) => {
      if (liveServiceRef.current) {
        liveServiceRef.current.sendAudioChunk(base64PCM);
      }
    };

    const onLevel = (level: number) => {
      const adjusted = Math.min(100, Math.round(level * settings.micSensitivity));
      setAudioLevel(adjusted);
    };

    try {
      const started = await audioRecorderRef.current?.start(onAudioChunk, onLevel);
      if (!started) {
        setIsListening(false);
        setPermissionModalReason('マイクの初期化に失敗しました。スマートフォンまたはブラウザの設定でマイクのアクセス許可を有効にしてください。');
        setIsPermissionModalOpen(true);
      }
    } catch (e: any) {
      console.error('Mic start error:', e);
      setIsListening(false);
      setPermissionModalReason('マイクへのアクセスが拒否されたか、マイクデバイスが見つかりません。設定をご確認ください。');
      setIsPermissionModalOpen(true);
    }
  }, [isListening, langA.locale, reconnectSession, settings.micSensitivity]);

  // Stop continuous listening
  const handleStopListening = useCallback(() => {
    setIsListening(false);
    setAudioLevel(0);
    setIsTranslating(false);

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
      speechRecognitionRef.current = null;
    }

    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.interrupt();
    }
  }, []);

  // Swap languages (⇄)
  const handleSwapLanguages = useCallback(() => {
    const temp = langA;
    setLangA(langB);
    setLangB(temp);

    setTimeout(() => {
      if (liveServiceRef.current) {
        liveServiceRef.current.connect(langB, temp, mode, glossary, settings.voiceName);
      }
    }, 100);
  }, [langA, langB, mode, glossary, settings.voiceName]);

  // Handle typed text message
  const handleSendCustomText = useCallback((text: string) => {
    setIsTranslating(true);
    setLiveOriginalText(text);
    accumulatedOriginalRef.current = text;
    if (liveServiceRef.current) {
      liveServiceRef.current.sendTextMessage(text);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Top Header */}
      <Header
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        glossaryCount={glossary.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenModeModal={() => setIsModeOpen(true)}
        currentMode={mode}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenUpdateModal={() => setIsUpdateModalOpen(true)}
        onOpenPermissionModal={() => {
          setPermissionModalReason(undefined);
          setIsPermissionModalOpen(true);
        }}
        hasUpdate={hasUpdate}
      />

      {/* Main Single Chat Container */}
      <div className="flex-1 flex flex-col p-2 sm:p-4 overflow-hidden max-w-5xl mx-auto w-full">
        {/* Optional App Update Notification Banner (Voluntary & Non-intrusive) */}
        {hasUpdate && showUpdateBanner && (
          <div className="mb-2.5 p-3 rounded-xl bg-gradient-to-r from-blue-950/90 via-slate-900/90 to-emerald-950/90 border border-blue-500/50 shadow-lg flex items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300 shrink-0">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-white flex items-center gap-2 truncate">
                  <span>新しいバージョン {latestRelease.version} が利用可能です</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                    任意更新
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 truncate">
                  {latestRelease.title}（タップして変更点を確認）
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1 text-xs"
              >
                <span>変更点を見る</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  dismissUpdate();
                  setShowUpdateBanner(false);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors"
                title="あとで（更新しない）"
              >
                あとで
              </button>
            </div>
          </div>
        )}

        {/* Mobile PWA Install Helper Banner (shown on mobile when not yet installed) */}
        {!pwaState.isInstalled && showMobileInstallBanner && (pwaState.isIOS || pwaState.isAndroid) && (
          <div className="mb-2.5 p-3 rounded-xl bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-indigo-950/80 border border-blue-500/40 shadow-md flex items-center justify-between gap-2.5 text-xs shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-white flex items-center gap-2 truncate">
                  <span>スマホのホーム画面に追加して全画面で通訳</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
                    PWA対応
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 truncate">
                  URLバーが非表示になり、対面通訳が全画面で広く快適に使えます
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  setPermissionModalReason(undefined);
                  setIsPermissionModalOpen(true);
                }}
                className="hidden sm:flex px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold transition-all border border-slate-700 active:scale-95 items-center gap-1 text-xs cursor-pointer"
                title="マイク・スピーカーの事前テスト"
              >
                <Mic className="w-3.5 h-3.5 text-blue-400" />
                <span>マイクテスト</span>
              </button>
              <button
                onClick={() => setIsPWAInstallModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1 text-xs cursor-pointer"
              >
                <span>インストール手順</span>
              </button>
              <button
                onClick={() => {
                  setShowMobileInstallBanner(false);
                  localStorage.setItem('dismiss_mobile_install_banner', 'true');
                }}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="閉じる"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Error notification banner if any */}
        {connectionStatus === 'error' && statusMessage && (
          <div className="mb-2 px-4 py-2 bg-red-950/80 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-center justify-between shrink-0">
            <span>{statusMessage}</span>
            <button
              onClick={reconnectSession}
              className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs transition-colors"
            >
              再接続する
            </button>
          </div>
        )}

        {/* Unified Chat Screen */}
        <div className="flex-1 min-h-0">
          <UnifiedChatView
            langA={langA}
            langB={langB}
            onSelectLangA={(l) => {
              setLangA(l);
              setTimeout(() => {
                liveServiceRef.current?.connect(l, langB, mode, glossary, settings.voiceName);
              }, 100);
            }}
            onSelectLangB={(l) => {
              setLangB(l);
              setTimeout(() => {
                liveServiceRef.current?.connect(langA, l, mode, glossary, settings.voiceName);
              }, 100);
            }}
            onSwapLanguages={handleSwapLanguages}
            currentMode={mode}
            onOpenModeModal={() => setIsModeOpen(true)}
            isListening={isListening}
            onStartListening={handleStartListening}
            onStopListening={handleStopListening}
            audioLevel={audioLevel}
            history={history}
            onClearHistory={() => setHistory([])}
            liveOriginalText={liveOriginalText}
            liveTranslatedText={liveTranslatedText}
            isTranslating={isTranslating}
            fontSize={settings.fontSize}
            onSendCustomText={handleSendCustomText}
          />
        </div>
      </div>

      {/* Modals */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        glossary={glossary}
        onUpdateGlossary={(newGlossary) => {
          setGlossary(newGlossary);
          setTimeout(reconnectSession, 100);
        }}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={() => setHistory([])}
      />

      <ModeModal
        isOpen={isModeOpen}
        onClose={() => setIsModeOpen(false)}
        currentMode={mode}
        onSelectMode={(newMode) => {
          setMode(newMode);
          setTimeout(reconnectSession, 100);
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => {
          setSettings(newSettings);
          if (newSettings.voiceName !== settings.voiceName) {
            setTimeout(reconnectSession, 100);
          }
        }}
        onOpenUpdateModal={() => setIsUpdateModalOpen(true)}
        onOpenPermissionModal={() => {
          setPermissionModalReason(undefined);
          setIsPermissionModalOpen(true);
        }}
        hasUpdate={hasUpdate}
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <StandaloneExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />

      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        hasUpdate={hasUpdate}
        latestRelease={latestRelease}
        onApplyUpdate={applyUpdate}
        onDismissUpdate={() => {
          dismissUpdate();
          setShowUpdateBanner(false);
        }}
        onCheckForUpdates={checkForUpdates}
        isChecking={isUpdateChecking}
        checkMessage={updateCheckMessage}
        onSimulateNewVersion={simulateNewVersion}
      />

      {/* PWA Smartphone Installation Modal */}
      <PWAInstallModal
        isOpen={isPWAInstallModalOpen}
        onClose={() => setIsPWAInstallModalOpen(false)}
        pwaState={pwaState}
      />

      {/* Smartphone Mic & Audio Permission Modal */}
      <PermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        initialReason={permissionModalReason}
      />
    </div>
  );
}
