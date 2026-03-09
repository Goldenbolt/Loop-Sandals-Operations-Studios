import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database('opsflow.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS team (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pass_id INTEGER,
    date TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'Not Started',
    assignee_id INTEGER,
    FOREIGN KEY(assignee_id) REFERENCES team(id)
  );

  CREATE TABLE IF NOT EXISTS finance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT DEFAULT CURRENT_TIMESTAMP,
    type TEXT NOT NULL, -- 'revenue' or 'expense'
    amount REAL NOT NULL,
    description TEXT,
    member_id INTEGER,
    FOREIGN KEY(member_id) REFERENCES team(id)
  );

  CREATE TABLE IF NOT EXISTS social_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_date TEXT NOT NULL,
    content TEXT NOT NULL,
    platform TEXT,
    assignee_id INTEGER,
    status TEXT DEFAULT 'Planned',
    FOREIGN KEY(assignee_id) REFERENCES team(id)
  );

  CREATE TABLE IF NOT EXISTS sales_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER,
    start_time TEXT NOT NULL,
    end_time TEXT,
    sales_closed INTEGER DEFAULT 0,
    total_revenue REAL DEFAULT 0,
    FOREIGN KEY(member_id) REFERENCES team(id)
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT
  );
`);

// Seed initial data if empty
const teamCount = db.prepare('SELECT count(*) as count FROM team').get() as { count: number };
if (teamCount.count === 0) {
  const insertTeam = db.prepare('INSERT INTO team (name, role) VALUES (?, ?)');
  ['Jeph', 'Pia', 'Carlo', 'Ashley', 'Kenri'].forEach(name => {
    insertTeam.run(name, 'Member');
  });
  
  const insertProduct = db.prepare('INSERT INTO products (name, price, category) VALUES (?, ?, ?)');
  insertProduct.run('Standard Ticket', 500, 'Event');
  insertProduct.run('VIP Pass', 1500, 'Event');
  insertProduct.run('Merchandise T-Shirt', 350, 'Merch');
  insertProduct.run('Sticker Pack', 100, 'Merch');
  insertProduct.run('Poster', 200, 'Merch');

  const insertEvent = db.prepare('INSERT INTO events (date, title, type) VALUES (?, ?, ?)');
  insertEvent.run('Jan 24 - 25', 'Patron of the Arts', 'pending');
  insertEvent.run('Jan 31 - Feb 1', 'The Weekend Pop Up', 'pending');
  insertEvent.run('April 11 - 12', 'Expo', 'important');
  insertEvent.run('April 16', 'Final Paper', 'important');
  insertEvent.run('April 22', 'Defense', 'important');

  const insertTask = db.prepare('INSERT INTO tasks (pass_id, date, title, status) VALUES (?, ?, ?, ?)');
  insertTask.run(1, 'Jan 15', 'Coverage', 'Not Started');
  insertTask.run(1, 'Jan 22', 'Presentation', 'Not Started');
  insertTask.run(1, 'Jan 26', 'Submission', 'Not Started');
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get('/api/data', (req, res) => {
    const team = db.prepare('SELECT * FROM team').all();
    const events = db.prepare('SELECT * FROM events').all();
    const tasks = db.prepare('SELECT * FROM tasks').all();
    const finance = db.prepare('SELECT f.*, t.name as member_name FROM finance f LEFT JOIN team t ON f.member_id = t.id').all();
    const socialPosts = db.prepare('SELECT s.*, t.name as assignee_name FROM social_posts s LEFT JOIN team t ON s.assignee_id = t.id').all();
    const products = db.prepare('SELECT * FROM products').all();
    const activeSessions = db.prepare('SELECT s.*, t.name as member_name FROM sales_sessions s JOIN team t ON s.member_id = t.id WHERE end_time IS NULL').all();
    
    res.json({ team, events, tasks, finance, socialPosts, products, activeSessions });
  });

  app.post('/api/finance', (req, res) => {
    const { type, amount, description, member_id } = req.body;
    const info = db.prepare('INSERT INTO finance (type, amount, description, member_id) VALUES (?, ?, ?, ?)').run(type, amount, description, member_id);
    res.json({ id: info.lastInsertRowid });
  });

  app.post('/api/social', (req, res) => {
    const { post_date, content, platform, assignee_id } = req.body;
    const info = db.prepare('INSERT INTO social_posts (post_date, content, platform, assignee_id) VALUES (?, ?, ?, ?)').run(post_date, content, platform, assignee_id);
    res.json({ id: info.lastInsertRowid });
  });

  app.post('/api/sales/start', (req, res) => {
    const { member_id } = req.body;
    const info = db.prepare('INSERT INTO sales_sessions (member_id, start_time) VALUES (?, ?)').run(member_id, new Date().toISOString());
    res.json({ id: info.lastInsertRowid });
  });

  app.post('/api/sales/end', (req, res) => {
    const { session_id, sales_closed, total_revenue } = req.body;
    db.prepare('UPDATE sales_sessions SET end_time = ?, sales_closed = ?, total_revenue = ? WHERE id = ?').run(new Date().toISOString(), sales_closed, total_revenue, session_id);
    res.json({ success: true });
  });

  app.post('/api/pos/transaction', (req, res) => {
    const { items, total, member_id } = req.body;
    // Simple implementation: add to finance as revenue
    db.prepare('INSERT INTO finance (type, amount, description, member_id) VALUES (?, ?, ?, ?)').run('revenue', total, `POS Sale: ${items.map((i: any) => i.name).join(', ')}`, member_id);
    res.json({ success: true });
  });

  // Generic Update Route for Admin
  app.post('/api/admin/update', (req, res) => {
    const { table, id, data } = req.body;
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    db.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?`).run(...values, id);
    res.json({ success: true });
  });

  app.post('/api/admin/add', (req, res) => {
    const { table, data } = req.body;
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const info = db.prepare(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`).run(...values);
    res.json({ id: info.lastInsertRowid });
  });

  app.post('/api/admin/delete', (req, res) => {
    const { table, id } = req.body;
    db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
