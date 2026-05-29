const request = require('supertest');
const path = require('path');
const fs = require('fs');
const { app, server } = require('../index');

afterAll(done => server.close(done));

describe('Documents API', () => {
  let uploadedId;

  test('GET /api/documents returns array', async () => {
    const res = await request(app).get('/api/documents');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/upload rejects non-PDF', async () => {
    const res = await request(app)
      .post('/api/upload')
      .attach('files', Buffer.from('hello'), { filename: 'test.txt', contentType: 'text/plain' });
    expect(res.status).toBe(400);
  });

  test('POST /api/upload with no files returns 400', async () => {
    const res = await request(app).post('/api/upload');
    expect(res.status).toBe(400);
  });

  test('POST /api/upload accepts PDF', async () => {
    // Minimal valid PDF bytes
    const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\nxref\n0 0\ntrailer<</Size 1>>\n%%EOF');
    const res = await request(app)
      .post('/api/upload')
      .attach('files', pdfBuffer, { filename: 'test.pdf', contentType: 'application/pdf' });
    expect(res.status).toBe(200);
    expect(res.body.files).toHaveLength(1);
    expect(res.body.files[0].original_name).toBe('test.pdf');
    uploadedId = res.body.files[0].id;
  });

  test('GET /api/documents includes uploaded file', async () => {
    const res = await request(app).get('/api/documents');
    expect(res.body.some(d => d.id === uploadedId)).toBe(true);
  });

  test('DELETE /api/documents/:id removes document', async () => {
    const res = await request(app).delete(`/api/documents/${uploadedId}`);
    expect(res.status).toBe(200);
    const list = await request(app).get('/api/documents');
    expect(list.body.some(d => d.id === uploadedId)).toBe(false);
  });

  test('DELETE /api/documents/:id with unknown id returns 404', async () => {
    const res = await request(app).delete('/api/documents/nonexistent-id');
    expect(res.status).toBe(404);
  });
});

describe('Notifications API', () => {
  let notifId;

  test('GET /api/notifications returns array', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Bulk upload (>3 files) creates a notification', async () => {
    const pdfBuffer = Buffer.from('%PDF-1.4\n%%EOF');
    const req = request(app).post('/api/upload');
    for (let i = 0; i < 4; i++) {
      req.attach('files', pdfBuffer, { filename: `bulk${i}.pdf`, contentType: 'application/pdf' });
    }
    await req;
    const res = await request(app).get('/api/notifications');
    const bulkNotif = res.body.find(n => n.message.includes('files uploaded successfully'));
    expect(bulkNotif).toBeDefined();
    notifId = bulkNotif.id;
  });

  test('PATCH /api/notifications/:id/read marks as read', async () => {
    const res = await request(app).patch(`/api/notifications/${notifId}/read`);
    expect(res.status).toBe(200);
    const list = await request(app).get('/api/notifications');
    const n = list.body.find(n => n.id === notifId);
    expect(n.read).toBe(true);
  });

  test('PATCH /api/notifications/read-all marks all read', async () => {
    const res = await request(app).patch('/api/notifications/read-all');
    expect(res.status).toBe(200);
    const list = await request(app).get('/api/notifications');
    expect(list.body.every(n => n.read)).toBe(true);
  });

  test('DELETE /api/notifications/:id removes notification', async () => {
    const res = await request(app).delete(`/api/notifications/${notifId}`);
    expect(res.status).toBe(200);
    const list = await request(app).get('/api/notifications');
    expect(list.body.some(n => n.id === notifId)).toBe(false);
  });
});
