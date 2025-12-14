# memAI Examples

## Basic Usage

### Record Memories

```javascript
import Memai from 'memai';

const memai = new Memai();

// Implementation
memai.record({
  category: 'implementation',
  phase: 'Sprint 1',
  action: 'Added user authentication',
  context: 'OAuth 2.0 with Google and GitHub',
  outcome: 'Working, tests passing',
  tags: 'auth,oauth'
});

// Decision
memai.recordDecision({
  decision: 'Use PostgreSQL',
  rationale: 'Need ACID compliance and complex queries',
  alternatives: 'MongoDB, MySQL',
  impact: 'Better data integrity'
});

// Issue
const issueId = memai.recordIssue({
  severity: 'P1',
  category: 'bug',
  description: 'Login fails on Safari'
});

// Resolve issue
memai.resolveIssue(issueId, 'Fixed cookie SameSite attribute');

// Checkpoint
memai.createCheckpoint({
  phase: 'MVP',
  status: 'in-progress',
  progressPercent: 75,
  pendingActions: ['Deploy', 'Testing'],
  blockers: []
});

memai.close();
```

### Query Memories

```javascript
import Memai from 'memai';

const memai = new Memai();

// Recent memories
const recent = memai.getRecentMemories(20);

// By phase
const mvp = memai.getPhaseContext('MVP');

// By tag
const auth = memai.searchByTag('auth');

// Semantic search
const results = await memai.search('authentication problems', 10);

// Active issues
const issues = memai.getActiveIssues();

// Briefing
const briefing = memai.generateBriefing({
  since: Date.now() - 86400000,
  maxDepth: 50
});

console.log('Phase:', briefing.summary.currentPhase);
console.log('Progress:', briefing.summary.currentProgress + '%');
console.log('Issues:', briefing.summary.activeIssuesCount);

memai.close();
```

## Express.js Integration

```javascript
import express from 'express';
import Memai from 'memai';

const app = express();
const memai = new Memai();

app.use(express.json());

// Record API calls
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    memai.record({
      category: 'user-interaction',
      action: `${req.method} ${req.path}`,
      context: `Status: ${res.statusCode}, Duration: ${Date.now() - start}ms`,
      tags: 'api'
    });
  });
  next();
});

// Memory API
app.post('/api/memory', (req, res) => {
  const id = memai.record(req.body);
  res.json({ id });
});

app.get('/api/briefing', (req, res) => {
  const briefing = memai.generateBriefing({
    since: Date.now() - 86400000
  });
  res.json(briefing);
});

app.listen(3000);
```

## GitHub Actions

```yaml
name: CI with memAI

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - name: Record in memAI
        if: always()
        run: |
          node -e "
          import Memai from 'memai';
          const memai = new Memai();
          memai.record({
            category: 'validation',
            action: 'CI run',
            outcome: '${{ job.status }}',
            tags: 'ci'
          });
          memai.close();
          "
```

## AI Agent Session

```javascript
import Memai from 'memai';

class AgentSession {
  constructor() {
    this.memai = new Memai();
    this.sessionId = null;
  }

  start(goal) {
    this.sessionId = this.memai.record({
      category: 'checkpoint',
      action: 'Session started',
      context: goal,
      tags: 'session'
    });
    return this.memai.generateBriefing({ maxDepth: 50 });
  }

  recordWork(action, outcome) {
    return this.memai.record({
      category: 'implementation',
      action,
      outcome,
      parentId: this.sessionId
    });
  }

  recordDecision(decision, rationale) {
    return this.memai.recordDecision({
      decision,
      rationale,
      memoryId: this.sessionId
    });
  }

  end(summary) {
    this.memai.record({
      category: 'checkpoint',
      action: 'Session ended',
      outcome: summary,
      parentId: this.sessionId
    });
    this.memai.close();
  }
}

// Usage
const session = new AgentSession();
const context = session.start('Implement user auth');

session.recordDecision('Use JWT', 'Stateless, scalable');
session.recordWork('Added auth middleware', 'Tests passing');

session.end('Auth complete');
```

## Export and Backup

```javascript
import Memai from 'memai';

const memai = new Memai();

// JSON backup
memai.exportToJson('./backup.json');

// Markdown report
memai.exportToMarkdown('./report.md');

memai.close();
```

## Error Handling

```javascript
import Memai from 'memai';

function safeRecord(memai, data) {
  try {
    return memai.record(data);
  } catch (error) {
    console.error('Failed to record:', error.message);
    return null;
  }
}

const memai = new Memai();
const id = safeRecord(memai, {
  category: 'implementation',
  action: 'Test'
});
memai.close();
```
