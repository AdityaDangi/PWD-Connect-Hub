const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all projects
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT p.*, c.name as contractor_name
    FROM projects p
    LEFT JOIN contractors c ON p.contractor_id = c.id
    ORDER BY p.created_at DESC
  `).all();
  res.json(rows);
});

// GET single project
router.get('/:id', (req, res) => {
  const row = db.prepare(`
    SELECT p.*, c.name as contractor_name
    FROM projects p
    LEFT JOIN contractors c ON p.contractor_id = c.id
    WHERE p.id = ?
  `).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// POST create project
router.post('/', (req, res) => {
  const { name, location, status, budget, spent, start_date, end_date, contractor_id, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const result = db.prepare(`
    INSERT INTO projects (name,location,status,budget,spent,start_date,end_date,contractor_id,description)
    VALUES (?,?,?,?,?,?,?,?,?)
  `).run(name, location, status||'Active', budget||0, spent||0, start_date, end_date, contractor_id||null, description);
  res.status(201).json({ id: result.lastInsertRowid, message: 'Project created' });
});

// PUT update project
router.put('/:id', (req, res) => {
  const { name, location, status, budget, spent, start_date, end_date, contractor_id, description } = req.body;
  const result = db.prepare(`
    UPDATE projects SET name=?,location=?,status=?,budget=?,spent=?,start_date=?,end_date=?,contractor_id=?,description=?
    WHERE id=?
  `).run(name, location, status, budget, spent, start_date, end_date, contractor_id||null, description, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Updated' });
});

// DELETE project
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM projects WHERE id=?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted' });
});

// GET stats
router.get('/stats/summary', (req, res) => {
  const stats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status='Active' THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN status='Completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status='On Hold' THEN 1 ELSE 0 END) as on_hold,
      SUM(budget) as total_budget,
      SUM(spent) as total_spent
    FROM projects
  `).get();
  res.json(stats);
});

module.exports = router;
