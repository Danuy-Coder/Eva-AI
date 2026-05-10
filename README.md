# 🤖 Eva AI — WhatsApp Bot

Bot WhatsApp cerdas berbasis **Baileys Multi-Device** dengan sistem plugin modular dan REST API terintegrasi.

---

## 📁 Struktur Folder

```
eva-ai/
├── index.js          ← Entry point utama (Baileys + Express)
├── config.js         ← Konfigurasi API Key & pengaturan bot
├── eva.js            ← Message handler & plugin loader
├── db.js             ← Helper database JSON
├── database.json     ← Database lokal (auto-generated)
├── package.json
└── plugins/
    ├── ai.js         ← Plugin AI Chat (Betabotz OpenAI Logic)
    ├── menu.js       ← Plugin Menu
    ├── info.js       ← Plugin Info & Ping
    ├── owner.js      ← Plugin khusus Owner
    └── _template.js  ← Template untuk plugin baru
```

---

## 🚀 Cara Install & Jalankan

### 1. Upload ke VPS & Install dependencies
```bash
# Clone atau upload folder ke VPS
cd eva-ai
npm install
```

### 2. Konfigurasi
Edit `config.js`:
```js
ownerNumber: "628xxxxxxxxxx",   // Nomor WA owner tanpa +
key: "Btz-Cynix",              // API Key Betabotz kamu
```

### 3. Jalankan Bot
```bash
node index.js
```

### 4. Scan QR Code
Scan QR yang muncul di terminal menggunakan WhatsApp > Perangkat Tertaut.

---

## 🔌 Sistem Plugin

Tambah fitur baru hanya dengan membuat file di folder `plugins/`:

```js
// plugins/cuaca.js
const plugin = {
  command: ["cuaca"],
  description: "Cek cuaca kota",
  category: "Utilitas",
  async execute({ args, reply }) {
    const kota = args.join(" ");
    // ... logika kamu
    await reply(`Cuaca di ${kota}: ...`);
  },
};
export default plugin;
```

**Restart bot** → plugin langsung aktif!

---

## 🌐 REST API Endpoints

| Method | Endpoint     | Fungsi                         |
|--------|-------------|-------------------------------|
| GET    | `/`          | Status server                  |
| GET    | `/api/status`| Info bot, stats, plugin list   |
| POST   | `/api/chat`  | Chat dengan AI dari website    |

### Contoh POST /api/chat
```json
// Request
{ "message": "Apa itu AI?" }

// Response
{ "success": true, "reply": "AI adalah...", "model": "Eva AI (Betabotz)" }
```

---

## 📋 Daftar Command Default

| Command | Deskripsi |
|---------|-----------|
| `!ai <teks>` | Chat dengan Eva AI |
| `!menu` | Tampilkan daftar fitur |
| `!ping` | Cek status & uptime bot |
| `!info` | Info bot & statistik |
| `!maintenance on/off` | Mode maintenance (owner) |
| `!broadcast <pesan>` | Kirim pesan massal (owner) |

---

## 🛠 Tips VPS

Gunakan **PM2** agar bot tetap berjalan:
```bash
npm install -g pm2
pm2 start index.js --name "eva-ai"
pm2 save
pm2 startup
```

---

*Eva AI — Built with ❤️ using Baileys & Betabotz*
