# memAI Vision

## Purpose

memAI exists to solve a fundamental problem: AI agents lose context between sessions. They forget decisions, miss patterns, and repeat mistakes. memAI provides persistent, queryable memory that travels with your project.

## Principles

### Local-First
All data stays on your machine. No cloud dependencies, no subscriptions, no data leaving your control. A single SQLite file contains everything.

### Simple by Design
One database, one API, one CLI. No complex setup, no configuration files, no external services. Install and start recording.

### Agent-Native
Built for AI agents from the ground up. MCP server integration, semantic search, structured categories, and health monitoring designed for autonomous workflows.

### Developer-Friendly
TypeScript types, clear API, comprehensive CLI, web dashboard. Works the way developers expect.

## What memAI Is

- A SQLite database with a structured schema for memories
- A TypeScript/JavaScript API for recording and querying
- A CLI for quick access and automation
- An MCP server for AI agent integration
- A web dashboard for visual exploration

## What memAI Is Not

- Not a replacement for version control
- Not a task management system
- Not a cloud service
- Not a general-purpose database

## Use Cases

### AI Agent Development
Agents call `start_session` to get context, record decisions and progress during work, and call `finish_session` to checkpoint. The next session picks up where the last left off.

### Decision Documentation
Every technical choice gets recorded with rationale and alternatives. Six months later, you know why you chose PostgreSQL over MongoDB.

### Issue Tracking
Problems get logged with severity and context. Resolutions get recorded. Patterns emerge over time.

### Knowledge Building
Insights and learnings accumulate. Best practices get captured. The project gets smarter.

## Roadmap

### Current (v1.x)
- Core memory system
- MCP server integration
- Semantic search with local embeddings
- Session health monitoring
- Web dashboard

### Future Considerations
- Multi-project support
- Memory sharing between agents
- Custom embedding models
- Plugin system for exporters
- Team collaboration features

## Contributing

memAI is open source under MIT license. Contributions welcome. See [CONTRIBUTING.md](../CONTRIBUTING.md).

## Philosophy

Keep it simple. Keep it local. Keep it useful.
