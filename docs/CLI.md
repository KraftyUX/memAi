# memAI CLI Reference

## Installation

```bash
npm install -g memai
# or use npx
npx memai <command>
```

## Commands

### init

Initialize database.

```bash
memai init
```

### stats

Show statistics.

```bash
memai stats
```

Output:
```
📊 memAI Statistics

Memories:     142 total
Decisions:    23 tracked
Issues:       8 total (2 active, 6 resolved)
Avg Resolve:  4.2 hours
```

### recent

Show recent memories.

```bash
memai recent        # Last 20
memai recent 50     # Last 50
```

### search

Search memories.

```bash
memai search "authentication"
```

### phase

Show memories for a phase.

```bash
memai phase "MVP Development"
```

### issues

List issues.

```bash
memai issues           # Active issues
memai issues resolved  # Resolved issues
memai issues all       # All issues
```

### export

Export data.

```bash
memai export json backup.json
memai export markdown report.md
```

### briefing

Generate briefing.

```bash
memai briefing      # Last 24 hours
memai briefing 48   # Last 48 hours
```

Output:
```
🧠 memAI Briefing (Last 24 hours)

📊 Summary
  Total Memories: 34
  Active Issues: 2 (1 critical)
  Current Phase: MVP Development
  Progress: 75%
  Status: in-progress

📋 Pending Actions:
  • Deploy to staging
  • Update documentation

🐛 Active Issues:
  [P0] Login fails on Safari
  [P1] Dashboard slow
```

### dashboard

Launch web dashboard.

```bash
memai dashboard         # Port 3030
memai dashboard 8080    # Custom port
```

### help

Show help.

```bash
memai help
memai --help
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MEMAI_DB_PATH` | Database path | `.memai/memory.db` |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Error |

## Examples

### Daily Workflow

```bash
# Start of day
memai briefing 24
memai issues

# End of day
memai export markdown daily-$(date +%Y%m%d).md
```

### CI Integration

```bash
memai init --force
memai stats --json > stats.json
```
