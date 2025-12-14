# memAI API Reference

## Installation

```bash
npm install memai
```

## Initialization

```javascript
import Memai from 'memai';

// Default path: .memai/memory.db
const memai = new Memai();

// Custom path
const memai = new Memai('./custom/path/memory.db');
```

## Recording Methods

### record(options)

Record a memory entry.

```javascript
const id = memai.record({
  category: 'implementation',  // required
  action: 'What happened',     // required
  phase: 'Current phase',      // optional
  context: 'Background info',  // optional
  reasoning: 'Why',            // optional
  outcome: 'Result',           // optional
  tags: 'tag1,tag2',           // optional
  parentId: 123                // optional
});
```

Categories: `checkpoint`, `decision`, `implementation`, `issue`, `validation`, `insight`, `user-interaction`

### recordDecision(options)

Record a technical decision.

```javascript
const id = memai.recordDecision({
  decision: 'Use PostgreSQL',      // required
  rationale: 'Need ACID',          // required
  alternatives: 'MongoDB, MySQL',  // optional
  impact: 'Better integrity',      // optional
  reversible: true,                // optional, default: true
  memoryId: 123                    // optional
});
```

### recordIssue(options)

Record a problem.

```javascript
const id = memai.recordIssue({
  severity: 'P1',              // required: P0, P1, P2, P3
  category: 'bug',             // required
  description: 'What broke',   // required
  memoryId: 123                // optional
});
```

### resolveIssue(issueId, resolution)

Mark an issue as resolved.

```javascript
memai.resolveIssue(42, 'Fixed by updating config');
```

### createCheckpoint(options)

Create a progress checkpoint.

```javascript
const id = memai.createCheckpoint({
  phase: 'MVP',                    // required
  status: 'in-progress',           // required: started, in-progress, completed, blocked
  progressPercent: 75,             // optional
  pendingActions: ['Deploy'],      // optional
  blockers: ['Waiting on API']     // optional
});
```

### addKnowledge(options)

Add to knowledge base.

```javascript
const id = memai.addKnowledge({
  topic: 'JWT Expiration',         // required
  content: 'Use 15min for access', // required
  confidence: 0.9,                 // optional, 0-1
  source: 'Security docs',         // optional
  tags: 'auth,security'            // optional
});
```

### recordFileChange(options)

Track file changes.

```javascript
const id = memai.recordFileChange({
  filePath: 'src/auth.js',    // required
  changeType: 'modified',     // required: created, modified, deleted
  reason: 'Added validation', // optional
  diffSummary: 'Added...',    // optional
  linesAdded: 15,             // optional
  linesRemoved: 3             // optional
});
```

### recordTestResults(options)

Record test execution.

```javascript
const id = memai.recordTestResults({
  testSuite: 'unit-tests',    // required
  total: 100,                 // optional
  passed: 98,                 // optional
  failed: 2,                  // optional
  skipped: 0,                 // optional
  durationMs: 5000,           // optional
  failureDetails: []          // optional
});
```

## Query Methods

### getRecentMemories(limit)

```javascript
const memories = memai.getRecentMemories(20);
```

### getPhaseContext(phase)

```javascript
const memories = memai.getPhaseContext('MVP Development');
```

### searchByTag(tag)

```javascript
const memories = memai.searchByTag('security');
```

### search(query, limit)

Semantic search (async).

```javascript
const memories = await memai.search('authentication issues', 10);
```

### getRecentDecisions(limit)

```javascript
const decisions = memai.getRecentDecisions(10);
```

### getActiveIssues()

```javascript
const issues = memai.getActiveIssues();
```

### findIssues(keyword)

```javascript
const issues = memai.findIssues('authentication');
```

### getPhaseProgress()

```javascript
const progress = memai.getPhaseProgress();
```

### getTopKnowledge(limit)

```javascript
const knowledge = memai.getTopKnowledge(20);
```

### generateBriefing(options)

```javascript
const briefing = memai.generateBriefing({
  since: Date.now() - 86400000,  // optional, default: 24h ago
  categories: ['decision'],       // optional
  maxDepth: 50                    // optional
});

// Returns:
// {
//   memories: [...],
//   activeIssues: [...],
//   latestCheckpoint: {...},
//   summary: {
//     totalMemories, categoryCounts, activeIssuesCount,
//     criticalIssuesCount, currentPhase, currentProgress,
//     currentStatus, pendingActions, blockers
//   }
// }
```

### getStats()

```javascript
const stats = memai.getStats();
// { totalMemories, totalDecisions, totalIssues,
//   resolvedIssues, activeIssues, avgResolveTimeMs }
```

## Export Methods

### exportToJson(path)

```javascript
memai.exportToJson('./backup.json');
```

### exportToMarkdown(path)

```javascript
memai.exportToMarkdown('./report.md');
```

## Utility Methods

### close()

```javascript
memai.close();
```

## MCP Server Tools

When using the MCP server, these tools are available:

| Tool | Description |
|------|-------------|
| `start_session` | Begin session with context |
| `record_memory` | Store a memory |
| `record_decision` | Track a decision |
| `search_memories` | Query by phase |
| `create_checkpoint` | Mark milestone |
| `get_briefing` | Get status summary |
| `memory_pulse` | Check recording health |
| `finish_session` | End session with report |

### Session Health

The MCP server tracks recording activity:

- `healthy`: Recording within 5 minutes
- `warning`: 5-10 minutes since recording
- `critical`: >10 minutes since recording

## Type Definitions

```typescript
interface Memory {
  id?: number;
  timestamp?: number;
  category: 'checkpoint' | 'decision' | 'implementation' | 
            'issue' | 'validation' | 'insight' | 'user-interaction';
  phase?: string;
  action: string;
  context?: string;
  reasoning?: string;
  outcome?: string;
  tags?: string;
  parentId?: number;
}

interface Decision {
  decision: string;
  rationale: string;
  alternatives?: string;
  impact?: string;
  reversible?: boolean;
  memoryId?: number;
}

interface Issue {
  severity: 'P0' | 'P1' | 'P2' | 'P3';
  category: string;
  description: string;
  memoryId?: number;
}

interface Checkpoint {
  phase: string;
  status: 'started' | 'in-progress' | 'completed' | 'blocked';
  progressPercent: number;
  pendingActions?: string[];
  blockers?: string[];
  memoryId?: number;
}
```

## Error Handling

All methods may throw on database errors. Wrap in try/catch:

```javascript
try {
  memai.record({ category: 'implementation', action: 'Test' });
} catch (error) {
  console.error('Failed:', error.message);
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MEMAI_DB_PATH` | Database path | `.memai/memory.db` |
