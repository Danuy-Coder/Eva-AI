// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//        EVA AI — Database Helper (JSON)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import fs from "fs";
import config from "./config.js";

const DB_PATH = config.database.path;

// Baca database dari file
function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { contacts: {}, stats: { totalMessages: 0, commandsUsed: 0, startedAt: null }, settings: { maintenance: false, autoRead: true } };
  }
}

// Tulis database ke file
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// Upsert kontak
function upsertContact(jid, info = {}) {
  const db = readDB();
  if (!db.contacts[jid]) {
    db.contacts[jid] = {
      jid,
      name: info.name || "Unknown",
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      messageCount: 0,
    };
  } else {
    db.contacts[jid].lastSeen = new Date().toISOString();
    if (info.name) db.contacts[jid].name = info.name;
  }
  db.contacts[jid].messageCount = (db.contacts[jid].messageCount || 0) + 1;
  writeDB(db);
  return db.contacts[jid];
}

// Tambah total pesan
function incrementStats(field = "totalMessages") {
  const db = readDB();
  db.stats[field] = (db.stats[field] || 0) + 1;
  writeDB(db);
}

// Set waktu mulai bot
function setStartedAt() {
  const db = readDB();
  if (!db.stats.startedAt) {
    db.stats.startedAt = new Date().toISOString();
    writeDB(db);
  }
}

// Ambil setting
function getSetting(key) {
  const db = readDB();
  return db.settings?.[key];
}

// Set setting
function setSetting(key, value) {
  const db = readDB();
  db.settings[key] = value;
  writeDB(db);
}

// Ambil stats
function getStats() {
  return readDB().stats;
}

// Ambil semua kontak
function getAllContacts() {
  return readDB().contacts;
}

export default {
  readDB,
  writeDB,
  upsertContact,
  incrementStats,
  setStartedAt,
  getSetting,
  setSetting,
  getStats,
  getAllContacts,
};
