// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//      EVA AI — Plugin: Owner Commands
//    (Hanya bisa digunakan oleh owner bot)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const plugin = {
  command: ["maintenance", "setmaintenance", "broadcast"],
  description: "Perintah khusus owner bot",
  category: "Owner",

  async execute({ sock, msg, jid, sender, args, reply, config, db }) {
    const ownerJid = `${config.bot.ownerNumber}@s.whatsapp.net`;

    // Cek apakah pengirim adalah owner
    if (sender !== ownerJid) {
      return reply("🚫 Perintah ini hanya untuk *owner* bot!");
    }

    // Tentukan sub-command dari pesan asli
    const body = args[-1] || ""; // body sudah dipotong prefix+command
    const cmd = msg.message?.conversation?.split(" ")[0]?.slice(config.bot.prefix.length).toLowerCase() ||
                msg.message?.extendedTextMessage?.text?.split(" ")[0]?.slice(config.bot.prefix.length).toLowerCase();

    // ── !maintenance on/off ──────────────
    if (cmd === "maintenance" || cmd === "setmaintenance") {
      const value = args[0]?.toLowerCase();
      if (value === "on" || value === "1") {
        db.setSetting("maintenance", true);
        return reply("⚙️ Mode *maintenance* diaktifkan. Bot tidak akan merespons pengguna biasa.");
      } else if (value === "off" || value === "0") {
        db.setSetting("maintenance", false);
        return reply("✅ Mode *maintenance* dinonaktifkan. Bot kembali normal.");
      }
      const current = db.getSetting("maintenance");
      return reply(`⚙️ Status maintenance: *${current ? "ON" : "OFF"}*\nGunakan: !maintenance on/off`);
    }

    // ── !broadcast <pesan> ───────────────
    if (cmd === "broadcast") {
      const text = args.join(" ").trim();
      if (!text) return reply("❌ Masukkan pesan broadcast!\nContoh: !broadcast Halo semua!");

      const contacts = db.getAllContacts();
      const jids = Object.keys(contacts);

      if (jids.length === 0) return reply("📭 Belum ada kontak tersimpan di database.");

      let sent = 0;
      let failed = 0;

      await reply(`📢 Memulai broadcast ke *${jids.length}* kontak...`);

      for (const targetJid of jids) {
        try {
          await sock.sendMessage(targetJid, {
            text: `📢 *[BROADCAST EVA AI]*\n\n${text}`,
          });
          sent++;
          // Delay kecil agar tidak terkena rate limit WA
          await new Promise((r) => setTimeout(r, 1000));
        } catch {
          failed++;
        }
      }

      return reply(`✅ Broadcast selesai!\n📤 Terkirim: ${sent}\n❌ Gagal: ${failed}`);
    }
  },
};

export default plugin;
