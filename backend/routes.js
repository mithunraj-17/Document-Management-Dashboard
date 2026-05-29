const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');
const { createNotification } = require('./ws');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, 'uploads'),
  filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  },
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Upload files
router.post('/upload', upload.array('files'), (req, res) => {
  if (!req.files || req.files.length === 0)
    return res.status(400).json({ error: 'No files uploaded' });

  const now = new Date().toISOString();
  const docs = req.files.map(file => {
    const doc = {
      id: uuidv4(),
      name: file.filename,
      original_name: file.originalname,
      size: file.size,
      mime_type: file.mimetype,
      path: file.path,
      upload_date: now,
      status: 'complete',
    };
    db.prepare(
      'INSERT INTO documents (id, name, original_name, size, mime_type, path, upload_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(doc.id, doc.name, doc.original_name, doc.size, doc.mime_type, doc.path, doc.upload_date, doc.status);
    return doc;
  });

  // Bulk notification if > 3 files
  if (req.files.length > 3) {
    createNotification(`${req.files.length} files uploaded successfully`, 'success');
  }

  res.json({ files: docs });
});

// List documents
router.get('/documents', (req, res) => {
  const docs = db.prepare('SELECT * FROM documents ORDER BY upload_date DESC').all();
  res.json(docs);
});

// Download document
router.get('/documents/:id/download', (req, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.download(doc.path, doc.original_name);
});

// Delete document
router.delete('/documents/:id', (req, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  const fs = require('fs');
  try { fs.unlinkSync(doc.path); } catch {}
  db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Get notifications
router.get('/notifications', (req, res) => {
  const notifications = db.prepare('SELECT * FROM notifications ORDER BY timestamp DESC').all();
  res.json(notifications.map(n => ({ ...n, read: !!n.read })));
});

// Mark notification as read
router.patch('/notifications/:id/read', (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Mark all as read
router.patch('/notifications/read-all', (req, res) => {
  db.prepare('UPDATE notifications SET read = 1').run();
  res.json({ success: true });
});

// Delete notification
router.delete('/notifications/:id', (req, res) => {
  db.prepare('DELETE FROM notifications WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
