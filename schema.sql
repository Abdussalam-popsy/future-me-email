CREATE TABLE scheduled_emails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  send_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pending',
  failure_reason TEXT
);

CREATE TABLE rate_limits (
  ip TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start INTEGER NOT NULL
);

-- Migration for existing databases:
-- Local:
--   wrangler d1 execute futureme-db --local --command "ALTER TABLE scheduled_emails ADD COLUMN status TEXT DEFAULT 'pending';"
--   wrangler d1 execute futureme-db --local --command "ALTER TABLE scheduled_emails ADD COLUMN failure_reason TEXT;"
-- Remote:
--   wrangler d1 execute futureme-db --remote --command "ALTER TABLE scheduled_emails ADD COLUMN status TEXT DEFAULT 'pending';"
--   wrangler d1 execute futureme-db --remote --command "ALTER TABLE scheduled_emails ADD COLUMN failure_reason TEXT;"