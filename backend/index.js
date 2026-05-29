const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const fs = require('fs');
const routes = require('./routes');
const { addClient } = require('./ws');

// Ensure uploads directory exists
fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', routes);

wss.on('connection', ws => addClient(ws));

const PORT = process.env.PORT || 4000;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));

module.exports = { app, server };
