const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT l.*, p.name as project_name
    FROM labor l
    LEFT JOIN projects p ON l.project_id = p.id
    ORDER BY l.created_at DESC
  `).all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare(`
    SELECT l.*, p.name as project_name
    FROM labor l
    LEFT JOIN projects p ON l.project_id = p.id
    WHERE l.id=?
  `).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { name, phone, skill, daily_rate, status, project_id, address, aadhar_no } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const result = db.prepare(`
    INSERT INTO labor (name,phone,skill,daily_rate,status,project_id,address,aadhar_no)
    VALUES (?,?,?,?,?,?,?,?)
  `).run(name, phone, skill, daily_rate||0, status||'Available', project_id||null, address, aadhar_no);
  res.status(201).json({ id: result.lastInsertRowid, message: 'Labor added' });
});

router.put('/:id', (req, res) => {
  const { name, phone, skill, daily_rate, status, project_id, address, aadhar_no } = req.body;
  const result = db.prepare(`
    UPDATE labor SET name=?,phone=?,skill=?,daily_rate=?,status=?,project_id=?,address=?,aadhar_no=?
    WHERE id=?
  `).run(name, phone, skill, daily_rate, status, project_id||null, address, aadhar_no, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Updated' });
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM labor WHERE id=?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
