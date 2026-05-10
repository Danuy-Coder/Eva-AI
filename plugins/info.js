// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//       EVA AI — Plugin: Info & Ping
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const plugin = {
  command: ["ping", "info", "status"],
  description: "Cek status bot dan informasi sistem",
  category: "Umum",

  async execute({ reply, config, db }) {
    const start = Date.now();
    const stats = db.getStats();
    const uptime = process.uptime();

    // Format uptime
    const d = Math.floor(uptime / 86400);
    const h = Math.floor((uptime % 86400) / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);
    const uptimeStr = `${d}h ${h}j ${m}m ${s}d`;

    // Memory usage
    const mem = process.memoryUsage();
    const memMB = (mem.heapUsed / 1024 / 1024).toFixed(1);

    const ping = Date.now() - start;

    await reply(
      `━━━━『 🤖 EVA AI STATUS 』━━━━\n\n` +
      `🏷  *Nama:* ${config.bot.name}\n` +
      `🔖 *Versi:* v${config.bot.version}\n` +
      `🏓 *Ping:* ${ping}ms\n` +
      `⏱  *Uptime:* ${uptimeStr}\n` +
      `💾 *Memori:* ${memMB} MB\n` +
      `📨 *Total Pesan:* ${stats.totalMessages}\n` +
      `⚡ *Command Dijalankan:* ${stats.commandsUsed}\n` +
      `🛠  *Node.js:* ${process.version}\n` +
      `🌐 *Platform:* ${process.platform}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `✅ Bot berjalan normal!`
    );
  },
};

export default plugin;
