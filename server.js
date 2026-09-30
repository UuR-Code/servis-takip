const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Anti-caching middleware for all requests
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Static files with zero cache
app.use(express.static(path.join(__dirname, 'public'), {
  etag: false,
  maxAge: 0,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// Data directory
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Database implementation: Try built-in node:sqlite, fallback to JSON file store
let db = null;
let useSqlite = false;

try {
  const { DatabaseSync } = require('node:sqlite');
  const dbPath = path.join(DATA_DIR, 'servis.db');
  db = new DatabaseSync(dbPath);
  useSqlite = true;

  // Initialize SQLite tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS personnel (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS roster (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      shift TEXT NOT NULL,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      pickup_time TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(date, shift, type, name)
    );
  `);

  // Ensure phone column exists
  try {
    db.exec('ALTER TABLE personnel ADD COLUMN phone TEXT');
  } catch (e) {
    // Column already exists
  }

  // Seed initial personnel if empty
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM personnel');
  const { count } = countStmt.get();
  if (count === 0) {
    const defaultPersonnel = [
      { name: 'Alparslan', phone: '05530341346' },
      { name: 'Aykut', phone: '05530341339' },
      { name: 'Barbaros', phone: '05055161694' },
      { name: 'Berat', phone: '05545541205' },
      { name: 'İlhan', phone: '05068101027' },
      { name: 'Mehmet', phone: '05051759712' },
      { name: 'Uğur', phone: '05544647061' },
      { name: 'Yunus', phone: '05532797009' },
      { name: 'Yusuf', phone: '05545541614' },
      { name: 'Zafer', phone: '05385081868' }
    ];
    const insertStmt = db.prepare('INSERT OR IGNORE INTO personnel (name, phone) VALUES (?, ?)');
    defaultPersonnel.forEach(p => insertStmt.run(p.name, p.phone));
  }

  console.log('✅ SQLite veritabanı aktif (node:sqlite):', dbPath);
} catch (err) {
  console.log('⚠️ node:sqlite kullanılamadı, JSON dosya veritabanına geçiliyor:', err.message);
  useSqlite = false;
}

// JSON Database Fallback
const JSON_FILE = path.join(DATA_DIR, 'servis_data.json');
function readJsonDb() {
  if (!fs.existsSync(JSON_FILE)) {
    const initialData = {
      personnel: [
        { id: 1, name: 'Alparslan' },
        { id: 2, name: 'Aykut' },
        { id: 3, name: 'Barbaros' },
        { id: 4, name: 'Berat' },
        { id: 5, name: 'İlhan' },
        { id: 6, name: 'Mehmet' },
        { id: 7, name: 'Uğur' },
        { id: 8, name: 'Yunus' },
        { id: 9, name: 'Yusuf' },
        { id: 10, name: 'Zafer' }
      ],
      roster: []
    };
    fs.writeFileSync(JSON_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    return JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));
  } catch (e) {
    return { personnel: [], roster: [] };
  }
}

function writeJsonDb(data) {
  fs.writeFileSync(JSON_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Helper: Calculate next day string
function getNextDay(dateStr) {
  const parts = dateStr.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Helper: Calculate previous day string
function getPrevDay(dateStr) {
  const parts = dateStr.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ================= API ENDPOINTS =================

// 1. Get Personnel List
// 1. Get Personnel List (with phone)
app.get('/api/personnel', (req, res) => {
  try {
    if (useSqlite) {
      const rows = db.prepare('SELECT id, name, phone FROM personnel ORDER BY name COLLATE NOCASE ASC').all();
      return res.json(rows);
    } else {
      const data = readJsonDb();
      data.personnel.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
      return res.json(data.personnel);
    }
  } catch (error) {
    console.error('Error fetching personnel:', error);
    res.status(500).json({ error: 'Personel listesi alınamadı' });
  }
});

// Update Personnel Phone
app.patch('/api/personnel/:name/phone', (req, res) => {
  const name = req.params.name;
  const { phone } = req.body;
  const cleanPhone = phone ? String(phone).replace(/[^0-9]/g, '') : null;

  try {
    if (useSqlite) {
      db.prepare('UPDATE personnel SET phone = ? WHERE name = ?').run(cleanPhone, name);
      return res.json({ success: true, name, phone: cleanPhone });
    } else {
      const data = readJsonDb();
      const p = data.personnel.find(x => x.name === name);
      if (p) p.phone = cleanPhone;
      writeJsonDb(data);
      return res.json({ success: true, name, phone: cleanPhone });
    }
  } catch (error) {
    console.error('Error updating personnel phone:', error);
    res.status(500).json({ error: 'Telefon numarası kaydedilemedi' });
  }
});

// 2. Add New Personnel
app.post('/api/personnel', (req, res) => {
  const { name, phone } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'İsim alanı zorunludur' });
  }
  const cleanName = name.trim();
  const cleanPhone = phone ? String(phone).replace(/[^0-9]/g, '') : null;

  try {
    if (useSqlite) {
      const stmt = db.prepare('INSERT INTO personnel (name, phone) VALUES (?, ?)');
      const info = stmt.run(cleanName, cleanPhone);
      return res.json({ id: Number(info.lastInsertRowid), name: cleanName, phone: cleanPhone });
    } else {
      const data = readJsonDb();
      if (data.personnel.some(p => p.name.toLowerCase() === cleanName.toLowerCase())) {
        return res.status(400).json({ error: 'Bu isim zaten mevcut' });
      }
      const newPerson = { id: Date.now(), name: cleanName, phone: cleanPhone };
      data.personnel.push(newPerson);
      writeJsonDb(data);
      return res.json(newPerson);
    }
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Bu isim zaten mevcut' });
    }
    console.error('Error adding personnel:', error);
    res.status(500).json({ error: 'Personel eklenemedi' });
  }
});

// Update Personnel (Name and/or Phone)
app.put('/api/personnel/:identifier', (req, res) => {
  const identifier = req.params.identifier;
  const { name, phone } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'İsim alanı zorunludur' });
  }
  const cleanName = name.trim();
  const cleanPhone = phone ? String(phone).replace(/[^0-9]/g, '') : null;

  try {
    if (useSqlite) {
      const isNum = !isNaN(Number(identifier));
      const current = isNum 
        ? db.prepare('SELECT id, name, phone FROM personnel WHERE id = ?').get(Number(identifier))
        : db.prepare('SELECT id, name, phone FROM personnel WHERE name = ?').get(identifier);

      if (!current) {
        return res.status(404).json({ error: 'Personel bulunamadı' });
      }

      if (current.name !== cleanName) {
        const existing = db.prepare('SELECT id FROM personnel WHERE name = ? AND id != ?').get(cleanName, current.id);
        if (existing) {
          return res.status(400).json({ error: 'Bu isimde başka bir personel zaten var' });
        }
        db.prepare('UPDATE roster SET name = ? WHERE name = ?').run(cleanName, current.name);
      }

      db.prepare('UPDATE personnel SET name = ?, phone = ? WHERE id = ?').run(cleanName, cleanPhone, current.id);
      return res.json({ id: current.id, name: cleanName, phone: cleanPhone });
    } else {
      const data = readJsonDb();
      const p = data.personnel.find(x => String(x.id) === String(identifier) || x.name === identifier);
      if (!p) {
        return res.status(404).json({ error: 'Personel bulunamadı' });
      }
      if (p.name !== cleanName) {
        if (data.personnel.some(x => x.id !== p.id && x.name.toLowerCase() === cleanName.toLowerCase())) {
          return res.status(400).json({ error: 'Bu isimde başka bir personel zaten var' });
        }
        const oldName = p.name;
        data.roster.forEach(r => { if (r.name === oldName) r.name = cleanName; });
      }
      p.name = cleanName;
      p.phone = cleanPhone;
      writeJsonDb(data);
      return res.json(p);
    }
  } catch (error) {
    console.error('Error updating personnel:', error);
    res.status(500).json({ error: 'Personel güncellenemedi' });
  }
});

// 3. Delete Personnel (by ID or Name)
app.delete('/api/personnel/:identifier', (req, res) => {
  const identifier = req.params.identifier;
  try {
    if (useSqlite) {
      const isNum = !isNaN(Number(identifier));
      if (isNum) {
        db.prepare('DELETE FROM personnel WHERE id = ?').run(Number(identifier));
      } else {
        db.prepare('DELETE FROM personnel WHERE name = ?').run(identifier);
      }
      return res.json({ success: true });
    } else {
      const data = readJsonDb();
      data.personnel = data.personnel.filter(p => String(p.id) !== String(identifier) && p.name !== identifier);
      writeJsonDb(data);
      return res.json({ success: true });
    }
  } catch (error) {
    console.error('Error deleting personnel:', error);
    res.status(500).json({ error: 'Personel silinemedi' });
  }
});

function getShiftsForDate(dateStr) {
  let rows = [];
  if (useSqlite) {
    rows = db.prepare(`
      SELECT r.*, p.phone 
      FROM roster r 
      LEFT JOIN personnel p ON r.name = p.name 
      WHERE r.date = ? 
      ORDER BY r.id ASC
    `).all(dateStr);
  } else {
    const data = readJsonDb();
    rows = data.roster.filter(r => r.date === dateStr).map(r => {
      const p = data.personnel.find(x => x.name === r.name);
      return { ...r, phone: p ? p.phone : null };
    });
  }

  // 1. Saate Göre Sıralama (Toplama): Saati olanlar kronolojik küçükten büyüğe, saatsizler altta
  function sortToplama(list) {
    return list.slice().sort((a, b) => {
      const tA = a.pickup_time ? a.pickup_time.trim() : null;
      const tB = b.pickup_time ? b.pickup_time.trim() : null;
      if (tA && tB) return tA.localeCompare(tB);
      if (tA && !tB) return -1;
      if (!tA && tB) return 1;
      return a.id - b.id;
    });
  }

  return {
    '07:00': {
      toplama: sortToplama(rows.filter(r => r.shift === '07:00' && r.type === 'toplama')),
      dagitim: rows.filter(r => r.shift === '07:00' && r.type === 'dagitim')
    },
    '15:00': {
      toplama: sortToplama(rows.filter(r => r.shift === '15:00' && r.type === 'toplama')),
      dagitim: rows.filter(r => r.shift === '15:00' && r.type === 'dagitim')
    },
    '23:00': {
      toplama: sortToplama(rows.filter(r => r.shift === '23:00' && r.type === 'toplama')),
      dagitim: rows.filter(r => r.shift === '23:00' && r.type === 'dagitim')
    }
  };
}

// 4. Get ALL Shifts for Today AND Tomorrow
// Query: ?date=YYYY-MM-DD
app.get('/api/roster/day', (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'date parametresi gereklidir' });
  }

  const prevDate = getPrevDay(date);
  const nextDate = getNextDay(date);
  const afterNextDate = getNextDay(nextDate);

  try {
    const yesterdayShifts = getShiftsForDate(prevDate);
    const todayShifts = getShiftsForDate(date);
    const tomorrowShifts = getShiftsForDate(nextDate);

    let nextDay07Dagitim = [];
    if (useSqlite) {
      nextDay07Dagitim = db.prepare('SELECT * FROM roster WHERE date = ? AND shift = ? AND type = ? ORDER BY id ASC').all(afterNextDate, '07:00', 'dagitim');
    } else {
      const data = readJsonDb();
      nextDay07Dagitim = data.roster.filter(r => r.date === afterNextDate && r.shift === '07:00' && r.type === 'dagitim');
    }

    const result = {
      date,
      prevDate,
      nextDate,
      shifts: todayShifts, // for backward compatibility
      yesterday: yesterdayShifts,
      today: todayShifts,
      tomorrow: {
        ...tomorrowShifts,
        'next_07:00': {
          dagitim: nextDay07Dagitim
        }
      }
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching day roster:', error);
    res.status(500).json({ error: 'Günlük liste alınamadı' });
  }
});

// 5. Add Person to Roster (by passenger - no time required)
app.post('/api/roster', (req, res) => {
  const { date, shift, type, name, pickup_time } = req.body;
  if (!date || !shift || !type || !name) {
    return res.status(400).json({ error: 'date, shift, type ve name zorunludur' });
  }

  const timeVal = pickup_time ? pickup_time.trim() : null;

  try {
    if (useSqlite) {
      // Check duplicate
      const checkStmt = db.prepare('SELECT id FROM roster WHERE date = ? AND shift = ? AND type = ? AND name = ?');
      const existing = checkStmt.get(date, shift, type, name);
      if (existing) {
        return res.status(400).json({ error: `${name} zaten bu listeye ekli!` });
      }

      const stmt = db.prepare(`
        INSERT INTO roster (date, shift, type, name, pickup_time)
        VALUES (?, ?, ?, ?, ?)
      `);
      const info = stmt.run(date, shift, type, name, timeVal);
      return res.json({ id: Number(info.lastInsertRowid), date, shift, type, name, pickup_time: timeVal });
    } else {
      const data = readJsonDb();
      const existing = data.roster.some(
        r => r.date === date && r.shift === shift && r.type === type && r.name === name
      );
      if (existing) {
        return res.status(400).json({ error: `${name} zaten bu listeye ekli!` });
      }

      const newItem = {
        id: Date.now(),
        date,
        shift,
        type,
        name,
        pickup_time: timeVal,
        created_at: new Date().toISOString()
      };
      data.roster.push(newItem);
      writeJsonDb(data);
      return res.json(newItem);
    }
  } catch (error) {
    console.error('Error adding to roster:', error);
    res.status(500).json({ error: 'Listeye eklenirken hata oluştu' });
  }
});

// 6. Update Pickup Time (by driver or manager)
app.patch('/api/roster/:id/time', (req, res) => {
  const id = Number(req.params.id);
  const { pickup_time } = req.body;
  const timeVal = pickup_time ? pickup_time.trim() : null;

  try {
    if (useSqlite) {
      db.prepare('UPDATE roster SET pickup_time = ? WHERE id = ?').run(timeVal, id);
      return res.json({ success: true, id, pickup_time: timeVal });
    } else {
      const data = readJsonDb();
      const item = data.roster.find(r => r.id === id);
      if (item) {
        item.pickup_time = timeVal;
        writeJsonDb(data);
      }
      return res.json({ success: true, id, pickup_time: timeVal });
    }
  } catch (error) {
    console.error('Error updating pickup time:', error);
    res.status(500).json({ error: 'Saat güncellenemedi' });
  }
});

// 7. Delete Person from Roster
app.delete('/api/roster/:id', (req, res) => {
  const id = Number(req.params.id);
  try {
    if (useSqlite) {
      db.prepare('DELETE FROM roster WHERE id = ?').run(id);
      return res.json({ success: true });
    } else {
      const data = readJsonDb();
      data.roster = data.roster.filter(r => r.id !== id);
      writeJsonDb(data);
      return res.json({ success: true });
    }
  } catch (error) {
    console.error('Error deleting from roster:', error);
    res.status(500).json({ error: 'Listeden silinemedi' });
  }
});

// Fallback to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ServisPlan Sunucusu çalışıyor: http://localhost:${PORT}`);
});
