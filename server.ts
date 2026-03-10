import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || 'memes.db';
const db = new Database(dbPath);

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS memes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    owner TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS likes (
    meme_id INTEGER,
    user_id TEXT,
    PRIMARY KEY (meme_id, user_id),
    FOREIGN KEY (meme_id) REFERENCES memes(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS global_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    score INTEGER DEFAULT 10
  );
  INSERT OR IGNORE INTO global_state (id, score) VALUES (1, 10);
`);

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: { origin: '*' }
  });
  const PORT = 3000;

  // Increase payload limit for base64 images
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  io.on('connection', (socket) => {
    // Send current score on connection
    const state = db.prepare('SELECT score FROM global_state WHERE id = 1').get() as any;
    socket.emit('score_update', state.score);

    socket.on('add_score', (points) => {
      db.prepare('UPDATE global_state SET score = MIN(score + ?, 824) WHERE id = 1').run(points);
      const newState = db.prepare('SELECT score FROM global_state WHERE id = 1').get() as any;
      io.emit('score_update', newState.score);
    });
  });

  // API Routes
  app.get('/api/memes', (req, res) => {
    try {
      const memes = db.prepare(`
        SELECT m.*, 
               GROUP_CONCAT(l.user_id) as likedBy
        FROM memes m
        LEFT JOIN likes l ON m.id = l.meme_id
        GROUP BY m.id
        ORDER BY m.created_at DESC
      `).all();

      const formattedMemes = memes.map((m: any) => ({
        id: m.id,
        url: m.url,
        owner: m.owner,
        likes: m.likes,
        likedBy: m.likedBy ? m.likedBy.split(',') : []
      }));

      res.json(formattedMemes);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch memes' });
    }
  });

  app.post('/api/memes', (req, res) => {
    try {
      const { url, owner } = req.body;
      if (!url || !owner) return res.status(400).json({ error: 'Missing url or owner' });

      const stmt = db.prepare('INSERT INTO memes (url, owner) VALUES (?, ?)');
      const info = stmt.run(url, owner);
      
      io.emit('memes_update'); // Notify all clients
      res.json({ id: info.lastInsertRowid, url, owner, likes: 0, likedBy: [] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create meme' });
    }
  });

  app.post('/api/memes/:id/like', (req, res) => {
    try {
      const memeId = req.params.id;
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: 'Missing userId' });

      const existingLike = db.prepare('SELECT * FROM likes WHERE meme_id = ? AND user_id = ?').get(memeId, userId);

      if (existingLike) {
        // Unlike
        db.prepare('DELETE FROM likes WHERE meme_id = ? AND user_id = ?').run(memeId, userId);
        db.prepare('UPDATE memes SET likes = likes - 1 WHERE id = ?').run(memeId);
      } else {
        // Like
        db.prepare('INSERT INTO likes (meme_id, user_id) VALUES (?, ?)').run(memeId, userId);
        db.prepare('UPDATE memes SET likes = likes + 1 WHERE id = ?').run(memeId);
      }

      io.emit('memes_update'); // Notify all clients
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to toggle like' });
    }
  });

  app.delete('/api/memes/:id', (req, res) => {
    try {
      const memeId = req.params.id;
      const { userId, isAdmin } = req.body;
      
      const meme = db.prepare('SELECT owner FROM memes WHERE id = ?').get(memeId) as any;
      if (!meme) return res.status(404).json({ error: 'Meme not found' });

      if (meme.owner !== userId && !isAdmin) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      db.prepare('DELETE FROM likes WHERE meme_id = ?').run(memeId);
      db.prepare('DELETE FROM memes WHERE id = ?').run(memeId);

      io.emit('memes_update'); // Notify all clients
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete meme' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.use(express.static(path.join(__dirname, 'public'))); // Fallback for files uploaded after build
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
