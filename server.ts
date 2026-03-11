import express from 'express';
import { createServer as createViteServer } from 'vite';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tab TEXT,
      name TEXT,
      category TEXT,
      occasion TEXT,
      color TEXT,
      brand TEXT,
      price TEXT,
      image TEXT,
      url TEXT,
      purchaseDate TEXT,
      usageCount INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS looks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      items TEXT
    );
    CREATE TABLE IF NOT EXISTS inspirations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      image TEXT,
      url TEXT
    );
  `);

  // API Routes
  app.get('/api/data', async (req, res) => {
    const items = await db.all('SELECT * FROM items ORDER BY id DESC');
    const looksRaw = await db.all('SELECT * FROM looks ORDER BY id DESC');
    const inspirations = await db.all('SELECT * FROM inspirations ORDER BY id DESC');

    const wardrobe = items.filter(i => i.tab === 'wardrobe');
    const wishlist = items.filter(i => i.tab === 'wishlist');
    const looks = looksRaw.map(l => ({ ...l, items: JSON.parse(l.items) }));

    res.json({ wardrobe, wishlist, looks, inspirations });
  });

  app.post('/api/items', async (req, res) => {
    const { tab, name, category, occasion, color, brand, price, image, url, purchaseDate, usageCount } = req.body;
    const result = await db.run(
      'INSERT INTO items (tab, name, category, occasion, color, brand, price, image, url, purchaseDate, usageCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [tab, name, category, occasion, color, brand, price, image, url, purchaseDate, usageCount || 0]
    );
    res.json({ id: result.lastID });
  });

  app.put('/api/items/:id', async (req, res) => {
    const { tab, name, category, occasion, color, brand, price, image, url, purchaseDate, usageCount } = req.body;
    await db.run(
      'UPDATE items SET tab = ?, name = ?, category = ?, occasion = ?, color = ?, brand = ?, price = ?, image = ?, url = ?, purchaseDate = ?, usageCount = ? WHERE id = ?',
      [tab, name, category, occasion, color, brand, price, image, url, purchaseDate, usageCount, req.params.id]
    );
    res.json({ success: true });
  });

  app.delete('/api/items/:id', async (req, res) => {
    await db.run('DELETE FROM items WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  app.post('/api/looks', async (req, res) => {
    const { name, items } = req.body;
    const result = await db.run('INSERT INTO looks (name, items) VALUES (?, ?)', [name, JSON.stringify(items)]);
    res.json({ id: result.lastID });
  });

  app.delete('/api/looks/:id', async (req, res) => {
    await db.run('DELETE FROM looks WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  app.post('/api/inspirations', async (req, res) => {
    const { name, image, url } = req.body;
    const result = await db.run('INSERT INTO inspirations (name, image, url) VALUES (?, ?, ?)', [name, image, url]);
    res.json({ id: result.lastID });
  });

  app.delete('/api/inspirations/:id', async (req, res) => {
    await db.run('DELETE FROM inspirations WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(\`Server running on http://localhost:\${PORT}\`);
  });
}

startServer();
