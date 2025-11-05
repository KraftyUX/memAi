# CLI Reference

Complete command-line interface reference for memAI.

## Table of Contents

- [Installation](#installation)
- [Global Options](#global-options)
- [Commands](#commands)
  - [init](#init)
  - [stats](#stats)
  - [recent](#recent)
  - [search](#search)
  - [phase](#phase)
  - [issues](#issues)
  - [export](#export)
  - [briefing](#briefing)
  - [dashboard](#dashboard)
- [Configuration](#configuration)
- [Exit Codes](#exit-codes)

---

## Installation

Install memAI globally for CLI access:

```bash
npm install -g memai
```

Or use with npx (no installation required):

```bash
npx memai <command>
```

---

## Global Options

These options work with all commands:

| Option | Description | Default |
|--------|-------------|---------|
| `--db <path>` | Path to database file | `.memai/memory.db` |
| `--help`, `-h` | Show help for command | - |
| `--version`, `-v` | Show version number | - |
| `--json` | Output in JSON format | false |
| `--no-color` | Disable colored output | false |

**Example:**

```bash
memai stats --db ./custom/path/memory.db --json
```

---

## Commands

### init

Initialize a new memAI database in the current directory.

**Syntax:**

```bash
memai init [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--path <dir>` | Directory for database | `.memai` |
| `--force`, `-f` | Overwrite existing database | false |

**Description:**

Creates a new SQLite database with the memAI schema. This command:
- Creates the `.memai` directory if it doesn't exist
- Initializes `memory.db` with all required tables
- Creates a `logs` subdirectory for JSON audit trails
- Sets up Write-Ahead Logging (WAL) mode for performance

**Examples:**

```bash
# Initialize in default location (.memai/memory.db)
memai init

# Initialize in custom directory
memai init --path ./project-memory

# Force reinitialize (overwrites existing)
memai init --force
```

**Output:**

```
✅ memAI initialized: /path/to/project/.memai/memory.db
📁 Log directory created: /path/to/project/.memai/logs
```

---

### stats

Display database statistics and health metrics.

**Syntax:**

```bash
memai stats [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--detailed`, `-d` | Show detailed breakdown | false |

**Description:**

Shows comprehensive statistics about your memAI database including:
- Total memories recorded
- Total decisions tracked
- Issue counts (total, active, resolved)
- Average issue resolution time
- Database file size
- Memory by category breakdown (with `--detailed`)

**Examples:**

```bash
# Basic statistics
memai stats

# Detailed statistics with category breakdown
memai stats --detailed

# JSON output for scripting
memai stats --json
```

**Output:**

```
📊 memAI Statistics

Memories:     142 total
Decisions:    23 tracked
Issues:       8 total (2 active, 6 resolved)
Avg Resolve:  4.2 hours

Database:     2.4 MB
Last Activity: 2 minutes ago
```

---

### recent

Show recent memory entries.

**Syntax:**

```bash
memai recent [count] [options]
```

**Arguments:**

| Argument | Description | Default |
|----------|-------------|---------|
| `count` | Number of entries to show | 20 |

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--category <cat>` | Filter by category | all |
| `--phase <name>` | Filter by phase | all |
| `--tags <tags>` | Filter by tags (comma-separated) | all |

**Description:**

Displays the most recent memory entries in reverse chronological order. Each entry shows:
- Timestamp
- Category and phase
- Action description
- Context, reasoning, and outcome (if present)
- Tags

**Examples:**

```bash
# Show last 20 memories
memai recent

# Show last 50 memories
memai recent 50

# Show recent decisions only
memai recent --category decision

# Show recent memories from specific phase
memai recent --phase "MVP Development"

# Show memories with specific tags
memai recent --tags "auth,security"
```

**Output:**

```
📝 Recent Memories (Last 20)

[2 minutes ago] implementation | MVP Development
  Action: Implemented user authentication
  Context: Users need secure login
  Reasoning: Security requirement from spec
  Outcome: OAuth 2.0 integration complete
  Tags: auth, security, oauth

[1 hour ago] decision | Architecture Design
  Action: Chose PostgreSQL over MongoDB
  ...
```

---

### search

Search memories by keyword or pattern.

**Syntax:**

```bash
memai search <query> [options]
```

**Arguments:**

| Argument | Description | Required |
|----------|-------------|----------|
| `query` | Search term or pattern | Yes |

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--field <name>` | Search specific field | all |
| `--limit <n>` | Maximum results | 50 |
| `--case-sensitive` | Case-sensitive search | false |

**Description:**

Performs full-text search across all memory fields including action, context, reasoning, outcome, and tags. Results are ranked by relevance and recency.

**Searchable Fields:**
- `action` - The action description
- `context` - Contextual information
- `reasoning` - Decision rationale
- `outcome` - Result or impact
- `tags` - Associated tags

**Examples:**

```bash
# Search all fields
memai search "authentication"

# Search specific field
memai search "OAuth" --field action

# Limit results
memai search "database" --limit 10

# Case-sensitive search
memai search "PostgreSQL" --case-sensitive
```

**Output:**

```
🔍 Search Results for "authentication" (8 matches)

[Relevance: 95%] 2 minutes ago
  Category: implementation | Phase: MVP Development
  Action: Implemented user authentication
  Context: Users need secure login
  Tags: auth, security, oauth

[Relevance: 87%] 3 hours ago
  Category: decision | Phase: Architecture Design
  Action: Selected authentication strategy
  ...
```

---

### phase

Show all memories from a specific project phase.

**Syntax:**

```bash
memai phase <name> [options]
```

**Arguments:**

| Argument | Description | Required |
|----------|-------------|----------|
| `name` | Phase name | Yes |

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--summary`, `-s` | Show summary only | false |
| `--timeline` | Show as timeline | false |

**Description:**

Retrieves all memories associated with a specific project phase in chronological order. Useful for reviewing what happened during a particular development phase.

**Examples:**

```bash
# Show all memories from a phase
memai phase "MVP Development"

# Show phase summary
memai phase "Architecture Design" --summary

# Show as timeline
memai phase "Testing" --timeline
```

**Output:**

```
📂 Phase: MVP Development

Progress: 75% | Status: in-progress
Memories: 34 | Duration: 5 days

Timeline:
├─ [Day 1] Started MVP development
├─ [Day 2] Implemented core features
├─ [Day 3] Added authentication
├─ [Day 4] Integration testing
└─ [Day 5] Bug fixes and polish

Recent Activity:
  [2 hours ago] Fixed login bug on Safari
  [5 hours ago] Completed user dashboard
  [1 day ago] Integrated payment system
```

---

### issues

List and manage issues.

**Syntax:**

```bash
memai issues [status] [options]
```

**Arguments:**

| Argument | Description | Default |
|----------|-------------|---------|
| `status` | Filter by status: `active`, `resolved`, `all` | active |

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--severity <level>` | Filter by severity: P0, P1, P2, P3 | all |
| `--category <cat>` | Filter by category | all |
| `--sort <field>` | Sort by: severity, age, category | severity |

**Description:**

Lists issues with their current status, severity, and resolution information. Issues are automatically sorted by severity (P0 first) and age.

**Severity Levels:**
- `P0` - Critical: System down, data loss
- `P1` - High: Major feature broken
- `P2` - Medium: Minor feature issue
- `P3` - Low: Cosmetic or enhancement

**Examples:**

```bash
# Show active issues
memai issues

# Show all issues
memai issues all

# Show resolved issues
memai issues resolved

# Show critical issues only
memai issues --severity P0

# Show bugs only
memai issues --category bug

# Sort by age
memai issues --sort age
```

**Output:**

```
🐛 Active Issues (2)

[P0] bug | 4 hours old
  Login fails on Safari
  Memory: #142

[P1] performance | 2 days old
  Dashboard loads slowly with 1000+ memories
  Memory: #138

---

✅ Recently Resolved (3)

[P1] bug | Resolved 1 hour ago (took 4.2 hours)
  Cookie SameSite attribute issue
  Resolution: Fixed cookie settings in auth middleware
```

---

### export

Export memory data to various formats.

**Syntax:**

```bash
memai export <format> <output> [options]
```

**Arguments:**

| Argument | Description | Required |
|----------|-------------|----------|
| `format` | Export format: `json`, `markdown`, `csv` | Yes |
| `output` | Output file path | Yes |

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--since <date>` | Export from date (ISO 8601) | all time |
| `--category <cat>` | Filter by category | all |
| `--phase <name>` | Filter by phase | all |
| `--include <types>` | Include types (comma-separated) | all |

**Description:**

Exports memory data to external formats for reporting, backup, or integration with other tools.

**Available Formats:**
- `json` - Complete data export with all fields
- `markdown` - Human-readable report with tables
- `csv` - Spreadsheet-compatible format

**Include Types:**
- `memories` - Memory entries
- `decisions` - Decision records
- `issues` - Issue tracking
- `checkpoints` - Progress checkpoints
- `tests` - Test results
- `knowledge` - Knowledge base entries

**Examples:**

```bash
# Export everything to JSON
memai export json backup.json

# Export to Markdown report
memai export markdown report.md

# Export recent memories only
memai export json recent.json --since 2025-01-01

# Export specific phase
memai export markdown mvp-report.md --phase "MVP Development"

# Export decisions only
memai export json decisions.json --include decisions

# Export multiple types
memai export json full-export.json --include "memories,decisions,issues"
```

**Output:**

```
📦 Exporting to JSON...

Included:
  ✓ 142 memories
  ✓ 23 decisions
  ✓ 8 issues
  ✓ 12 checkpoints
  ✓ 45 test results

✅ Exported to: backup.json (2.4 MB)
```

---

### briefing

Generate a resume briefing for AI agents.

**Syntax:**

```bash
memai briefing [hours] [options]
```

**Arguments:**

| Argument | Description | Default |
|----------|-------------|---------|
| `hours` | Hours to look back | 24 |

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--categories <list>` | Filter categories (comma-separated) | all |
| `--depth <n>` | Maximum memories per category | 10 |
| `--format <type>` | Output format: `text`, `json`, `markdown` | text |

**Description:**

Generates a comprehensive briefing for AI agents to resume work. Includes:
- Recent memories by category
- Active issues and blockers
- Latest checkpoint status
- Pending actions
- Summary statistics

This is designed to provide AI agents with complete context to continue work seamlessly.

**Examples:**

```bash
# Last 24 hours briefing
memai briefing

# Last 48 hours
memai briefing 48

# Last week
memai briefing 168

# Specific categories only
memai briefing --categories "checkpoint,decision,issue"

# JSON format for AI consumption
memai briefing --format json

# Detailed briefing
memai briefing --depth 20
```

**Output:**

```
🧠 memAI Briefing (Last 24 hours)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Summary
  Total Memories: 34
  Active Issues: 2 (1 critical)
  Current Phase: MVP Development
  Progress: 75%
  Status: in-progress

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Current Context

Phase: MVP Development (75% complete)
Status: in-progress

Pending Actions:
  • Deploy to staging environment
  • Complete user acceptance testing
  • Update documentation

Blockers:
  • Waiting for API keys from third-party service

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🐛 Active Issues (2)

[P0] Login fails on Safari (4 hours old)
[P1] Dashboard slow with 1000+ memories (2 days old)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Recent Activity by Category

Implementation (12 memories)
  • Implemented user authentication
  • Added password reset flow
  • Integrated OAuth providers
  ...

Decisions (3 memories)
  • Chose PostgreSQL over MongoDB
  • Selected React for frontend
  ...

Checkpoints (2 memories)
  • Completed authentication module
  • Reached 75% MVP progress
  ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Recommendations

1. Address P0 issue: Login fails on Safari
2. Continue with pending actions
3. Resolve blocker: API keys needed
```

---

### dashboard

Launch the web-based dashboard.

**Syntax:**

```bash
memai dashboard [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--port <n>` | Server port | 3030 |
| `--host <addr>` | Server host | localhost |
| `--open`, `-o` | Auto-open browser | true |
| `--readonly` | Read-only mode | false |

**Description:**

Starts a local web server and opens the memAI dashboard in your default browser. The dashboard provides:
- Visual memory exploration
- Real-time statistics
- Full-text search
- Multi-filter system
- Export functionality
- Dark mode support

**Examples:**

```bash
# Launch dashboard (opens browser automatically)
memai dashboard

# Custom port
memai dashboard --port 8080

# Don't open browser
memai dashboard --no-open

# Read-only mode (no modifications)
memai dashboard --readonly

# Bind to all interfaces
memai dashboard --host 0.0.0.0
```

**Output:**

```
🚀 memAI Dashboard

Server:    http://localhost:3030
Database:  /path/to/project/.memai/memory.db
Mode:      read-write

✅ Dashboard ready!
🌐 Opening browser...

Press Ctrl+C to stop
```

---

## Configuration

### Environment Variables

memAI respects these environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `MEMAI_DB_PATH` | Default database path | `.memai/memory.db` |
| `MEMAI_LOG_LEVEL` | Logging level: `debug`, `info`, `warn`, `error` | `info` |
| `MEMAI_NO_COLOR` | Disable colored output | `false` |
| `MEMAI_DASHBOARD_PORT` | Default dashboard port | `3030` |

**Example:**

```bash
export MEMAI_DB_PATH="./custom/memory.db"
export MEMAI_LOG_LEVEL="debug"
memai stats
```

### Config File

Create `.memairc.json` in your project root:

```json
{
  "dbPath": ".memai/memory.db",
  "logLevel": "info",
  "dashboard": {
    "port": 3030,
    "autoOpen": true
  },
  "export": {
    "defaultFormat": "markdown"
  }
}
```

---

## Exit Codes

memAI CLI uses standard exit codes:

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Invalid arguments |
| 3 | Database error |
| 4 | File not found |
| 5 | Permission denied |

**Example usage in scripts:**

```bash
#!/bin/bash

memai stats --json > stats.json

if [ $? -eq 0 ]; then
  echo "Stats exported successfully"
else
  echo "Failed to export stats"
  exit 1
fi
```

---

## See Also

- [API Reference](API.md) - Programmatic usage
- [Examples](EXAMPLES.md) - Integration examples
- [README](../README.md) - Project overview


---

## Common Workflows

### Daily Development Workflow

```bash
# Start your day - get briefing
memai briefing 24

# Check active issues
memai issues

# Work on your code...

# Check recent activity
memai recent 10

# End of day - export progress
memai export markdown daily-report.md --since $(date -I)
```

### Project Phase Review

```bash
# Review specific phase
memai phase "MVP Development" --summary

# Export phase report
memai export markdown mvp-report.md --phase "MVP Development"

# Check phase statistics
memai stats --detailed
```

### Issue Management Workflow

```bash
# Check critical issues
memai issues --severity P0

# Review all active issues
memai issues active

# After fixing, verify resolution
memai issues resolved | head -n 20
```

### Weekly Review Workflow

```bash
# Generate weekly briefing
memai briefing 168 --format markdown > weekly-review.md

# Export all data for backup
memai export json weekly-backup.json

# Check overall statistics
memai stats --detailed
```

### CI/CD Integration

```bash
# In your CI pipeline
memai init --force
memai stats --json > build-stats.json

# Record deployment
# (Use API for programmatic recording)

# Generate deployment report
memai briefing 1 --format json > deployment-context.json
```

---

## Output Formats

### Text Output (Default)

Human-readable formatted output with colors and icons:

```
📊 memAI Statistics

Memories:     142 total
Decisions:    23 tracked
Issues:       8 total (2 active, 6 resolved)
Avg Resolve:  4.2 hours

Database:     2.4 MB
Last Activity: 2 minutes ago
```

### JSON Output

Machine-readable structured data (use `--json` flag):

```json
{
  "totalMemories": 142,
  "totalDecisions": 23,
  "totalIssues": 8,
  "activeIssues": 2,
  "resolvedIssues": 6,
  "avgResolveTimeMs": 15120000,
  "avgResolveTimeHours": "4.20",
  "databaseSize": 2457600,
  "lastActivity": 1704123456789
}
```

**Usage in scripts:**

```bash
# Parse with jq
memai stats --json | jq '.activeIssues'

# Store in variable
ACTIVE_ISSUES=$(memai stats --json | jq -r '.activeIssues')

# Conditional logic
if [ $(memai stats --json | jq '.activeIssues') -gt 0 ]; then
  echo "⚠️  Active issues detected!"
fi
```

### Markdown Output

Formatted markdown for reports (export command):

```markdown
# memAI - Project Memory Report

**Generated**: 2025-01-15T10:30:00.000Z

---

## Summary

- **Total Memories**: 142
- **Active Issues**: 2
- **Critical Issues**: 1
- **Current Phase**: MVP Development
- **Progress**: 75%
- **Status**: in-progress

---

## Phase Progress

| Phase | Status | Progress | Memories | Last Activity |
|-------|--------|----------|----------|---------------|
| MVP Development | in-progress | 75% | 34 | 2 minutes ago |
| Architecture Design | completed | 100% | 28 | 3 days ago |
```

### CSV Output

Spreadsheet-compatible format (export command):

```csv
id,timestamp,category,phase,action,context,reasoning,outcome,tags
1,1704123456789,implementation,Setup,Initialized project,Setting up memory,Need persistent context,Successfully integrated,setup;initialization
2,1704123567890,decision,Architecture,Chose PostgreSQL,Need relational data,Complex queries needed,Successful implementation,database;architecture
```

**Usage:**

```bash
# Export to CSV
memai export csv memories.csv

# Import to spreadsheet
# Open in Excel, Google Sheets, etc.

# Process with command-line tools
cat memories.csv | cut -d',' -f4,5 | sort | uniq
```

---

## Advanced Usage

### Filtering and Combining

```bash
# Multiple filters
memai recent 50 --category decision --phase "MVP Development"

# Search with limit
memai search "authentication" --limit 5 --field action

# Issues by severity and category
memai issues --severity P0 --category bug
```

### Piping and Redirection

```bash
# Save output to file
memai recent 100 > recent-memories.txt

# Pipe to grep
memai recent 50 | grep "authentication"

# Pipe to less for pagination
memai phase "MVP Development" | less

# Count matches
memai search "database" | grep -c "PostgreSQL"
```

### Scripting Examples

**Bash script to check for critical issues:**

```bash
#!/bin/bash

# check-issues.sh
CRITICAL=$(memai issues --severity P0 --json | jq '. | length')

if [ "$CRITICAL" -gt 0 ]; then
  echo "🚨 $CRITICAL critical issue(s) found!"
  memai issues --severity P0
  exit 1
else
  echo "✅ No critical issues"
  exit 0
fi
```

**Node.js script for automated reporting:**

```javascript
#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

// Get stats as JSON
const stats = JSON.parse(
  execSync('memai stats --json', { encoding: 'utf-8' })
);

// Generate report
const report = `
# Daily Report - ${new Date().toISOString().split('T')[0]}

- Memories: ${stats.totalMemories}
- Active Issues: ${stats.activeIssues}
- Avg Resolution: ${stats.avgResolveTimeHours}h

${stats.activeIssues > 0 ? '⚠️ Action required!' : '✅ All clear!'}
`;

writeFileSync('daily-report.md', report);
console.log('✅ Report generated');
```

**Python script for data analysis:**

```python
#!/usr/bin/env python3

import json
import subprocess

# Get briefing data
result = subprocess.run(
    ['memai', 'briefing', '--format', 'json'],
    capture_output=True,
    text=True
)

data = json.loads(result.stdout)

# Analyze
print(f"Total memories: {data['summary']['totalMemories']}")
print(f"Categories: {data['summary']['categoryCounts']}")

# Alert on critical issues
if data['summary']['criticalIssuesCount'] > 0:
    print(f"⚠️  {data['summary']['criticalIssuesCount']} critical issues!")
```

### Automation with Cron

```bash
# Add to crontab (crontab -e)

# Daily backup at midnight
0 0 * * * cd /path/to/project && memai export json backup-$(date +\%Y\%m\%d).json

# Hourly briefing during work hours
0 9-17 * * 1-5 cd /path/to/project && memai briefing 1 > /tmp/memai-briefing.txt

# Weekly report on Friday
0 17 * * 5 cd /path/to/project && memai export markdown weekly-report-$(date +\%Y\%W).md
```

### Git Hooks Integration

**Pre-commit hook (.git/hooks/pre-commit):**

```bash
#!/bin/bash

# Check for critical issues before commit
CRITICAL=$(memai issues --severity P0 --json | jq '. | length')

if [ "$CRITICAL" -gt 0 ]; then
  echo "🚨 Cannot commit: $CRITICAL critical issue(s) unresolved"
  memai issues --severity P0
  exit 1
fi

exit 0
```

**Post-commit hook (.git/hooks/post-commit):**

```bash
#!/bin/bash

# Record commit in memAI
COMMIT_MSG=$(git log -1 --pretty=%B)
COMMIT_HASH=$(git rev-parse HEAD)

# Use API to record (requires Node.js script)
node -e "
import Memai from 'memai';
const memai = new Memai();
memai.record({
  category: 'checkpoint',
  action: 'Committed: $COMMIT_MSG',
  context: 'Git commit $COMMIT_HASH',
  tags: 'git,commit'
});
"
```

---

## Troubleshooting

### Database Issues

**Problem: "Database is locked"**

```bash
# Check for other processes
lsof .memai/memory.db

# Kill stale processes
pkill -f memai

# If persistent, disable WAL mode temporarily
sqlite3 .memai/memory.db "PRAGMA journal_mode=DELETE;"
```

**Problem: "Database file not found"**

```bash
# Initialize database
memai init

# Or specify custom path
memai stats --db /path/to/memory.db
```

**Problem: "Database corrupted"**

```bash
# Check integrity
sqlite3 .memai/memory.db "PRAGMA integrity_check;"

# Restore from backup
cp backup.json .
# Use API to reimport data

# Or reinitialize (loses data)
memai init --force
```

### Performance Issues

**Problem: "Commands are slow"**

```bash
# Check database size
ls -lh .memai/memory.db

# Vacuum database to reclaim space
sqlite3 .memai/memory.db "VACUUM;"

# Analyze for query optimization
sqlite3 .memai/memory.db "ANALYZE;"

# Check WAL mode is enabled
sqlite3 .memai/memory.db "PRAGMA journal_mode;"
```

**Problem: "Dashboard loads slowly"**

```bash
# Reduce initial load
memai dashboard --readonly

# Export old data and archive
memai export json archive-$(date +%Y).json --since 2024-01-01
# Then manually clean old records

# Use pagination in queries
memai recent 20  # Instead of large numbers
```

### Output Issues

**Problem: "Colors not showing"**

```bash
# Check terminal support
echo $TERM

# Force color output
export FORCE_COLOR=1
memai stats

# Or disable colors
memai stats --no-color
```

**Problem: "JSON output malformed"**

```bash
# Validate JSON
memai stats --json | jq .

# Check for stderr mixing
memai stats --json 2>/dev/null | jq .

# Use explicit format
memai briefing --format json
```

### CLI Not Found

**Problem: "memai: command not found"**

```bash
# Check installation
npm list -g memai

# Reinstall globally
npm install -g memai

# Or use npx
npx memai stats

# Check PATH
echo $PATH | grep npm
```

**Problem: "Permission denied"**

```bash
# Fix permissions
chmod +x $(which memai)

# Or use sudo for global install
sudo npm install -g memai

# Or install locally
npm install memai
npx memai stats
```

### Common Errors

**Error: "Invalid date format"**

```bash
# Use ISO 8601 format
memai export json backup.json --since 2025-01-01T00:00:00Z

# Or use date command
memai export json backup.json --since $(date -I)
```

**Error: "Unknown category"**

```bash
# Check valid categories
memai recent --help

# Valid categories:
# checkpoint, decision, implementation, issue, validation, insight, user-interaction
```

**Error: "Port already in use"**

```bash
# Use different port
memai dashboard --port 8080

# Or kill process using port
lsof -ti:3030 | xargs kill
```

### Getting Help

**Check version:**

```bash
memai --version
```

**Get command help:**

```bash
memai --help
memai stats --help
memai export --help
```

**Enable debug logging:**

```bash
export MEMAI_LOG_LEVEL=debug
memai stats
```

**Report issues:**

```bash
# Gather diagnostic info
memai stats --json > diagnostics.json
sqlite3 .memai/memory.db ".schema" > schema.txt

# Submit to GitHub Issues with:
# - memAI version
# - Node.js version
# - Operating system
# - Error message
# - Steps to reproduce
```

---

## Tips and Best Practices

### Performance Tips

1. **Use specific queries** - Filter by category, phase, or date range instead of retrieving all data
2. **Limit results** - Use `--limit` or count arguments to reduce data transfer
3. **JSON for scripts** - Use `--json` flag for programmatic access (faster parsing)
4. **Regular vacuuming** - Run `VACUUM` monthly to optimize database
5. **Archive old data** - Export and remove data older than 6-12 months

### Organization Tips

1. **Consistent naming** - Use consistent phase names across your project
2. **Meaningful tags** - Use descriptive, searchable tags (e.g., "auth,oauth,security")
3. **Regular checkpoints** - Create checkpoints at major milestones
4. **Issue tracking** - Record issues immediately when encountered
5. **Daily briefings** - Start each day with a briefing to maintain context

### Integration Tips

1. **Environment variables** - Set `MEMAI_DB_PATH` for consistent database location
2. **Config file** - Use `.memairc.json` for project-specific settings
3. **Git hooks** - Automate recording with pre/post-commit hooks
4. **CI/CD** - Generate reports in your deployment pipeline
5. **Backup strategy** - Regular exports to JSON for disaster recovery

### Security Tips

1. **Local only** - memAI stores data locally; never commit `.memai/` to version control
2. **Sensitive data** - Avoid recording passwords, API keys, or PII
3. **Read-only mode** - Use `--readonly` flag when sharing dashboard access
4. **Access control** - Restrict file permissions on database: `chmod 600 .memai/memory.db`
5. **Regular backups** - Export data regularly and store securely

---

## Quick Reference

### Most Used Commands

```bash
memai init                    # Initialize database
memai stats                   # Show statistics
memai recent                  # Last 20 memories
memai search "query"          # Search memories
memai issues                  # Active issues
memai briefing                # 24-hour briefing
memai dashboard               # Launch web UI
memai export markdown out.md  # Export report
```

### Keyboard Shortcuts (Dashboard)

| Key | Action |
|-----|--------|
| `/` | Focus search |
| `Esc` | Clear search |
| `n` | Next page |
| `p` | Previous page |
| `f` | Toggle filters |
| `e` | Export current view |
| `r` | Refresh data |
| `?` | Show help |

---

## See Also

- [API Reference](API.md) - Programmatic usage with Node.js
- [Examples](EXAMPLES.md) - Integration patterns and use cases
- [README](../README.md) - Project overview and quick start
- [Contributing](../CONTRIBUTING.md) - How to contribute to memAI
- [Security](../SECURITY.md) - Security policy and reporting

---

**Need more help?** Check the [GitHub Issues](https://github.com/kraftyux/memai/issues) or [Discussions](https://github.com/kraftyux/memai/discussions).
