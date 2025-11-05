# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [1.0.0] - 2025-11-05

### Added

- **Core Memory System**
  - SQLite-based persistent memory storage
  - Structured memory recording with categories, phases, and tags
  - Full-text search capabilities across all memory fields
  - Relational data model with foreign keys and indexes

- **Memory Categories**
  - Checkpoint tracking for milestones and phase completions
  - Decision recording with rationale and alternatives
  - Implementation tracking for code changes and features
  - Issue management with severity levels and resolution tracking
  - Validation recording for test results and quality checks
  - Insight capture for learned patterns and best practices
  - User interaction logging for approvals and feedback

- **API Methods**
  - `record()` - Record general memories with full context
  - `recordDecision()` - Track technical and architectural decisions
  - `recordIssue()` - Log problems with severity and category
  - `resolveIssue()` - Mark issues as resolved with solution
  - `createCheckpoint()` - Create phase milestones with progress tracking
  - `getRecentMemories()` - Retrieve recent memories with limit
  - `getPhaseContext()` - Get all memories for a specific phase
  - `searchByTag()` - Search memories by tag
  - `generateBriefing()` - Create structured summaries with filtering
  - `exportToMarkdown()` - Export memories in markdown format

- **CLI Commands**
  - `memai init` - Initialize database with schema
  - `memai stats` - Display memory statistics and counts
  - `memai recent [n]` - Show recent memories (default: 10)
  - `memai search <query>` - Full-text search across memories
  - `memai phase <name>` - Show all memories for a phase
  - `memai issues [status]` - List issues by status (active/resolved/all)
  - `memai export <format> <file>` - Export data (markdown/json)
  - `memai briefing [hours]` - Generate briefing for time period
  - `memai dashboard` - Launch web dashboard

- **Web Dashboard**
  - Real-time statistics display (total memories, decisions, issues)
  - Full-text search with instant results
  - Multi-filter system (category, phase, tags, date range)
  - View switcher (All Memories / Decisions / Issues)
  - Pagination with 20 items per page
  - Automatic dark mode based on system preferences
  - Export to markdown functionality
  - Responsive design for mobile and desktop
  - Memory detail cards with expandable context
  - Tag-based navigation and filtering

- **Database Schema**
  - `memories` table with full-text search index
  - `decisions` table with foreign key to memories
  - `issues` table with status tracking
  - `checkpoints` table with progress monitoring
  - Indexes on frequently queried columns
  - Timestamps for all records

- **Documentation**
  - Comprehensive README with quick start guide
  - API reference with method signatures and examples
  - CLI command documentation
  - Integration examples (Express.js, GitHub Actions)
  - Core concepts and memory structure guide
  - Dashboard feature overview

### Changed

### Deprecated

### Removed

### Fixed

### Security

- SQLite database with parameterized queries to prevent SQL injection
- Local-only storage with no external data transmission
- File-based database with OS-level permission controls

---

## Release Notes

### Version 1.0.0 - Initial Release

This is the first stable release of memAI, a persistent memory system for AI agents and development teams.

**Highlights:**

- Complete SQLite-based memory system with structured data model
- Beautiful web dashboard for visual exploration
- Powerful CLI tools for terminal-based workflows
- Comprehensive API for programmatic access
- Full-text search and flexible querying
- Export capabilities (Markdown, JSON)
- Zero external dependencies for core functionality
- Local-only storage for privacy and speed

**Getting Started:**

```bash
npm install memai
npx memai init
npx memai dashboard
```

**Use Cases:**

- AI agent context persistence across sessions
- Development decision tracking and documentation
- Project knowledge base and institutional memory
- Issue tracking and resolution history
- Progress monitoring and milestone tracking
- Team collaboration and knowledge sharing

**Requirements:**

- Node.js >= 16.0.0
- SQLite support (via better-sqlite3)

**License:** MIT

---

[Unreleased]: https://github.com/kraftyux/memai/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/kraftyux/memai/releases/tag/v1.0.0
