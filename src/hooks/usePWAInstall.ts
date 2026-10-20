import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface PWAInstallState {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isInAppBrowser: boolean;
  inAppBrowserName: string;
  hasNativePrompt: boolean;
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'guide'>;
}

export function usePWAInstall(): PWAInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [inAppBrowserName, setInAppBrowserName] = useState('');

  useEffect(() => {
    // 1. Detect standalone mode (already installed on Home Screen or desktop PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // 2. User Agent Analysis
    const userAgent = (window.navigator.userAgent || '').toLowerCase();
    
    // iOS detection
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    // Android detection
    const isAndroidDevice = /android/.test(userAgent);
    setIsAndroid(isAndroidDevice);

    // In-App Browser detection (LINE, Twitter, Instagram, Facebook, TikTok, etc.)
    let appName = '';
    if (userAgent.includes('line/')) {
      appName = 'LINE';
    } else if (userAgent.includes('fbav') || userAgent.includes('fban')) {
      appName = 'Facebook';
    } else if (userAgent.includes('instagram')) {
      appName = 'Instagram';
    } else if (userAgent.includes('twitter')) {
      appName = 'X (Twitter)';
    } else if (userAgent.includes('micromessenger')) {
      appName = 'WeChat';
    } else if (userAgent.includes('tiktok') || userAgent.includes('bytedance')) {
      appName = 'TikTok';
    } else if (userAgent.includes('wv') || (userAgent.includes('version/') && userAgent.includes('chrome') && isAndroidDevice)) {
      // WebView on Android
      appName = 'アプリ内ブラウザ';
    }

    if (appName) {
      setIsInAppBrowser(true);
      setInAppBrowserName(appName);
    }

    // 3. Listen for browser native install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'guide'> => {
    // If native prompt is available (Chrome Android / Desktop Chrome / Edge)
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          return 'accepted';
        }
        return 'dismissed';
      } catch (err) {
        console.warn('Native install prompt failed:', err);
        return 'guide';
      }
    }

    // Otherwise show step-by-step installation guide
    return 'guide';
  }, [deferredPrompt]);

  return {
    deferredPrompt,
    hasNativePrompt: Boolean(deferredPrompt),
    isInstallable: Boolean(deferredPrompt) || isIOS || isAndroid,
    isInstalled,
    isIOS,
    isAndroid,
    isInAppBrowser,
    inAppBrowserName,
    promptInstall
  };
}
