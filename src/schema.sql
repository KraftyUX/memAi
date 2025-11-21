-- AI Memory System Database Schema
-- Version: 1.0
-- Created: 2025-11-04

-- Core memory entries
CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER NOT NULL,              -- Unix timestamp (ms)
    category TEXT NOT NULL,                  -- checkpoint, decision, implementation, issue, validation, insight, user-interaction
    phase TEXT,                              -- SPEC phase identifier
    action TEXT NOT NULL,                    -- Brief description of action taken
    context TEXT,                            -- Current state/situation
    reasoning TEXT,                          -- Why this action was taken
    outcome TEXT,                            -- Result of the action
    metadata TEXT,                           -- JSON blob for extensibility
    tags TEXT,                               -- Comma-separated searchable tags
    embedding BLOB,                          -- Vector embedding (JSON string or binary)
    parent_id INTEGER,                       -- Link to related memory
    FOREIGN KEY (parent_id) REFERENCES memories(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_memories_category ON memories(category);
CREATE INDEX IF NOT EXISTS idx_memories_phase ON memories(phase);
CREATE INDEX IF NOT EXISTS idx_memories_timestamp ON memories(timestamp);
CREATE INDEX IF NOT EXISTS idx_memories_tags ON memories(tags);

-- Decision registry
CREATE TABLE IF NOT EXISTS decisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER NOT NULL,
    decision TEXT NOT NULL,                  -- What was decided
    rationale TEXT NOT NULL,                 -- Why this choice
    alternatives TEXT,                       -- Other options considered
    impact TEXT,                             -- Expected consequences
    reversible BOOLEAN DEFAULT 1,            -- Can this be undone?
    confidence REAL DEFAULT 0.8,             -- 0-1 confidence score
    memory_id INTEGER,
    FOREIGN KEY (memory_id) REFERENCES memories(id)
);

CREATE INDEX IF NOT EXISTS idx_decisions_timestamp ON decisions(timestamp);

-- File change tracking
CREATE TABLE IF NOT EXISTS file_changes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER NOT NULL,
    file_path TEXT NOT NULL,                 -- Relative path from project root
    change_type TEXT NOT NULL,               -- created, modified, deleted, renamed
    reason TEXT,                             -- Why was this change made
    diff_summary TEXT,                       -- High-level description of changes
    lines_added INTEGER DEFAULT 0,
    lines_removed INTEGER DEFAULT 0,
    memory_id INTEGER,
    FOREIGN KEY (memory_id) REFERENCES memories(id)
);

CREATE INDEX IF NOT EXISTS idx_file_changes_path ON file_changes(file_path);
CREATE INDEX IF NOT EXISTS idx_file_changes_timestamp ON file_changes(timestamp);

-- Knowledge base (reusable insights)
CREATE TABLE IF NOT EXISTS knowledge (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic TEXT NOT NULL,                     -- Category/subject
    content TEXT NOT NULL,                   -- The insight/pattern/rule
    confidence REAL DEFAULT 0.5,             -- 0-1 confidence based on validation
    source TEXT,                             -- Where this came from (memory_id, external, etc)
    last_validated INTEGER,                  -- Unix timestamp of last confirmation
    tags TEXT,                               -- Searchable tags
    validation_count INTEGER DEFAULT 0       -- Times this knowledge was confirmed useful
);

CREATE INDEX IF NOT EXISTS idx_knowledge_topic ON knowledge(topic);
CREATE INDEX IF NOT EXISTS idx_knowledge_tags ON knowledge(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_confidence ON knowledge(confidence);

-- Checkpoints for resume functionality
CREATE TABLE IF NOT EXISTS checkpoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER NOT NULL,
    phase TEXT NOT NULL,
    status TEXT NOT NULL,                    -- started, in-progress, completed, blocked
    progress_percent REAL DEFAULT 0,
    pending_actions TEXT,                    -- JSON array of next steps
    blockers TEXT,                           -- JSON array of blocking issues
    memory_id INTEGER,
    FOREIGN KEY (memory_id) REFERENCES memories(id)
);

CREATE INDEX IF NOT EXISTS idx_checkpoints_phase ON checkpoints(phase);
CREATE INDEX IF NOT EXISTS idx_checkpoints_status ON checkpoints(status);

-- Issues and resolutions
CREATE TABLE IF NOT EXISTS issues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER NOT NULL,
    severity TEXT NOT NULL,                  -- P0, P1, P2, P3
    category TEXT NOT NULL,                  -- bug, blocker, tech-debt, question
    description TEXT NOT NULL,
    resolution TEXT,                         -- How it was resolved (if resolved)
    resolved_at INTEGER,                     -- Unix timestamp
    time_to_resolve INTEGER,                 -- Milliseconds from creation to resolution
    memory_id INTEGER,
    FOREIGN KEY (memory_id) REFERENCES memories(id)
);

