// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//         EVA AI — Plugin: AI Chat
//   Menggunakan Betabotz OpenAI Logic API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import axios from "axios";

const plugin = {
  command: ["ai", "eva", "chat", "tanya"],
  description: "Chat dengan Eva AI — asisten cerdas berbasis OpenAI",
  category: "AI",

  async execute({ sock, msg, jid, sender, pushName, args, reply, config }) {
    const query = args.join(" ").trim();

    if (!query) {
      return reply(
        `╭━━━『 🤖 EVA AI ASSISTANT 』━━━╮\n` +
        `│\n` +
        `│  Halo, ${pushName}! 👋\n` +
        `│  Saya adalah *Eva AI*, asisten\n` +
        `│  pintarmu siap membantu!\n` +
        `│\n` +
        `│  📌 *Cara pakai:*\n` +
        `│  !ai <pertanyaanmu>\n` +
        `│\n` +
        `│  💡 *Contoh:*\n` +
        `│  !ai Apa itu machine learning?\n` +
        `│  !ai Buat puisi tentang hujan\n` +
        `│  !ai Jelaskan fotosintesis\n` +
        `│\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
      );
    }

    // Indikator loading
    await reply(
      `╭━━━『 🤖 EVA AI ASSISTANT 』━━━╮\n` +
      `│  ⏳ Sedang memproses...\n` +
      `│  Pertanyaan: _${query}_\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
    );

    try {
      const url = `${config.api.betabotz.baseUrl}/api/search/openai-logic`;
      const response = await axios.get(url, {
        params: {
          text: query,
          logic: config.ai.logic,
          apikey: config.api.betabotz.key,
        },
        timeout: 30000,
      });

      const data = response.data;

      // Fleksibel: sesuaikan field hasil API Betabotz
      const result =
        data?.result ||
        data?.message ||
        data?.data?.result ||
        data?.answer ||
        "Maaf, saya tidak dapat memproses pertanyaan itu saat ini.";

      // Potong jika terlalu panjang
      const maxLen = config.ai.maxResponseLength || 3000;
      const truncated = result.length > maxLen ? result.slice(0, maxLen) + "\n\n_[... respons dipotong]_" : result;

      const now = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

      await reply(
        `━━━━『 🤖 EVA AI ASSISTANT 』━━━━\n\n` +
        `👤 *${pushName}:* ${query}\n\n` +
        `🌟 *Eva AI:*\n${truncated}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `⏱ ${now} • Eva AI v${config.bot.version}`
      );
    } catch (err) {
      console.error("[AI Plugin Error]", err.message);

      // Pesan error yang informatif
      let errMsg = "Terjadi kesalahan saat menghubungi AI.";
      if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") {
        errMsg = "⏱ Waktu habis! API AI sedang lambat. Coba lagi sebentar.";
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        errMsg = "🔑 API Key tidak valid atau kedaluwarsa.";
      } else if (err.response?.status === 429) {
        errMsg = "🚦 Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.";
      } else if (err.response?.status >= 500) {
        errMsg = "🔧 Server AI sedang bermasalah. Coba lagi nanti.";
      }

      await reply(
        `╭━━━『 🤖 EVA AI ASSISTANT 』━━━╮\n` +
        `│  ❌ *Error!*\n` +
        `│  ${errMsg}\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
      );
    }
  },
};

export default plugin;
