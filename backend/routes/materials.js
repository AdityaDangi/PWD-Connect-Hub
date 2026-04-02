const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT m.*, p.name as project_name
    FROM materials m
    LEFT JOIN projects p ON m.project_id = p.id
    ORDER BY m.created_at DESC
  `).all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM materials WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { name, category, unit, quantity, unit_price, supplier, status, project_id } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const result = db.prepare(`
    INSERT INTO materials (name,category,unit,quantity,unit_price,supplier,status,project_id)
    VALUES (?,?,?,?,?,?,?,?)
  `).run(name, category, unit, quantity||0, unit_price||0, supplier, status||'In Stock', project_id||null);
  res.status(201).json({ id: result.lastInsertRowid, message: 'Material added' });
});

router.put('/:id', (req, res) => {
  const { name, category, unit, quantity, unit_price, supplier, status, project_id } = req.body;
  const result = db.prepare(`
    UPDATE materials SET name=?,category=?,unit=?,quantity=?,unit_price=?,supplier=?,status=?,project_id=?
    WHERE id=?
  `).run(name, category, unit, quantity, unit_price, supplier, status, project_id||null, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Updated' });
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM materials WHERE id=?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
