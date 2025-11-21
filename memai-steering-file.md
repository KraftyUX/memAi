---
inclusion: always
---

# memAI workspace specific integration example

## Overview

This project uses **memai** (AI Memory System) - a SQLite-based persistent memory system that enables AI agents to maintain context, track decisions, and resume work intelligently.ux

**Location**: `.memai/`  
**Database**: `.memai/memory.db`  
**Logs**: `.memai/logs/` (JSON audit trail)  
**Documentation**: `docs/memai.md`  
**Dashboard**: `http://localhost:3030` (run `npx memai dashboard`)

## When to Use memai

### ALWAYS Record These Events

1. **Task Completion** (category: `checkpoint`)
   - When completing any task from specs
   - Include phase, progress percentage, and outcome
   - Example: "Completed Task 13.1: Windows 11 APIs"

2. **Architectural Decisions** (category: `decision`)
   - Technology choices (e.g., "Use NSIS over WiX")
   - Design patterns (e.g., "Plugin-based architecture")
   - Trade-offs and alternatives considered
   - Reversibility assessment

3. **File Changes** (category: `implementation`)
   - New files created
   - Major refactoring
   - Include reason and impact
   - Track lines added/removed

4. **Issues Encountered** (category: `issue`)
   - Bugs discovered
   - Build failures
   - Integration problems
   - Include severity (P0-P3) and resolution

5. **Test Results** (category: `validation`)
   - Test suite runs
   - Pass/fail counts
   - Performance benchmarks
   - Coverage metrics

6. **User Interactions** (category: `user-interaction`)
   - Approval checkpoints
   - Feedback received
   - Requirement clarifications

7. **Insights & Patterns** (category: `insight`)
   - Reusable solutions
   - Best practices discovered
   - Performance optimizations
   - Common pitfalls

8. **Time & Cost** (category: `insight`)
   - time it took to complete task
   - cost of task
   - time it took to complete phase
   - cost of phase
  category: 'implementation',
  phase: 'Task 13: Windows 11 Integration',
  action: 'Created windows11_service.rs',
  context: 'Implementing Windows 11 notification and file picker APIs',
  reasoning: 'Use Tauri plugins for native Windows 11 integration',
  outcome: 'Successfully integrated notification and dialog systems',
  tags: 'windows11,tauri,notifications,dialogs'
});

### Record Decision

```typescript
await memai.recordDecision({
  decision: 'Use NSIS for Windows 11 installer',
  rationale: 'Simpler scripting, smaller size, faster installation',
  alternatives: 'WiX (more complex, larger installers)',
  impact: 'Easier maintenance, better user experience',
  reversible: true
});
```

### Record File Change

```typescript
await memai.recordFileChange({
  filePath: 'src-tauri/src/services/windows11_service.rs',
  changeType: 'create',
  reason: 'Implement Windows 11 native APIs',
  diffSummary: 'Added notification and file picker services',
  linesAdded: 250,
  linesRemoved: 0
});
```

### Record Issue

```typescript
const issueId = await memai.recordIssue({
  severity: 'P1',
  category: 'build',
  description: 'Windows registry API requires additional features in Cargo.toml'
});

// Later, when resolved:
await memai.resolveIssue(issueId, 'Added Win32_System_Registry to windows crate features');
```

### Create Checkpoint

```typescript
await memai.createCheckpoint({
  phase: 'Task 13: Windows 11 Integration',
  status: 'completed',
  progressPercent: 100,
  pendingActions: [],
  blockers: []
});
```

## Querying Memories

### Resume After Interruption

```typescript
const briefing = await memai.generateBriefing({
  since: new Date('2025-01-05T10:00:00Z').getTime(),
  categories: ['checkpoint', 'decision', 'issue'],
  maxDepth: 3
});

console.log(briefing.summary);
// Shows: current phase, progress, active issues, pending actions
```

### Get Phase Context

```typescript
const taskContext = await memai.getPhaseContext('Task 13: Windows 11 Integration');
// Returns all memories related to this task
```

### Find Related Issues

```typescript
const issues = await memai.findIssues('Windows 11');
// Returns all issues mentioning Windows 11
```

### Get Recent Decisions

```typescript
const decisions = await memai.getRecentDecisions(10);
// Returns last 10 architectural decisions
```

## Integration with Development Workflow

### At Start of Session

1. Generate briefing to understand current state
2. Review active issues
3. Check latest checkpoint
4. Identify pending actions

### During Implementation

1. Record each significant file change
2. Document decisions as they're made
3. Log issues immediately when encountered
4. Create checkpoints at logical milestones

### At End of Session

1. Create final checkpoint with progress
2. Record any pending actions
3. Document blockers
4. Export markdown report if needed

### Before Committing Code

1. Review memories for this session
2. Ensure all decisions are documented
3. Verify issue resolutions are recorded
4. Update checkpoint status

## Export & Reporting

### Generate Markdown Report

```typescript
await memai.exportToMarkdown('./docs/dev/memai-report.md');
```

### Export to JSON

```typescript
await memai.exportToJson('./backups/memai-backup.json');
```

### Get Statistics

```typescript
const stats = await memai.getStats();
console.log(`Total memories: ${stats.totalMemories}`);
console.log(`Active issues: ${stats.activeIssues}`);
console.log(`Avg resolve time: ${stats.avgResolveTimeHours}h`);
```

## Best Practices

### 1. Be Specific

❌ Bad: "Fixed bug"  
✅ Good: "Fixed theme detection fallback when registry read fails"

