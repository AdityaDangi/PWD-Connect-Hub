const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM pricing ORDER BY category, item_name').all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM pricing WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { item_name, category, unit, rate, gst_percent, description, effective_date } = req.body;
  if (!item_name) return res.status(400).json({ error: 'Item name is required' });
  const result = db.prepare(`
    INSERT INTO pricing (item_name,category,unit,rate,gst_percent,description,effective_date)
    VALUES (?,?,?,?,?,?,?)
  `).run(item_name, category, unit, rate||0, gst_percent||18, description, effective_date);
  res.status(201).json({ id: result.lastInsertRowid, message: 'Pricing added' });
});

router.put('/:id', (req, res) => {
  const { item_name, category, unit, rate, gst_percent, description, effective_date } = req.body;
  const result = db.prepare(`
    UPDATE pricing SET item_name=?,category=?,unit=?,rate=?,gst_percent=?,description=?,effective_date=?
    WHERE id=?
  `).run(item_name, category, unit, rate, gst_percent, description, effective_date, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Updated' });
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM pricing WHERE id=?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
