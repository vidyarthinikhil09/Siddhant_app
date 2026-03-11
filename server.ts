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
    score INTEGER DEFAULT 28
  );
  INSERT OR IGNORE INTO global_state (id, score) VALUES (1, 28);
  UPDATE global_state SET score = 28 WHERE id = 1 AND score > 100; -- Force reset if it was very high
  CREATE TABLE IF NOT EXISTS device_tracking (
    device_id TEXT PRIMARY KEY,
    last_daily_claim TEXT,
    quiz_completed INTEGER DEFAULT 0,
    quiz_score INTEGER DEFAULT NULL,
    user_name TEXT,
    user_icon TEXT,
    streak INTEGER DEFAULT 0,
    badges TEXT DEFAULT '[]'
  );
  CREATE TABLE IF NOT EXISTS points_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT,
    points INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES device_tracking(device_id)
  );
`);

try {
  db.exec('ALTER TABLE device_tracking ADD COLUMN quiz_score INTEGER DEFAULT NULL');
} catch (e) {}
try {
  db.exec('ALTER TABLE device_tracking ADD COLUMN user_name TEXT');
} catch (e) {}
try {
  db.exec('ALTER TABLE device_tracking ADD COLUMN user_icon TEXT');
} catch (e) {}
try {
  db.exec('ALTER TABLE device_tracking ADD COLUMN streak INTEGER DEFAULT 0');
} catch (e) {}
try {
  db.exec('ALTER TABLE device_tracking ADD COLUMN badges TEXT DEFAULT "[]"');
} catch (e) {}

// Migration for points_history
try {
  db.exec('ALTER TABLE points_history ADD COLUMN type TEXT DEFAULT "streak"');
} catch (e) {}

try {
  const countRes = db.prepare('SELECT COUNT(*) as count FROM points_history').get() as any;
  const hasQuizType = db.prepare('SELECT COUNT(*) as count FROM points_history WHERE type = "quiz"').get() as any;
  
  if (countRes.count === 0 || hasQuizType.count === 0) {
    // Rebuild points_history to ensure quiz scores are fully counted
    db.exec('DELETE FROM points_history');
    const users = db.prepare('SELECT * FROM device_tracking').all() as any[];
    const insertPt = db.prepare('INSERT INTO points_history (device_id, points, type, created_at) VALUES (?, ?, ?, ?)');
    const now = new Date().toISOString();
    db.transaction(() => {
      for (const u of users) {
        if (u.streak > 0) insertPt.run(u.device_id, u.streak, 'streak', now);
        if (u.quiz_completed === 1 && u.quiz_score !== null) {
          // Award actual quiz score points
          insertPt.run(u.device_id, u.quiz_score, 'quiz', now);
        }
      }
    })();
  }
} catch (e) {
  console.error("Migration error:", e);
}

// Reset the score to 28 as requested
db.prepare('UPDATE global_state SET score = 28 WHERE id = 1').run();

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

  const addGlobalScore = (points: number) => {
    db.prepare('UPDATE global_state SET score = MIN(score + ?, 824) WHERE id = 1').run(points);
    const newState = db.prepare('SELECT score FROM global_state WHERE id = 1').get() as any;
    io.emit('score_update', newState.score);
  };

  io.on('connection', (socket) => {
    // Send current score on connection
    const state = db.prepare('SELECT score FROM global_state WHERE id = 1').get() as any;
    socket.emit('score_update', state.score);

    socket.on('check_device', (deviceId) => {
      if (!deviceId) return;
      const record = db.prepare('SELECT * FROM device_tracking WHERE device_id = ?').get(deviceId) as any;
      if (record) {
        socket.emit('device_status', {
          quizCompleted: record.quiz_completed === 1,
          quizScore: record.quiz_score
        });
        socket.emit('profile_update', {
          streak: record.streak || 0,
          badges: JSON.parse(record.badges || '[]')
        });
      }
    });

    socket.on('claim_daily', ({ deviceId, userName, userIcon }) => {
      if (!deviceId) return;
      const today = new Date().toISOString().split('T')[0];
      const record = db.prepare('SELECT * FROM device_tracking WHERE device_id = ?').get(deviceId) as any;
      
      let currentStreak = 0;
      let newBadges = [];

      if (!record) {
        currentStreak = 1;
        db.prepare(`
          INSERT INTO device_tracking (device_id, last_daily_claim, user_name, user_icon, streak, badges) 
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(deviceId, today, userName, userIcon, currentStreak, JSON.stringify([]));
        db.prepare('INSERT INTO points_history (device_id, points, type) VALUES (?, 1, "streak")').run(deviceId);
        addGlobalScore(1);
        socket.emit('points_awarded', 1);
      } else {
        // Update name and icon if provided
        if (userName && userIcon) {
          db.prepare('UPDATE device_tracking SET user_name = ?, user_icon = ? WHERE device_id = ?').run(userName, userIcon, deviceId);
        }

        if (record.last_daily_claim !== today) {
          const lastDate = record.last_daily_claim ? new Date(record.last_daily_claim) : null;
          const currentDate = new Date(today);
          let diffDays = 1;
          if (lastDate) {
            const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
            diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          }

          if (diffDays === 1) {
            currentStreak = (record.streak || 0) + 1;
          } else if (diffDays > 1) {
            currentStreak = 1;
          } else {
            currentStreak = record.streak || 0;
          }

          // Badge logic
          const existingBadges = JSON.parse(record.badges || '[]');
          const newlyEarnedBadges: string[] = [];
          
          if (currentStreak >= 3 && !existingBadges.includes('3_day_streak')) newlyEarnedBadges.push('3_day_streak');
          if (currentStreak >= 7 && !existingBadges.includes('7_day_streak')) newlyEarnedBadges.push('7_day_streak');
          if (currentStreak >= 14 && !existingBadges.includes('14_day_streak')) newlyEarnedBadges.push('14_day_streak');
          if (currentStreak >= 30 && !existingBadges.includes('30_day_streak')) newlyEarnedBadges.push('30_day_streak');

          newBadges = [...existingBadges, ...newlyEarnedBadges];

          db.prepare('UPDATE device_tracking SET last_daily_claim = ?, streak = ?, badges = ? WHERE device_id = ?')
            .run(today, currentStreak, JSON.stringify(newBadges), deviceId);
            
          db.prepare('INSERT INTO points_history (device_id, points, type) VALUES (?, 1, "streak")').run(deviceId);
          addGlobalScore(1);
          socket.emit('points_awarded', 1);
          
          if (newlyEarnedBadges.length > 0) {
            socket.emit('badges_earned', newlyEarnedBadges);
          }
        } else {
          currentStreak = record.streak || 0;
          newBadges = JSON.parse(record.badges || '[]');
        }
      }

      // Send back updated profile
      socket.emit('profile_update', { streak: currentStreak, badges: newBadges });
      
      // Broadcast leaderboard update signal
      io.emit('leaderboard_update');
    });

    socket.on('claim_quiz', ({ deviceId, score }) => {
      if (!deviceId) return;
      const record = db.prepare('SELECT * FROM device_tracking WHERE device_id = ?').get(deviceId) as any;
      // Award actual quiz score points
      const pts = score;
      
      if (!record) {
        db.prepare('INSERT INTO device_tracking (device_id, quiz_completed, quiz_score) VALUES (?, 1, ?)').run(deviceId, score);
        db.prepare('INSERT INTO points_history (device_id, points, type) VALUES (?, ?, "quiz")').run(deviceId, pts);
        addGlobalScore(pts);
        socket.emit('points_awarded', pts);
      } else if (!record.quiz_completed) {
        db.prepare('UPDATE device_tracking SET quiz_completed = 1, quiz_score = ? WHERE device_id = ?').run(score, deviceId);
        db.prepare('INSERT INTO points_history (device_id, points, type) VALUES (?, ?, "quiz")').run(deviceId, pts);
        addGlobalScore(pts);
        socket.emit('points_awarded', pts);
      }
    });
  });

  // API Routes
  app.get('/api/leaderboard', (req, res) => {
    try {
      const timeframe = req.query.timeframe || 'all_time';
      let dateFilter = '';
      if (timeframe === 'weekly') {
        dateFilter = "AND ph.created_at >= datetime('now', '-7 days')";
      } else if (timeframe === 'monthly') {
        dateFilter = "AND ph.created_at >= datetime('now', '-30 days')";
      }

      const query = `
        SELECT dt.user_name, dt.user_icon, dt.badges, SUM(ph.points) as score
        FROM device_tracking dt
        JOIN points_history ph ON dt.device_id = ph.device_id
        WHERE dt.user_name IS NOT NULL ${dateFilter}
        GROUP BY dt.device_id
        HAVING score > 0
        ORDER BY score DESC
        LIMIT 50
      `;
      const leaderboard = db.prepare(query).all();
      res.json(leaderboard);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

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
