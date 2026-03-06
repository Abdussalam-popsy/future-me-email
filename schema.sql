CREATE TABLE scheduled_emails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  send_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rate_limits (
  ip TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start INTEGER NOT NULL
);