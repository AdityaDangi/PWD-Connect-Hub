const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT pay.*, p.name as project_name
    FROM payments pay
    LEFT JOIN projects p ON pay.project_id = p.id
    ORDER BY pay.created_at DESC
  `).all();
  res.json(rows);
});

router.get('/stats/summary', (req, res) => {
  const stats = db.prepare(`
    SELECT
      SUM(amount) as total,
      SUM(CASE WHEN status='Paid' THEN amount ELSE 0 END) as paid,
      SUM(CASE WHEN status='Pending' THEN amount ELSE 0 END) as pending,
      COUNT(*) as count
    FROM payments
  `).get();
  res.json(stats);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM payments WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { reference_no, type, party_name, project_id, amount, status, payment_date, payment_mode, notes } = req.body;
  if (!party_name) return res.status(400).json({ error: 'Party name is required' });
  const ref = reference_no || `PAY-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
  const result = db.prepare(`
    INSERT INTO payments (reference_no,type,party_name,project_id,amount,status,payment_date,payment_mode,notes)
    VALUES (?,?,?,?,?,?,?,?,?)
  `).run(ref, type, party_name, project_id||null, amount||0, status||'Pending', payment_date, payment_mode||'Bank Transfer', notes);
  res.status(201).json({ id: result.lastInsertRowid, message: 'Payment recorded' });
});

router.put('/:id', (req, res) => {
  const { reference_no, type, party_name, project_id, amount, status, payment_date, payment_mode, notes } = req.body;
  const result = db.prepare(`
    UPDATE payments SET reference_no=?,type=?,party_name=?,project_id=?,amount=?,status=?,payment_date=?,payment_mode=?,notes=?
    WHERE id=?
  `).run(reference_no, type, party_name, project_id||null, amount, status, payment_date, payment_mode, notes, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Updated' });
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM payments WHERE id=?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
