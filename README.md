# memAI

Persistent memory for AI agents. SQLite-based, local-first, privacy-focused.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

## What it does

memAI helps AI agents remember context across sessions. It stores decisions, progress, issues, and insights in a local SQLite database that agents can query and update.

## Install

```bash
npm install memai
```

## Quick Start

```bash
# Initialize database
npx memai init

# Launch dashboard
npx memai dashboard
```

## Usage

### API

```javascript
import Memai from 'memai';

const memai = new Memai();

// Record a memory
memai.record({
  category: 'implementation',
  action: 'Added user authentication',
  outcome: 'OAuth 2.0 working',
  tags: 'auth,security'
});

// Record a decision
memai.recordDecision({
  decision: 'Use PostgreSQL',
  rationale: 'Need ACID compliance',
  alternatives: 'MongoDB, MySQL'
});

// Get recent memories
const recent = memai.getRecentMemories(10);

// Generate briefing
const briefing = memai.generateBriefing({ since: Date.now() - 86400000 });

memai.close();
```

### CLI

```bash
memai stats              # Show statistics
memai recent 20          # Recent memories
memai search "auth"      # Search memories
memai issues             # Active issues
memai briefing 24        # Last 24h briefing
memai export json out.json
```

### MCP Server

memAI includes an MCP server for Claude Desktop and other MCP clients.

Add to your MCP config:

```json
{
  "mcpServers": {
    "memai": {
      "command": "node",
      "args": ["/path/to/memai/dist/src/mcp-server.js"],
      "env": {
        "MEMAI_DB_PATH": "/path/to/.memai/memory.db"
      }
    }
  }
}
```

Available tools:
- `start_session` - Begin a session with context
- `memai_recall` - Recall last memory before tasks
- `record_memory` - Store memories
- `record_decision` - Track decisions
- `search_memories` - Query by phase
- `create_checkpoint` - Mark milestones
- `get_briefing` - Get status summary
- `memory_pulse` - Check recording health
- `finish_session` - End session with report

### AI Agent Integration

Include `memai.md` in your project for agent steering guidelines.

## Memory Categories

- `checkpoint` - Milestones
- `decision` - Technical choices
- `implementation` - Code changes
- `issue` - Problems
- `validation` - Test results
- `insight` - Learnings
- `user-interaction` - Feedback

## Documentation

- [API Reference](docs/API.md)
- [CLI Reference](docs/CLI.md)
- [Examples](docs/EXAMPLES.md)

## License

MIT - see [LICENSE](LICENSE)

## Third-Party Licenses

See [THIRD-PARTY-LICENSES.md](THIRD-PARTY-LICENSES.md) for attribution of dependencies.
