const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/projects',    require('./routes/projects'));
app.use('/api/contractors', require('./routes/contractors'));
app.use('/api/labor',       require('./routes/labor'));
app.use('/api/materials',   require('./routes/materials'));
app.use('/api/pricing',     require('./routes/pricing'));
app.use('/api/payments',    require('./routes/payments'));

// Dashboard summary
app.get('/api/dashboard', (req, res) => {
  const db = require('./db');
  const projects    = db.prepare("SELECT COUNT(*) as c, SUM(CASE WHEN status='Active' THEN 1 ELSE 0 END) as active FROM projects").get();
  const contractors = db.prepare("SELECT COUNT(*) as c FROM contractors WHERE status='Active'").get();
  const labor       = db.prepare("SELECT COUNT(*) as c FROM labor").get();
  const materials   = db.prepare("SELECT COUNT(*) as c FROM materials").get();
  const payments    = db.prepare("SELECT SUM(CASE WHEN status='Paid' THEN amount ELSE 0 END) as paid, SUM(CASE WHEN status='Pending' THEN amount ELSE 0 END) as pending FROM payments").get();
  const recentActivity = db.prepare(`
    SELECT 'contractor' as type, name as title, created_at FROM contractors
    UNION ALL
    SELECT 'material' as type, name as title, created_at FROM materials
    UNION ALL
    SELECT 'project' as type, name as title, created_at FROM projects
    ORDER BY created_at DESC LIMIT 5
  `).all();
  res.json({ projects, contractors, labor, materials, payments, recentActivity });
});

// Fallback to frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🏗️  PWD Connect Hub running at http://localhost:${PORT}\n`);
});
