-- Migration 002: persistent rate limiting table
-- Run this in your Neon SQL Editor

CREATE TABLE IF NOT EXISTS rate_limits (
  ip       TEXT PRIMARY KEY,
  count    INT NOT NULL DEFAULT 1,
  reset_at TIMESTAMPTZ NOT NULL
);

-- Optional: auto-clean rows older than 24 hours (run manually or via cron)
-- DELETE FROM rate_limits WHERE reset_at < NOW() - INTERVAL '24 hours';
