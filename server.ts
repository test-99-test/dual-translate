import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  // API Status endpoint (does NOT expose key contents)
  app.get('/api/status', (req: Request, res: Response) => {
    const clientKey = typeof req.query.key === 'string' ? req.query.key.trim() : '';
    const hasServerKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
    const hasKey = Boolean(clientKey.length > 0 || hasServerKey);
    res.json({
      status: 'online',
      hasApiKey: hasKey,
      hasServerKey,
      defaultModel: 'models/gemini-2.0-flash-exp',
      timestamp: new Date().toISOString()
    });
  });

  // API Version & Changelog endpoint
  app.get('/api/version', (req: Request, res: Response) => {
    const isSimulate = req.query.simulate === 'true';
    if (isSimulate) {
      res.json({
        version: 'v5.3.0',
        date: '2026-10-21',
        title: '【次期バージョン】同時通訳エンジン高速化＆多言語追加',
        changes: [
          'Gemini Live WebSocket 音声パケットバッファリングの最適化（遅延をさらに20%短縮）',
          '新しい事前設定音声モデル（Kore / Zephyr）の日本語イントネーション調整',
          '会話履歴のCSV/Excelエクスポート形式の追加',
          '※ このアップデートは任意です。更新しなくても現行バージョン（v5.2.0）をそのまま利用できます。'
        ],
        isLatest: true
      });
      return;
    }

    res.json({
      version: 'v5.2.2',
      date: '2026-10-20',
      title: 'スマホのマイク・音声権限事前テスト＆トラブル解決ガイド',
      changes: [
        '【マイク・音声権限事前チェック】通訳開始前にマイク権限の状態（許可・拒否・未確認）を確認し、リアルタイム集音メーターでマイクテストできる新機能を搭載',
        '【スピーカー出力テスト】スマートフォンの消音モード（マナーモード）や音量制限に気づけるよう、テストチャイム（音出し）機能を新設',
        '【OS別（iPhone/Android/PC）許可復旧手順】誤ってマイクを「拒否」してしまった場合でも、端末設定から許可を復旧する詳細ガイドを案内',
        '【ダイアログ改善】ブラウザのalert警告を廃止し、アプリ内で視覚的に分かりやすいガイダンスモーダルへ刷新'
      ],
      history: [
        {
          version: 'v5.2.2',
          date: '2026-10-20',
          title: 'スマホのマイク・音声権限事前テスト＆トラブル解決ガイド'
        },
        {
          version: 'v5.2.1',
          date: '2026-10-20',
          title: 'スマホPWAインストール完全対応＆端末別手順ガイド'
        },
        {
          version: 'v5.2.0',
          date: '2026-10-20',
          title: '任意アップデート機能・PWAホーム画面追加・APIキー設定'
        },
        {
          version: 'v5.1.0',
          date: '2026-10-20',
          title: '統合チャットタイムライン＆常時通訳仕様'
        },
        {
          version: 'v5.0.0',
          date: '2026-10-19',
          title: 'Gemini Live 双方向リアルタイム通訳 初版リリース'
        }
      ]
    });
  });

  // WebSocket Server for Gemini Live API bidirectional bridge
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const pathname = request.url ? new URL(request.url, `http://${request.headers.host}`).pathname : '';
    if (pathname === '/ws/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (clientWs: WebSocket, request) => {
    console.log('[WebSocket] Client connected to /ws/live');
    const reqUrl = request.url ? new URL(request.url, `http://${request.headers.host}`) : null;
    const clientKey = reqUrl?.searchParams.get('key')?.trim();
    const apiKey = clientKey || process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      console.error('[WebSocket] GEMINI_API_KEY is not configured in process.env or client request');
      clientWs.send(JSON.stringify({
        type: 'error',
        error: 'APIキーが設定されていません。画面右上の設定（歯車アイコン）からGoogle AI StudioのAPIキーを入力してください。'
      }));
      clientWs.close(1008, 'API Key missing');
      return;
    }

    // Connect to Gemini Live API WebSocket
    const geminiUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;
    let geminiWs: WebSocket | null = null;
    const pendingClientMessages: string[] = [];

    try {
      geminiWs = new WebSocket(geminiUrl);
    } catch (err) {
      console.error('[WebSocket] Failed to initiate Gemini Live connection:', err);
      clientWs.send(JSON.stringify({
        type: 'error',
        error: 'Gemini Live API への接続初期化に失敗しました。'
      }));
      return;
    }

    geminiWs.on('open', () => {
      console.log('[WebSocket] Connected to Gemini Live upstream');
      clientWs.send(JSON.stringify({
        type: 'live_connected',
        status: 'ready'
      }));

      // Flush any queued messages that client sent before upstream was open
      while (pendingClientMessages.length > 0) {
        const msg = pendingClientMessages.shift();
        if (msg && geminiWs && geminiWs.readyState === WebSocket.OPEN) {
          geminiWs.send(msg);
        }
      }
    });

    geminiWs.on('message', (data: any, isBinary: boolean) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        if (isBinary) {
          clientWs.send(data, { binary: true });
        } else {
          const str = data.toString();
          clientWs.send(str);
        }
      }
    });

    geminiWs.on('error', (error) => {
      console.error('[WebSocket] Gemini upstream error:', error);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({
          type: 'error',
          error: `Gemini Live API エラー: ${error.message || '接続に問題が発生しました'}`
        }));
      }
    });

    geminiWs.on('close', (code, reason) => {
      console.log(`[WebSocket] Gemini upstream closed: code=${code}, reason=${reason.toString()}`);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({
          type: 'live_closed',
          code,
          reason: reason.toString()
        }));
      }
    });

    clientWs.on('message', (message: any) => {
      const msgStr = message.toString();
      if (geminiWs && geminiWs.readyState === WebSocket.OPEN) {
        geminiWs.send(msgStr);
      } else if (geminiWs && geminiWs.readyState === WebSocket.CONNECTING) {
        pendingClientMessages.push(msgStr);
      } else {
        console.warn('[WebSocket] Received client message but Gemini Live is not open');
      }
    });

    clientWs.on('close', () => {
      console.log('[WebSocket] Client disconnected');
      if (geminiWs && (geminiWs.readyState === WebSocket.OPEN || geminiWs.readyState === WebSocket.CONNECTING)) {
        geminiWs.close();
      }
    });

    clientWs.on('error', (err) => {
      console.error('[WebSocket] Client socket error:', err);
      if (geminiWs && (geminiWs.readyState === WebSocket.OPEN || geminiWs.readyState === WebSocket.CONNECTING)) {
        geminiWs.close();
      }
    });
  });

  // Always serve public directory assets (PWA manifest, icons, service worker)
  app.use(express.static(path.resolve(process.cwd(), 'public')));

  // Frontend integration: Vite in dev, static files in production
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Interpreter running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
