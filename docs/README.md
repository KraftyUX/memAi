# memAI Documentation

Welcome to the memAI documentation hub. This guide will help you find the information you need to get started with memAI and make the most of its features.

## 📚 Quick Links

- [API Reference](API.md) - Complete API documentation for programmatic usage
- [CLI Reference](CLI.md) - Command-line interface guide
- [Examples](EXAMPLES.md) - Practical usage examples and integration patterns
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute to memAI
- [Security Policy](../SECURITY.md) - Security guidelines and vulnerability reporting
- [Changelog](../CHANGELOG.md) - Version history and release notes

## 🎯 Getting Started

### New to memAI?

1. **Installation**: Start with the [README](../README.md) for quick installation
2. **First Steps**: Check out [Basic Usage Examples](EXAMPLES.md#getting-started)
3. **CLI Basics**: Learn the [CLI commands](CLI.md) for quick access
4. **API Basics**: Explore the [API Reference](API.md) for programmatic usage

### Quick Start Checklist

- [ ] Install memAI: `npm install memai`
- [ ] Initialize database: `npx memai init`
- [ ] Record your first memory (see [Examples](EXAMPLES.md#your-first-memory))
- [ ] Launch the dashboard: `npx memai dashboard`
- [ ] Explore CLI commands: `npx memai --help`

## 📖 Documentation Categories

### Core Documentation

#### [API Reference](API.md)

Complete reference for the Memai class and all public methods.

**Topics covered:**
- Initialization and setup
- Recording methods (memories, decisions, issues, checkpoints)
- Querying methods (search, filter, retrieve)
- Management methods (database operations)
- Export methods (JSON, Markdown)
- Type definitions and best practices

**Best for:** Developers integrating memAI into applications

#### [CLI Reference](CLI.md)

Comprehensive guide to the command-line interface.

**Topics covered:**
- All CLI commands with syntax and options
- Configuration and environment variables
- Output formats (text, JSON, Markdown)
- Common workflows and automation
- Troubleshooting and tips

**Best for:** Users who prefer terminal-based workflows

#### [Examples](EXAMPLES.md)

Practical, runnable code examples for common use cases.

**Topics covered:**
- Recording different memory types
- Querying and searching memories
- Integration patterns (Express.js, GitHub Actions, Next.js)
- Advanced usage (custom exports, analytics)
- Real-world scenarios

**Best for:** Learning by example and quick implementation

### Project Documentation

#### [Contributing Guide](../CONTRIBUTING.md)

Guidelines for contributing to the memAI project.

**Topics covered:**
- Code of conduct
- Development setup and workflow
- Coding standards and best practices
- Testing requirements
- Pull request process

**Best for:** Contributors and maintainers

#### [Security Policy](../SECURITY.md)

Security guidelines and vulnerability reporting.

**Topics covered:**
- Supported versions
- Reporting vulnerabilities
- Security best practices
- Response timeline

**Best for:** Security researchers and users concerned about security

#### [Changelog](../CHANGELOG.md)

Version history and release notes.

**Topics covered:**
- Release history
- New features and improvements
- Bug fixes and breaking changes
- Migration guides

**Best for:** Tracking project evolution and planning upgrades

## 🔍 Find What You Need

### By Task

**I want to...**

- **Record a memory** → [API: record()](API.md#record) or [CLI: recent](CLI.md#recent)
- **Track a decision** → [API: recordDecision()](API.md#recorddecision) or [Examples: Decision Tracking](EXAMPLES.md#decision-tracking)
- **Report an issue** → [API: recordIssue()](API.md#recordissue) or [CLI: issues](CLI.md#issues)
- **Search memories** → [API: searchByTag()](API.md#searchbytag) or [CLI: search](CLI.md#search)
- **Generate a briefing** → [API: generateBriefing()](API.md#generatebriefing) or [CLI: briefing](CLI.md#briefing)
- **Export data** → [API: exportToJson()](API.md#exporttojson) or [CLI: export](CLI.md#export)
- **View statistics** → [API: getStats()](API.md#getstats) or [CLI: stats](CLI.md#stats)
- **Launch dashboard** → [CLI: dashboard](CLI.md#dashboard)

### By Integration

**I'm using...**

- **Express.js** → [Examples: Express.js Integration](EXAMPLES.md#expressjs-integration)
- **GitHub Actions** → [Examples: GitHub Actions Integration](EXAMPLES.md#github-actions-integration)
- **Next.js** → [Examples: Next.js Integration](EXAMPLES.md#nextjs-integration)
- **Jest** → [Examples: Jest Testing Integration](EXAMPLES.md#jest-testing-integration)
- **Custom CLI** → [Examples: CLI Script Integration](EXAMPLES.md#cli-script-integration)

### By Concept

**I need to understand...**

- **Memory categories** → [README: Core Concepts](../README.md#core-concepts)
- **Memory structure** → [README: Memory Structure](../README.md#memory-structure)
- **Database schema** → [API: Type Definitions](API.md#type-definitions)
- **Query patterns** → [API: Querying Methods](API.md#querying-methods)
- **Error handling** → [API: Error Handling](API.md#error-handling)
- **Performance** → [API: Performance Considerations](API.md#performance-considerations)

## 🎓 Learning Paths

### For Beginners

1. Read the [README](../README.md) to understand what memAI is
2. Follow the [Quick Start](../README.md#quick-start) guide
3. Try the [Getting Started Examples](EXAMPLES.md#getting-started)
4. Explore the [CLI commands](CLI.md) for daily use
5. Review [Best Practices](API.md#best-practices)

### For Developers

1. Review the [API Reference](API.md) for all available methods
2. Study the [Integration Examples](EXAMPLES.md#integration-examples)
3. Understand [Error Handling](API.md#error-handling) patterns
4. Explore [Advanced Usage](EXAMPLES.md#advanced-usage) scenarios
5. Check [Contributing Guidelines](../CONTRIBUTING.md) if you want to contribute

### For Teams

1. Set up [GitHub Actions Integration](EXAMPLES.md#github-actions-integration)
2. Implement [Express.js Integration](EXAMPLES.md#expressjs-integration) for APIs
3. Use [CLI automation](CLI.md#automation-with-cron) for reporting
4. Establish [Best Practices](API.md#best-practices) for your team
5. Review [Security Policy](../SECURITY.md) for compliance

## 🛠️ Common Use Cases

### AI Agent Development

- **Context Preservation**: Use [generateBriefing()](API.md#generatebriefing) to resume work
- **Decision Tracking**: Record all decisions with [recordDecision()](API.md#recorddecision)
- **Progress Monitoring**: Create checkpoints with [createCheckpoint()](API.md#createcheckpoint)
- **Issue Management**: Track problems with [recordIssue()](API.md#recordissue)

**See:** [Examples: AI Agent Session Tracking](EXAMPLES.md#real-world-use-case-ai-agent-session-tracking)

### Development Teams

- **Sprint Tracking**: Record implementation progress
- **Knowledge Base**: Store learned patterns with [addKnowledge()](API.md#addknowledge)
- **Test Tracking**: Monitor quality with [recordTestResults()](API.md#recordtestresults)
- **Retrospectives**: Export data for review

**See:** [CLI: Common Workflows](CLI.md#common-workflows)

### Solo Developers

- **Project Memory**: Never forget why you made a decision
- **Context Switching**: Quick briefings when switching projects
- **Progress Tracking**: Visual dashboard for motivation
- **Documentation**: Auto-generate project reports

**See:** [Examples: Getting Started](EXAMPLES.md#getting-started)

## 📊 Feature Matrix

| Feature | API | CLI | Dashboard |
|---------|-----|-----|-----------|
| Record memories | ✅ | ❌ | ❌ |
| View memories | ✅ | ✅ | ✅ |
| Search | ✅ | ✅ | ✅ |
| Filter by category | ✅ | ✅ | ✅ |
| Filter by phase | ✅ | ✅ | ✅ |
| Filter by tags | ✅ | ✅ | ✅ |
| Generate briefing | ✅ | ✅ | ❌ |
| Export JSON | ✅ | ✅ | ❌ |
| Export Markdown | ✅ | ✅ | ✅ |
| Statistics | ✅ | ✅ | ✅ |
| Issue tracking | ✅ | ✅ | ✅ |
| Decision tracking | ✅ | ✅ | ✅ |
| Visual exploration | ❌ | ❌ | ✅ |
| Real-time updates | ❌ | ❌ | ✅ |

## 🤝 Contributing to Documentation

We welcome documentation improvements! Here's how to help:

### Reporting Issues

Found a typo or unclear explanation?

1. Check [existing issues](https://github.com/kraftyux/memai/issues)
2. Create a new issue with the `documentation` label
3. Describe what's unclear or incorrect
4. Suggest improvements if possible

### Improving Documentation

Want to improve the docs?

1. Read the [Contributing Guide](../CONTRIBUTING.md)
2. Follow the [Documentation Requirements](../CONTRIBUTING.md#documentation-requirements)
3. Make your changes in a feature branch
4. Submit a pull request with clear description

### Documentation Standards

- **Clarity**: Use simple, clear language
- **Examples**: Include code examples for concepts
- **Completeness**: Cover all parameters and return values
- **Accuracy**: Test all code examples before submitting
- **Consistency**: Follow existing formatting and style

**See:** [Contributing Guide: Documentation Requirements](../CONTRIBUTING.md#documentation-requirements)

## 📞 Getting Help

### Documentation Not Enough?

- **GitHub Issues**: [Report bugs or request features](https://github.com/kraftyux/memai/issues)
- **GitHub Discussions**: [Ask questions and share ideas](https://github.com/kraftyux/memai/discussions)
- **Stack Overflow**: Tag questions with `memai`

### Quick Troubleshooting

- **Installation issues**: Check [Node.js version requirements](../README.md)
- **CLI not found**: See [CLI Troubleshooting](CLI.md#cli-not-found)
- **Database errors**: See [CLI Troubleshooting: Database Issues](CLI.md#database-issues)
- **Performance issues**: See [API: Performance Considerations](API.md#performance-considerations)

## 🗺️ Documentation Roadmap

### Planned Additions

- **Video Tutorials**: Step-by-step video guides
- **Architecture Guide**: Deep dive into memAI internals
- **Migration Guide**: Upgrading between major versions
- **Recipes**: Common patterns and solutions
- **API Client Libraries**: Documentation for other languages

### Recent Updates

See [CHANGELOG.md](../CHANGELOG.md) for documentation updates in each release.

## 📝 Documentation Versions

This documentation is for **memAI v1.0.0**.

- **Latest**: You're reading it!
- **Previous versions**: See [GitHub releases](https://github.com/kraftyux/memai/releases)

## 🌟 Quick Reference Card

### Most Used API Methods

```javascript
// Record
memai.record({ category, action, outcome, tags })
memai.recordDecision({ decision, rationale, alternatives })
memai.recordIssue({ severity, category, description })

// Query
memai.getRecentMemories(limit)
memai.searchByTag(tag)
memai.generateBriefing({ since, categories })

// Export
memai.exportToJson(path)
memai.exportToMarkdown(path)
```

### Most Used CLI Commands

```bash
memai init                    # Initialize database
memai stats                   # Show statistics
memai recent 20               # Last 20 memories
memai search "query"          # Search memories
memai issues                  # Active issues
memai briefing                # 24-hour briefing
memai dashboard               # Launch web UI
memai export markdown out.md  # Export report
```

---

**Happy coding with memAI!** 🧠✨

If you find memAI useful, please ⭐️ the project on GitHub and share it with others!
