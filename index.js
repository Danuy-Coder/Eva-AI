// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//          EVA AI — Entry Point
//     WhatsApp Bot + Express REST API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} from "@whiskeysockets/baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";
import express from "express";
import cors from "cors";
import axios from "axios";
import { Boom } from "@hapi/boom";

import config from "./config.js";
import db from "./db.js";
import { loadPlugins, handleMessage, getPluginList } from "./eva.js";

// ── Logger Setup ───────────────────────────
const logger = pino(
  { level: "silent" }, // Baileys internal log disembunyikan; gunakan "debug" jika perlu
  pino.destination({ sync: false })
);
const appLogger = pino(
  {
    level: "info",
    transport: {
      target: "pino-pretty",
      options: { colorize: true, translateTime: "SYS:HH:MM:ss", ignore: "pid,hostname" },
    },
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//           EXPRESS REST API SERVER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const app = express();
app.use(cors({ origin: config.server.corsOrigins }));
app.use(express.json());

// ── POST /api/chat — Bridge Website → AI ──
app.post("/api/chat", async (req, res) => {
  const { message, logic } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: "Field 'message' wajib diisi." });
  }

  try {
    const aiLogic = logic || config.ai.logic;
    const url = `${config.api.betabotz.baseUrl}/api/search/openai-logic`;
    const response = await axios.get(url, {
      params: { text: message, logic: aiLogic, apikey: config.api.betabotz.key },
      timeout: 30000,
    });

    const result = response.data?.result || response.data?.message || "Maaf, tidak ada respons.";
    return res.json({ success: true, reply: result, model: "Eva AI (Betabotz)" });
  } catch (err) {
    appLogger.error(`[API] Error /api/chat: ${err.message}`);
    return res.status(500).json({ success: false, error: "Gagal menghubungi AI backend." });
  }
});

// ── GET /api/status — Health Check ────────
app.get("/api/status", (req, res) => {
  const stats = db.getStats();
  const plugins = getPluginList();
  res.json({
    status: "online",
    bot: config.bot.name,
    version: config.bot.version,
    stats,
    plugins,
    uptime: process.uptime(),
  });
});

// ── GET / — Root ───────────────────────────
app.get("/", (req, res) => {
  res.send(`<h2>🤖 ${config.bot.name} API is running!</h2><p>POST /api/chat untuk menggunakan AI.</p>`);
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//           WHATSAPP BOT (BAILEYS)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(config.session.folder);
  const { version, isLatest } = await fetchLatestBaileysVersion();

  appLogger.info(`╔══════════════════════════════════╗`);
  appLogger.info(`║       EVA AI — Starting Bot      ║`);
  appLogger.info(`║  WA Version: ${version.join(".")}         ║`);
  appLogger.info(`║  Latest: ${isLatest ? "✅ Yes" : "⚠️  No (update?)"  }              ║`);
  appLogger.info(`╚══════════════════════════════════╝`);

  const sock = makeWASocket({
    version,
    logger,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    printQRInTerminal: true,
    syncFullHistory: false,
    generateHighQualityLinkPreview: true,
    getMessage: async () => undefined,
  });

  // ── QR Code Handler ────────────────────
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      appLogger.info("\n📱 Scan QR Code berikut dengan WhatsApp kamu:\n");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error instanceof Boom)
          ? lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut
          : true;

      const reason = lastDisconnect?.error?.output?.statusCode;
      appLogger.warn(`[EVA] Koneksi terputus. Alasan: ${reason}. Reconnect: ${shouldReconnect}`);

      if (shouldReconnect) {
        appLogger.info("[EVA] Mencoba reconnect dalam 5 detik...");
        setTimeout(startBot, 5000);
      } else {
        appLogger.error("[EVA] Sesi logout. Hapus folder auth_info_baileys/ dan jalankan ulang.");
        process.exit(1);
      }
    }

    if (connection === "open") {
      appLogger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      appLogger.info(`✅ EVA AI terhubung ke WhatsApp!`);
      appLogger.info(`📛 Nama: ${sock.user?.name}`);
      appLogger.info(`📞 Nomor: ${sock.user?.id?.split(":")[0]}`);
      appLogger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      db.setStartedAt();
    }
  });

  // ── Save Credentials ───────────────────
  sock.ev.on("creds.update", saveCreds);

  // ── Message Handler ────────────────────
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const msg of messages) {
      await handleMessage(sock, msg);
    }
  });

  return sock;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//                 BOOTSTRAP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function main() {
  try {
    // 1. Load semua plugin
    await loadPlugins();

    // 2. Jalankan Express server
    app.listen(config.server.port, config.server.host, () => {
      appLogger.info(`🌐 REST API berjalan di http://${config.server.host}:${config.server.port}`);
    });

    // 3. Jalankan WhatsApp bot
    await startBot();
  } catch (err) {
    appLogger.error(`[FATAL] ${err.message}`);
    console.error(err);
    process.exit(1);
  }
}

main();
