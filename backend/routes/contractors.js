const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM contractors ORDER BY created_at DESC').all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM contractors WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { name, phone, email, specialization, status, rating, projects_completed, address, license_no } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const result = db.prepare(`
    INSERT INTO contractors (name,phone,email,specialization,status,rating,projects_completed,address,license_no)
    VALUES (?,?,?,?,?,?,?,?,?)
  `).run(name, phone, email, specialization, status||'Active', rating||0, projects_completed||0, address, license_no);
  res.status(201).json({ id: result.lastInsertRowid, message: 'Contractor created' });
});

router.put('/:id', (req, res) => {
  const { name, phone, email, specialization, status, rating, projects_completed, address, license_no } = req.body;
  const result = db.prepare(`
    UPDATE contractors SET name=?,phone=?,email=?,specialization=?,status=?,rating=?,projects_completed=?,address=?,license_no=?
    WHERE id=?
  `).run(name, phone, email, specialization, status, rating, projects_completed, address, license_no, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Updated' });
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM contractors WHERE id=?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
