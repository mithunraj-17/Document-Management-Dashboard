const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const clients = new Set();

function addClient(ws) {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
}

function broadcast(data) {
  const msg = JSON.stringify(data);
  clients.forEach(ws => {
    if (ws.readyState === 1) ws.send(msg);
  });
}

function createNotification(message, type = 'info') {
  const notification = {
    id: uuidv4(),
    message,
    type,
    timestamp: new Date().toISOString(),
    read: 0,
  };
  db.prepare(
    'INSERT INTO notifications (id, message, type, timestamp, read) VALUES (?, ?, ?, ?, ?)'
  ).run(notification.id, notification.message, notification.type, notification.timestamp, notification.read);

  broadcast({ event: 'notification', data: { ...notification, read: false } });
  return notification;
}

module.exports = { addClient, broadcast, createNotification };
