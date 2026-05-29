# DocVault — Document Management Dashboard

A full-stack document management web app with real-time upload progress, bulk upload notifications via WebSockets, and a persistent notification center.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React + Vite + Tailwind CSS v4 |
| Backend | Node.js + Express |
| Real-time | WebSockets (`ws`) |
| Database | SQLite (`better-sqlite3`) |
| Storage | Local disk (`/backend/uploads/`) |
| Font | Livvic (Google Fonts) |

## Database Schema

```sql
-- Documents table
CREATE TABLE documents (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,         -- stored filename (uuid-prefixed)
  original_name TEXT NOT NULL,       -- original upload filename
  size        INTEGER NOT NULL,      -- bytes
  mime_type   TEXT NOT NULL,
  path        TEXT NOT NULL,         -- absolute path on disk
  upload_date TEXT NOT NULL,         -- ISO 8601
  status      TEXT DEFAULT 'complete'
);

-- Notifications table
CREATE TABLE notifications (
  id        TEXT PRIMARY KEY,
  message   TEXT NOT NULL,
  type      TEXT NOT NULL,           -- 'success' | 'error' | 'info'
  timestamp TEXT NOT NULL,           -- ISO 8601
  read      INTEGER DEFAULT 0        -- 0 = unread, 1 = read
);
```

## Local Setup

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Clone & install

```bash
git clone <repo-url>
cd SWSAI

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Start the backend

```bash
cd backend
npm run dev       # uses nodemon for hot reload
# or
npm start         # production
```

Backend runs on **http://localhost:4000**

### 3. Start the frontend

```bash
cd frontend
npm run dev
```

Frontend runs on **http://localhost:5173**

### Environment Variables

No `.env` file required for local development. The backend defaults to port `4000`.

To change the port:
```bash
PORT=5000 npm start
```

## Features

### Feature 1 — File Upload (Individual & Bulk)
- Drag-and-drop zone or click-to-browse for PDF files
- Per-file progress bars with filename, percentage, size, and status
- Files stored on local disk; metadata saved to SQLite
- Document table with name, size, type, upload date, download, and delete

### Feature 2 — Smart Notifications for Bulk Uploads
- ≤3 files: inline progress only
- \>3 files: toast banner "Upload in progress — processing X files in background" + collapsible file list
- WebSocket notification pushed to all connected clients when bulk upload completes: "X files uploaded successfully"
- Notification received even if user navigated away from upload page

### Feature 3 — Notification Center
- Bell icon in header with unread count badge
- Dropdown panel with all notifications (message, type badge, timestamp, read/unread state)
- Dedicated `/notifications` page
- Mark individual or all notifications as read
- Delete individual notifications
- Persisted in SQLite — survives page refresh

### Feature 4 — Unit Tests (Optional)
Backend API tests using Jest + Supertest.

## Running Tests

```bash
cd backend
npm test
```

Tests cover:
- `GET /api/documents` — returns array
- `POST /api/upload` — rejects non-PDF, rejects empty, accepts PDF
- `DELETE /api/documents/:id` — removes document, 404 on unknown id
- `GET /api/notifications` — returns array
- Bulk upload (>3 files) — creates notification
- `PATCH /api/notifications/:id/read` — marks as read
- `PATCH /api/notifications/read-all` — marks all read
- `DELETE /api/notifications/:id` — removes notification

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload one or more PDF files |
| GET | `/api/documents` | List all documents |
| GET | `/api/documents/:id/download` | Download a document |
| DELETE | `/api/documents/:id` | Delete a document |
| GET | `/api/notifications` | List all notifications |
| PATCH | `/api/notifications/:id/read` | Mark notification as read |
| PATCH | `/api/notifications/read-all` | Mark all notifications as read |
| DELETE | `/api/notifications/:id` | Delete a notification |
| WS | `ws://localhost:4000/ws` | Real-time notification stream |

## Deployment

### Docker (recommended)

```dockerfile
# Backend
FROM node:20-alpine
WORKDIR /app
COPY backend/ .
RUN npm ci --omit=dev
EXPOSE 4000
CMD ["node", "index.js"]
```

Serve the frontend build (`npm run build`) via any static host (Netlify, Vercel, S3+CloudFront) and point `VITE_API_URL` to your deployed backend.
