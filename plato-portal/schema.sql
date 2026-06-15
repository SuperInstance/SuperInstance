-- Create fleets table
CREATE TABLE IF NOT EXISTS fleets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  last_seen TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create fleet_events table
CREATE TABLE IF NOT EXISTS fleet_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fleet_id TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  value TEXT NOT NULL,
  timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (fleet_id) REFERENCES fleets(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fleets_last_seen ON fleets(last_seen);
CREATE INDEX IF NOT EXISTS idx_fleet_events_timestamp ON fleet_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_fleet_events_fleet_id ON fleet_events(fleet_id);