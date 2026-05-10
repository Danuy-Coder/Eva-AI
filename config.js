// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//          EVA AI — Configuration File
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const config = {
  // ── Bot Identity ──────────────────────────
  bot: {
    name: "Eva AI",
    version: "1.0.0",
    prefix: "!",                      // Ganti prefix command sesuai kebutuhan
    ownerNumber: "628xxxxxxxxxx",     // Nomor WA owner (format: 628xxx...)
    ownerName: "Owner",
  },

  // ── API Keys ──────────────────────────────
  api: {
    betabotz: {
      key: "Btz-Cynix",              // API Key Betabotz Anda
      baseUrl: "https://api.betabotz.eu.org",
    },
  },

  // ── AI Logic (system prompt untuk OpenAI Logic) ──
  ai: {
    logic: "Kamu adalah Eva, asisten AI yang cerdas, ramah, dan membantu. Jawab dengan bahasa yang sopan dan informatif.",
    maxResponseLength: 4000,
  },

  // ── Express / REST API ────────────────────
  server: {
    port: 3000,
    host: "0.0.0.0",                 // 0.0.0.0 agar bisa diakses dari luar VPS
    corsOrigins: "*",                 // Ganti dengan domain website Anda jika perlu
  },

  // ── Database ──────────────────────────────
  database: {
    path: "./database.json",
  },

  // ── Session / Auth ────────────────────────
  session: {
    folder: "./auth_info_baileys",
  },
};

export default config;