### 2. Include Context

Always provide:

- What was done
- Why it was done
- What alternatives were considered
- What the outcome was

### 3. Tag Appropriately

Use consistent tags:

- Technology: `rust`, `typescript`, `tauri`, `react`
- Feature: `authentication`, `sync`, `gdpr`, `windows11`
- Type: `bugfix`, `feature`, `refactor`, `optimization`

### 4. Link Related Memories

Use `parentId` to create hierarchies:

```typescript
const parentId = await memai.record({ /* parent memory */ });
await memai.record({ 
  /* child memory */,
  parentId: parentId 
});
```

### 5. Update Knowledge Base

When you discover reusable patterns:

```typescript
await memai.addKnowledge({
  topic: 'Windows 11 Theme Detection',
  content: 'Read HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize\\AppsUseLightTheme. 0=dark, 1=light. Fallback to prefers-color-scheme media query.',
  confidence: 0.9,
  source: 'Task 13.2 implementation',
  tags: 'windows11,theme,registry'
});
```

## Schema Reference

### Categories

- `checkpoint` - Major milestones, phase completions
- `decision` - Technical/architectural choices
- `implementation` - Code changes, feature additions
- `issue` - Problems encountered and resolutions
- `validation` - Test results, quality checks
- `insight` - Learned patterns, best practices
- `user-interaction` - Approval checkpoints, feedback

### Severity Levels (for issues)

- `P0` - Critical, blocks progress
- `P1` - High priority, significant impact
- `P2` - Medium priority, moderate impact
- `P3` - Low priority, minor impact

### Change Types (for file changes)

- `create` - New file created
- `modify` - Existing file modified
- `delete` - File deleted
- `rename` - File renamed/moved
- `refactor` - Major restructuring

## Example: Recording Task 13 Completion

```typescript
import Memai from 'memai';
const memai = new Memai();

// Record main task completion
const taskId = await memai.record({
  category: 'checkpoint',
  phase: 'Platform Evolution v2.0',
  action: 'Completed Task 13: Windows 11 Platform Integration',
  context: 'Implemented all 4 subtasks: APIs, theme integration, performance optimization, and installer',
  reasoning: 'Required for Windows 11 exclusive platform support',
  outcome: 'All subtasks completed successfully. Ready for build testing.',
  tags: 'task-13,windows11,milestone,completed'
});

// Record key decisions
await memai.recordDecision({
  decision: 'Use Tauri plugins for notifications and dialogs',
  rationale: 'Official plugins are well-maintained, provide consistent API, handle permissions automatically',
  alternatives: 'Direct Windows API calls (more complex, less maintainable)',
  impact: 'Cleaner code, easier maintenance, cross-platform compatibility if needed',
  reversible: true,
  memoryId: taskId
});

await memai.recordDecision({
  decision: 'Use NSIS for installer over WiX',
  rationale: 'Simpler scripting, smaller installer size, faster installation, better Tauri support',
  alternatives: 'WiX (more complex XML, larger installers)',
  impact: 'Easier customization, better user experience',
  reversible: true,
  memoryId: taskId
});

// Record file changes
const files = [
  'src-tauri/src/services/windows11_service.rs',
  'src-tauri/src/services/windows11_commands.rs',
  'src-tauri/src/services/windows11_performance.rs',
  'src/services/windows11.ts',
  'src/contexts/ThemeContext.tsx',
  'src/services/theme.ts',
  'src-tauri/installer/windows11-installer.nsi'
];

for (const file of files) {
  await memai.recordFileChange({
    filePath: file,
    changeType: 'create',
    reason: 'Task 13: Windows 11 Integration',
    memoryId: taskId
  });
}

// Create checkpoint
await memai.createCheckpoint({
  phase: 'Platform Evolution v2.0',
  status: 'in-progress',
  progressPercent: 76, // 13 of 17 tasks complete
  pendingActions: [
    'Task 14: Accessibility compliance',
    'Task 15: Security hardening',
    'Task 16: Documentation',
    'Task 17: E2E testing'
  ],
  blockers: [],
  memoryId: taskId
});

// Add knowledge
await memai.addKnowledge({
  topic: 'Windows 11 Registry Theme Detection',
  content: 'Registry path: HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize, Value: AppsUseLightTheme (0=dark, 1=light). Always include fallback to prefers-color-scheme media query.',
  confidence: 0.95,
  source: 'Task 13.2 implementation',
  tags: 'windows11,theme,registry,best-practice'
});

console.log('✅ Task 13 recorded in memai');
```

## CLI Usage (Future)

```bash
# Query recent memories
npx memai query --phase "Task 13" --limit 10

# Generate resume briefing
npx memai resume --since "2025-01-05T10:00:00Z"

# Export markdown report
npx memai export --format markdown --output report.md

# Get statistics
npx memai stats --show-progress
```

## Advantages Over Markdown-Only Approach

1. **Instant Resume**: Query last 20 actions in milliseconds
2. **Relationship Tracking**: Find all decisions related to a feature
3. **Time-based Analysis**: "What happened in the last 2 hours?"
4. **Pattern Recognition**: Identify repeated solutions
5. **Progress Tracking**: Automatic phase progress calculation
6. **Issue Analytics**: Average resolution time, severity distribution
7. **Knowledge Extraction**: Build reusable best practices library
8. **Audit Trail**: Complete history with JSON logs

---

**Remember**: The more you record, the smarter the system becomes. Every decision, issue, and insight makes future work easier.
