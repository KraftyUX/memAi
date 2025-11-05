# memAI - AI Memory System

**Never lose context again.** A persistent, queryable memory system for AI agents and development teams.

[![CI](https://github.com/yourusername/memai/workflows/CI/badge.svg)](https://github.com/yourusername/memai/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![npm version](https://img.shields.io/npm/v/memai.svg)](https://www.npmjs.com/package/memai)

---

## 🧠 What is Memai?

memAI is a **SQLite-based memory system** that enables AI agents to maintain persistent context, track decisions, and build knowledge over time. Think of it as your AI's workspace oriented long-term memory.

### The Problem

AI agents lose context between sessions. They forget:
- What decisions were made and why
- What problems were encountered
- What patterns were discovered
- What the current project state is

### The Solution

Memai provides:
- 🧠 **Persistent Memory** - SQLite database for reliable storage
- 📊 **Beautiful Dashboard** - Visual exploration in your browser
- 🔍 **Powerful Queries** - Full SQL for complex searches
- 📱 **CLI Tools** - Quick access from terminal
- 🎯 **Decision Tracking** - Record choices with rationale
- 📈 **Progress Monitoring** - Track phases and milestones
- 🏷️ **Tag Organization** - Flexible categorization
- 📄 **Export** - Markdown, JSON, or custom formats

---

## 🚀 Quick Start

### Installation

```bash
npm install memai
```

### Initialize

```bash
npx memai init
```

### Record Your First Memory

```javascript
import Memai from 'memai';

const memai = new Memai();

memai.record({
  category: 'implementation',
  phase: 'Setup',
  action: 'Initialized project with Memai',
  context: 'Setting up memory tracking for AI agent',
  reasoning: 'Need persistent context across sessions',
  outcome: 'Successfully integrated Memai',
  tags: 'setup,initialization'
});
```

### Launch Dashboard

```bash
npx memai dashboard
```

Opens at `http://localhost:3030` - UI for exploring memories!

---

## 📖 Core Concepts

### Categories

- **checkpoint** - Major milestones, phase completions
- **decision** - Technical/architectural choices
- **implementation** - Code changes, feature additions
- **issue** - Problems encountered and resolutions
- **validation** - Test results, quality checks
- **insight** - Learned patterns, best practices
- **user-interaction** - Approvals, feedback

### Memory Structure

```javascript
{
  category: 'decision',
  phase: 'Architecture Design',
  action: 'Chose PostgreSQL over MongoDB',
  context: 'Need relational data with ACID guarantees',
  reasoning: 'Complex queries, data integrity, mature ecosystem',
  outcome: 'Successful implementation, no regrets',
  tags: 'database,architecture,postgresql'
}
```

---

## 🎨 Dashboard Features

- 📊 Real-time statistics
- 🔍 Full-text search
- 🏷️ Multi-filter system
- 📑 View switcher (Memories / Decisions / Issues)
- 📄 Pagination (20 per page)
- 🌓 Dark mode (automatic)
- 📥 Export to Markdown
- 📱 Responsive design

---

## 🛠️ CLI Commands

```bash
# Show statistics
memai stats

# Recent memories
memai recent 20

# Search
memai search "database decision"

# Phase context
memai phase "Architecture Design"

# Active issues
memai issues active

# Export
memai export markdown report.md

# Generate briefing
memai briefing 48
```

---

## 📚 API Reference

### Record Memory

```javascript
memai.record({
  category: 'implementation',
  phase: 'Feature Development',
  action: 'Implemented user authentication',
  context: 'Users need secure login',
  reasoning: 'Security requirement from spec',
  outcome: 'OAuth 2.0 integration complete',
  tags: 'auth,security,oauth'
});
```

### Record Decision

```javascript
memai.recordDecision({
  decision: 'Use React over Vue',
  rationale: 'Larger ecosystem, better TypeScript support',
  alternatives: 'Vue 3, Svelte, Angular',
  impact: 'Faster development, easier hiring',
  reversible: true
});
```

### Record Issue

```javascript
const issueId = memai.recordIssue({
  severity: 'P1',
  category: 'bug',
  description: 'Login fails on Safari'
});

// Later, when resolved:
memai.resolveIssue(issueId, 'Fixed cookie SameSite attribute');
```

### Create Checkpoint

```javascript
memai.createCheckpoint({
  phase: 'MVP Development',
  status: 'completed',
  progressPercent: 100,
  pendingActions: ['Deploy to staging', 'User testing'],
  blockers: []
});
```

### Query Memories

```javascript
// Recent memories
const recent = memai.getRecentMemories(10);

// Phase context
const phaseMemories = memai.getPhaseContext('MVP Development');

// Search by tag
const authMemories = memai.searchByTag('authentication');

// Generate briefing
const briefing = memai.generateBriefing({
  since: Date.now() - (24 * 60 * 60 * 1000), // Last 24 hours
  categories: ['checkpoint', 'decision'],
  maxDepth: 3
});
```

---

## 🔌 Integrations

### Express.js

```javascript
import express from 'express';
import Memai from 'memai';

const app = express();
const memai = new Memai();

app.post('/api/memory', (req, res) => {
  const id = memai.record(req.body);
  res.json({ id, success: true });
});

app.get('/api/briefing', (req, res) => {
  const briefing = memai.generateBriefing({
    since: req.query.since,
    categories: req.query.categories?.split(',')
  });
  res.json(briefing);
});
```

### GitHub Actions

```yaml
name: Record Deployment

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install memai
      - run: |
          node -e "
          import Memai from 'memai';
          const memai = new Memai();
          memai.record({
            category: 'checkpoint',
            action: 'Deployed to production',
            outcome: 'Deployment successful'
          });
          "
```

---

## 📊 Why Memai?

### vs. Markdown Files

| Feature | Markdown | Memai |
|---------|----------|-------|
| Queryable | ❌ grep | ✅ SQL |
| Relational | ❌ manual | ✅ foreign keys |
| Fast | ❌ O(n) | ✅ O(log n) |
| Structured | ❌ freeform | ✅ schema |
| Analytics | ❌ manual | ✅ built-in |
| Visual | ❌ | ✅ dashboard |
| Export | ✅ native | ✅ supported |

### vs. Cloud Solutions

| Feature | Cloud | Memai |
|---------|-------|-------|
| Privacy | ❌ external | ✅ local-only |
| Cost | ❌ subscription | ✅ free |
| Speed | ❌ network | ✅ instant |
| Offline | ❌ | ✅ works offline |
| Portable | ❌ | ✅ single file |

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🌟 Show Your Support

If memAI helps your project, consider giving it a ⭐️ on GitHub!

---

## 📬 Links

### Documentation

- **[Documentation Hub](docs/README.md)** - Start here for all documentation
- **[API Reference](docs/API.md)** - Complete API documentation
- **[CLI Reference](docs/CLI.md)** - Command-line interface guide
- **[Examples](docs/EXAMPLES.md)** - Practical usage examples

### Community

- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute
- **[Security Policy](SECURITY.md)** - Reporting vulnerabilities
- **[Changelog](CHANGELOG.md)** - Version history
- **[Issues](https://github.com/kraftyux/memai/issues)** - Bug reports and feature requests
- **[Discussions](https://github.com/kraftyux/memai/discussions)** - Community discussions

---

**Made with ❤️ in the EU, for the AI community**
