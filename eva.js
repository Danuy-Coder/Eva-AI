// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//      EVA AI — Message Handler & Plugin Loader
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pino from "pino";
import config from "./config.js";
import db from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logger = pino({ level: "info" }, pino.destination({ sync: false }));

// ── Plugin Registry ────────────────────────
const plugins = new Map();

// ── Load semua plugin dari folder plugins/ ──
export async function loadPlugins() {
  const pluginsDir = path.join(__dirname, "plugins");

  if (!fs.existsSync(pluginsDir)) {
    fs.mkdirSync(pluginsDir, { recursive: true });
    logger.info("[EVA] Folder plugins/ dibuat.");
  }

  const files = fs.readdirSync(pluginsDir).filter((f) => f.endsWith(".js"));

  if (files.length === 0) {
    logger.warn("[EVA] Tidak ada plugin ditemukan di folder plugins/");
    return;
  }

  for (const file of files) {
    try {
      const pluginPath = path.join(pluginsDir, file);
      // Hapus cache untuk hot-reload (jika diperlukan)
      const mod = await import(`${pluginPath}?t=${Date.now()}`);
      const plugin = mod.default;

      if (!plugin || !plugin.command || !plugin.execute) {
        logger.warn(`[EVA] Plugin ${file} tidak valid — harus export { command, execute }`);
        continue;
      }

      // Daftarkan setiap command dari plugin
      const commands = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
      for (const cmd of commands) {
        plugins.set(cmd.toLowerCase(), plugin);
      }

      logger.info(`[EVA] Plugin loaded: ${file} → commands: [${commands.join(", ")}]`);
    } catch (err) {
      logger.error(`[EVA] Gagal load plugin ${file}: ${err.message}`);
    }
  }

  logger.info(`[EVA] Total ${plugins.size} command(s) terdaftar dari ${files.length} plugin(s).`);
}

// ── Helper: Ekstrak teks pesan ─────────────
function getMessageText(msg) {
  const m = msg.message;
  if (!m) return "";
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    ""
  );
}

// ── Helper: Reply pesan ────────────────────
async function reply(sock, jid, text, quoted) {
  await sock.sendMessage(jid, { text }, { quoted });
}

// ── Main Message Handler ───────────────────
export async function handleMessage(sock, msg) {
  try {
    // Abaikan pesan dari diri sendiri
    if (msg.key.fromMe) return;

    const jid = msg.key.remoteJid;
    const isGroup = jid?.endsWith("@g.us");
    const sender = isGroup ? msg.key.participant : jid;
    const pushName = msg.pushName || "Pengguna";
    const body = getMessageText(msg).trim();

    if (!body) return;

    // Update database kontak
    db.upsertContact(sender, { name: pushName });
    db.incrementStats("totalMessages");

    // Cek maintenance mode
    if (db.getSetting("maintenance") && sender !== `${config.bot.ownerNumber}@s.whatsapp.net`) {
      await reply(sock, jid, "⚙️ *Bot sedang dalam maintenance.* Coba lagi nanti ya!", msg);
      return;
    }

    // Auto-read pesan jika aktif
    if (db.getSetting("autoRead")) {
      await sock.readMessages([msg.key]);
    }

    // Cek apakah pesan dimulai dengan prefix
    const prefix = config.bot.prefix;
    if (!body.startsWith(prefix)) return;

    // Parse command & args
    const args = body.slice(prefix.length).trim().split(/\s+/);
    const command = args.shift().toLowerCase();

    if (!command) return;

    // Cari plugin
    const plugin = plugins.get(command);
    if (!plugin) {
      await reply(
        sock,
        jid,
        `❌ Command *${prefix}${command}* tidak ditemukan.\nKetik *${prefix}menu* untuk melihat daftar fitur.`,
        msg
      );
      return;
    }

    // Kirim typing indicator
    await sock.sendPresenceUpdate("composing", jid);

    // Eksekusi plugin
    await plugin.execute({
      sock,
      msg,
      jid,
      sender,
      pushName,
      args,
      body,
      isGroup,
      reply: (text) => reply(sock, jid, text, msg),
      config,
      db,
    });

    db.incrementStats("commandsUsed");
    logger.info(`[EVA] Command [${prefix}${command}] dieksekusi oleh ${pushName} (${sender})`);
  } catch (err) {
    logger.error(`[EVA] Error saat handle pesan: ${err.message}`);
    console.error(err);
  } finally {
    // Matikan typing indicator
    const jid = msg.key.remoteJid;
    if (jid) await sock.sendPresenceUpdate("paused", jid).catch(() => {});
  }
}

// ── Export Plugin List (untuk endpoint /status) ──
export function getPluginList() {
  const list = {};
  plugins.forEach((plugin, cmd) => {
    list[cmd] = {
      description: plugin.description || "Tidak ada deskripsi",
      category: plugin.category || "General",
    };
  });
  return list;
}