CREATE INDEX IF NOT EXISTS idx_issues_severity ON issues(severity);
CREATE INDEX IF NOT EXISTS idx_issues_resolved ON issues(resolved_at);

-- Metrics and statistics
CREATE TABLE IF NOT EXISTS metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER NOT NULL,
    metric_name TEXT NOT NULL,               -- test_coverage, build_time, bundle_size, etc
    metric_value REAL NOT NULL,
    unit TEXT,                               -- ms, MB, percent, count
    phase TEXT,
    context TEXT                             -- Additional info
);

CREATE INDEX IF NOT EXISTS idx_metrics_name ON metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp);

-- User interactions and approvals
CREATE TABLE IF NOT EXISTS user_interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER NOT NULL,
    interaction_type TEXT NOT NULL,          -- approval, feedback, question, directive
    prompt TEXT NOT NULL,                    -- What was asked
    response TEXT,                           -- User's response
    impact TEXT,                             -- How this affected the work
    memory_id INTEGER,
    FOREIGN KEY (memory_id) REFERENCES memories(id)
);

CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);

-- Test results tracking
CREATE TABLE IF NOT EXISTS test_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER NOT NULL,
    test_suite TEXT NOT NULL,                -- e2e, unit, accessibility, performance
    total_tests INTEGER DEFAULT 0,
    passed INTEGER DEFAULT 0,
    failed INTEGER DEFAULT 0,
    skipped INTEGER DEFAULT 0,
    duration_ms INTEGER,
    failure_details TEXT,                    -- JSON array of failure info
    memory_id INTEGER,
    FOREIGN KEY (memory_id) REFERENCES memories(id)
);

CREATE INDEX IF NOT EXISTS idx_test_results_suite ON test_results(test_suite);
CREATE INDEX IF NOT EXISTS idx_test_results_timestamp ON test_results(timestamp);

-- Views for common queries

-- Recent activity summary
CREATE VIEW IF NOT EXISTS recent_activity AS
SELECT 
    m.timestamp,
    m.category,
    m.phase,
    m.action,
    m.outcome,
    m.tags
FROM memories m
ORDER BY m.timestamp DESC
LIMIT 50;

-- Phase progress overview
CREATE VIEW IF NOT EXISTS phase_progress AS
SELECT 
    c.phase,
    c.status,
    c.progress_percent,
    COUNT(m.id) as memory_count,
    MAX(m.timestamp) as last_activity
FROM checkpoints c
LEFT JOIN memories m ON m.phase = c.phase
GROUP BY c.phase
ORDER BY c.timestamp DESC;

-- Unresolved issues
CREATE VIEW IF NOT EXISTS active_issues AS
SELECT 
    i.id,
    i.timestamp,
    i.severity,
    i.category,
    i.description,
    (strftime('%s', 'now') * 1000 - i.timestamp) as age_ms
FROM issues i
WHERE i.resolved_at IS NULL
ORDER BY 
    CASE i.severity 
        WHEN 'P0' THEN 1 
        WHEN 'P1' THEN 2 
        WHEN 'P2' THEN 3 
        ELSE 4 
    END,
    i.timestamp ASC;

-- Knowledge confidence ranking
CREATE VIEW IF NOT EXISTS top_knowledge AS
SELECT 
    k.topic,
    k.content,
    k.confidence,
    k.validation_count,
    k.tags
FROM knowledge k
WHERE k.confidence > 0.7
ORDER BY k.confidence DESC, k.validation_count DESC
LIMIT 100;

-- Test health metrics
CREATE VIEW IF NOT EXISTS test_health AS
SELECT 
    tr.test_suite,
    AVG(tr.passed * 100.0 / tr.total_tests) as avg_pass_rate,
    AVG(tr.duration_ms) as avg_duration,
    COUNT(*) as run_count,
    MAX(tr.timestamp) as last_run
FROM test_results tr
GROUP BY tr.test_suite
ORDER BY avg_pass_rate DESC;

-- Initialize metadata table
CREATE TABLE IF NOT EXISTS aimem_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT OR IGNORE INTO aimem_metadata (key, value) VALUES 
    ('version', '1.0'),
    ('created_at', strftime('%s', 'now') * 1000),
    ('project', 'promptin'),
    ('spec_version', '1.0');
