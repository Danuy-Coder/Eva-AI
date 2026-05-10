// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//         EVA AI — Plugin: Menu
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const plugin = {
  command: ["menu", "help", "bantuan"],
  description: "Tampilkan daftar semua perintah bot",
  category: "Umum",

  async execute({ pushName, reply, config }) {
    const now = new Date().toLocaleString("id-ID", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
    const prefix = config.bot.prefix;

    await reply(
      `━━━━『 🌟 EVA AI MENU 』━━━━\n\n` +
      `Halo, *${pushName}*! 👋\n` +
      `Saya *${config.bot.name}* v${config.bot.version}\n` +
      `📅 ${now}\n\n` +
      `━━━━『 🤖 AI & CHAT 』━━━━\n` +
      `│ ${prefix}ai <teks>    — Chat dengan Eva AI\n` +
      `│ ${prefix}eva <teks>   — Alias AI\n` +
      `│ ${prefix}tanya <teks> — Tanya sesuatu\n\n` +
      `━━━━『 ℹ️ INFORMASI 』━━━━\n` +
      `│ ${prefix}menu        — Tampilkan menu ini\n` +
      `│ ${prefix}ping        — Cek status bot\n` +
      `│ ${prefix}info        — Info bot\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `💡 Tambah fitur? Buat file di _plugins/_ folder!\n` +
      `🔧 Owner: ${config.bot.ownerName}`
    );
  },
};

export default plugin;
