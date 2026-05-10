// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//    EVA AI — Template Plugin Baru
//
//  Cara membuat plugin baru:
//  1. Copy file ini ke plugins/namafitur.js
//  2. Ubah command, description, category
//  3. Tulis logika di dalam execute()
//  4. Restart bot — plugin langsung aktif!
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const plugin = {
  // Perintah yang memicu plugin ini (bisa lebih dari satu alias)
  command: ["namacommand", "alias1", "alias2"],

  // Deskripsi singkat (ditampilkan di menu)
  description: "Deskripsi singkat fitur ini",

  // Kategori untuk pengelompokan di menu
  category: "Umum",

  /**
   * Fungsi utama plugin
   *
   * @param {object} ctx - Context dari eva.js
   * @param {object} ctx.sock        - Baileys socket (untuk kirim pesan)
   * @param {object} ctx.msg         - Raw message object dari Baileys
   * @param {string} ctx.jid         - JID tujuan (group atau personal)
   * @param {string} ctx.sender      - JID pengirim
   * @param {string} ctx.pushName    - Nama pengirim
   * @param {string[]} ctx.args      - Argumen setelah command
   * @param {string} ctx.body        - Isi pesan lengkap (termasuk prefix+command)
   * @param {boolean} ctx.isGroup    - Apakah pesan dari group?
   * @param {Function} ctx.reply     - Shortcut reply: reply("teks")
   * @param {object} ctx.config      - config.js
   * @param {object} ctx.db          - Database helper (db.js)
   */
  async execute({ sock, msg, jid, sender, pushName, args, body, isGroup, reply, config, db }) {
    // Contoh: ambil argumen pertama
    const input = args.join(" ").trim();

    if (!input) {
      // Jika tidak ada input
      return reply(
        `╭━━━『 🔧 NAMA FITUR 』━━━╮\n` +
        `│  Cara pakai:\n` +
        `│  ${config.bot.prefix}namacommand <input>\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━━━╯`
      );
    }

    // Tulis logika kamu di sini
    await reply(`✅ Halo ${pushName}! Input kamu: ${input}`);
  },
};

export default plugin;
