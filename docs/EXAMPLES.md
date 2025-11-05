# memAI Examples

This guide provides practical, runnable examples for common memAI use cases. All examples assume you have memAI installed and initialized.

## Table of Contents

- [Getting Started](#getting-started)
- [Recording Different Memory Types](#recording-different-memory-types)
- [Querying and Searching](#querying-and-searching)
- [Integration Examples](#integration-examples)
- [Advanced Usage](#advanced-usage)

---

## Getting Started

### Installation and Setup

```bash
# Install memAI
npm install memai

# Initialize database
npx memai init
```

### Your First Memory

```javascript
import Memai from 'memai';

// Create instance (uses .memai/memory.db by default)
const memai = new Memai();

// Record a simple memory
memai.record({
  category: 'implementation',
  action: 'Created user registration endpoint',
  outcome: 'Successfully implemented with validation'
});

// Close when done
memai.close();
```

### Custom Database Location

```javascript
import Memai from 'memai';
import { join } from 'path';

// Use custom database path
const memai = new Memai(join(process.cwd(), 'data', 'project-memory.db'));

memai.record({
  category: 'checkpoint',
  action: 'Project initialized with custom memory location'
});

memai.close();
```

---

## Recording Different Memory Types

### Implementation Memories

Track code changes and feature implementations:

```javascript
import Memai from 'memai';

const memai = new Memai();

// Record feature implementation
memai.record({
  category: 'implementation',
  phase: 'Sprint 1',
  action: 'Implemented user authentication system',
  context: 'Users need secure login with OAuth support',
  reasoning: 'Security requirement from product spec',
  outcome: 'OAuth 2.0 integration complete with Google and GitHub providers',
  tags: 'auth,security,oauth,sprint1'
});

// Record bug fix
memai.record({
  category: 'implementation',
  phase: 'Bug Fixes',
  action: 'Fixed memory leak in WebSocket connections',
  context: 'Server memory usage growing over time',
  reasoning: 'Event listeners not being cleaned up on disconnect',
  outcome: 'Memory usage stable, added cleanup in disconnect handler',
  tags: 'bugfix,websocket,performance'
});

memai.close();
```

### Decision Tracking


Record architectural and technical decisions:

```javascript
import Memai from 'memai';

const memai = new Memai();

// Record a major architectural decision
const decisionId = memai.recordDecision({
  decision: 'Use PostgreSQL instead of MongoDB',
  rationale: 'Need ACID guarantees, complex relational queries, and mature ecosystem',
  alternatives: 'MongoDB (document store), MySQL (older), DynamoDB (cloud-only)',
  impact: 'Better data integrity, easier complex queries, slight learning curve for team',
  reversible: false
});

console.log(`Decision recorded with ID: ${decisionId}`);

// Record a reversible decision
memai.recordDecision({
  decision: 'Use Tailwind CSS for styling',
  rationale: 'Rapid development, utility-first approach, smaller bundle than Bootstrap',
  alternatives: 'Bootstrap, Material-UI, custom CSS',
  impact: 'Faster UI development, consistent design system',
  reversible: true
});

memai.close();
```

### Issue Tracking

Track problems and their resolutions:

```javascript
import Memai from 'memai';

const memai = new Memai();

// Record a critical issue
const issueId = memai.recordIssue({
  severity: 'P0',
  category: 'bug',
  description: 'Production API returning 500 errors for /users endpoint'
});

console.log(`Issue recorded with ID: ${issueId}`);

// Later, when the issue is resolved
memai.resolveIssue(issueId, 'Fixed null pointer exception in user query. Added validation for missing fields.');

// Record a lower priority issue
const minorIssueId = memai.recordIssue({
  severity: 'P2',
  category: 'enhancement',
  description: 'Dashboard loading slowly on mobile devices'
});

memai.close();
```


### Checkpoint Creation

Mark major milestones and track progress:

```javascript
import Memai from 'memai';

const memai = new Memai();

// Create checkpoint for completed phase
memai.createCheckpoint({
  phase: 'MVP Development',
  status: 'completed',
  progressPercent: 100,
  pendingActions: ['Deploy to staging', 'User acceptance testing'],
  blockers: []
});

// Create checkpoint for in-progress phase
memai.createCheckpoint({
  phase: 'Beta Testing',
  status: 'in-progress',
  progressPercent: 45,
  pendingActions: [
    'Fix reported bugs',
    'Implement user feedback',
    'Performance optimization'
  ],
  blockers: [
    'Waiting for third-party API access',
    'Design approval needed for new feature'
  ]
});

memai.close();
```

### Knowledge Base

Store learned patterns and insights:

```javascript
import Memai from 'memai';

const memai = new Memai();

// Add technical knowledge
memai.addKnowledge({
  topic: 'Database Connection Pooling',
  content: 'Use connection pool size of 10-20 for our workload. Higher values cause memory issues.',
  confidence: 0.9,
  source: 'Production monitoring and load testing',
  tags: 'database,performance,best-practice'
});

// Add architectural insight
memai.addKnowledge({
  topic: 'API Rate Limiting',
  content: 'Implement rate limiting at 100 requests/minute per user to prevent abuse',
  confidence: 0.85,
  source: 'Security audit recommendations',
  tags: 'security,api,rate-limiting'
});

memai.close();
```


### Test Results

Track test execution and quality metrics:

```javascript
import Memai from 'memai';

const memai = new Memai();

// Record successful test run
memai.recordTestResults({
  testSuite: 'Unit Tests',
  total: 150,
  passed: 150,
  failed: 0,
  skipped: 0,
  durationMs: 2340
});

// Record test run with failures
memai.recordTestResults({
  testSuite: 'Integration Tests',
  total: 45,
  passed: 42,
  failed: 3,
  skipped: 0,
  durationMs: 8920,
  failureDetails: [
    { test: 'API authentication flow', error: 'Timeout after 5000ms' },
    { test: 'Database transaction rollback', error: 'Connection refused' },
    { test: 'Email notification sending', error: 'SMTP server unavailable' }
  ]
});

memai.close();
```

### File Changes

Track code modifications:

```javascript
import Memai from 'memai';

const memai = new Memai();

// Record file modification
memai.recordFileChange({
  filePath: 'src/api/users.js',
  changeType: 'modified',
  reason: 'Added email validation to user registration',
  diffSummary: 'Added regex validation and error handling for email field',
  linesAdded: 15,
  linesRemoved: 3
});

// Record new file creation
memai.recordFileChange({
  filePath: 'src/utils/validators.js',
  changeType: 'created',
  reason: 'Extracted validation logic into reusable utility module',
  diffSummary: 'Created validators for email, phone, and password',
  linesAdded: 87,
  linesRemoved: 0
});

memai.close();
```

---

## Querying and Searching

### Get Recent Memories

```javascript
import Memai from 'memai';

const memai = new Memai();

// Get last 20 memories (default)
const recent = memai.getRecentMemories();
console.log(`Found ${recent.length} recent memories`);

// Get last 50 memories
const moreRecent = memai.getRecentMemories(50);

// Display recent memories
moreRecent.forEach(memory => {
  console.log(`[${memory.category}] ${memory.action}`);
  if (memory.outcome) {
    console.log(`  Outcome: ${memory.outcome}`);
  }
});

memai.close();
```


### Search by Phase

```javascript
import Memai from 'memai';

const memai = new Memai();

// Get all memories from a specific phase
const mvpMemories = memai.getPhaseContext('MVP Development');

console.log(`MVP Development phase has ${mvpMemories.length} memories`);

// Analyze phase activities
const categories = mvpMemories.reduce((acc, m) => {
  acc[m.category] = (acc[m.category] || 0) + 1;
  return acc;
}, {});

console.log('Category breakdown:', categories);

memai.close();
```

### Search by Tags

```javascript
import Memai from 'memai';

const memai = new Memai();

// Find all authentication-related memories
const authMemories = memai.searchByTag('auth');

console.log(`Found ${authMemories.length} authentication memories`);

// Find security-related memories
const securityMemories = memai.searchByTag('security');

// Display tagged memories
securityMemories.forEach(memory => {
  console.log(`${memory.action} - Tags: ${memory.tags}`);
});

memai.close();
```

### Get Active Issues

```javascript
import Memai from 'memai';

const memai = new Memai();

// Get all unresolved issues
const activeIssues = memai.getActiveIssues();

console.log(`Active issues: ${activeIssues.length}`);

// Group by severity
const bySeverity = activeIssues.reduce((acc, issue) => {
  acc[issue.severity] = (acc[issue.severity] || 0) + 1;
  return acc;
}, {});

console.log('Issues by severity:', bySeverity);

// Display critical issues
const critical = activeIssues.filter(i => i.severity === 'P0');
critical.forEach(issue => {
  console.log(`[P0] ${issue.description}`);
  console.log(`  Age: ${(issue.age_ms / (1000 * 60 * 60)).toFixed(1)} hours`);
});

memai.close();
```


### Get Statistics

```javascript
import Memai from 'memai';

const memai = new Memai();

// Get overall statistics
const stats = memai.getStats();

console.log('memAI Statistics:');
console.log(`  Total Memories: ${stats.totalMemories}`);
console.log(`  Total Decisions: ${stats.totalDecisions}`);
console.log(`  Active Issues: ${stats.activeIssues}`);
console.log(`  Resolved Issues: ${stats.resolvedIssues}`);
console.log(`  Avg Resolution Time: ${stats.avgResolveTimeHours} hours`);

memai.close();
```

### Generate Briefing

```javascript
import Memai from 'memai';

const memai = new Memai();

// Generate briefing for last 24 hours
const briefing = memai.generateBriefing({
  since: Date.now() - (24 * 60 * 60 * 1000),
  maxDepth: 50
});

console.log('Last 24 Hours Summary:');
console.log(`  Memories: ${briefing.summary.totalMemories}`);
console.log(`  Active Issues: ${briefing.summary.activeIssuesCount}`);
console.log(`  Critical Issues: ${briefing.summary.criticalIssuesCount}`);
console.log(`  Current Phase: ${briefing.summary.currentPhase}`);
console.log(`  Progress: ${briefing.summary.currentProgress}%`);

// Display pending actions
if (briefing.summary.pendingActions.length > 0) {
  console.log('\nPending Actions:');
  briefing.summary.pendingActions.forEach(action => {
    console.log(`  - ${action}`);
  });
}

// Display blockers
if (briefing.summary.blockers.length > 0) {
  console.log('\nBlockers:');
  briefing.summary.blockers.forEach(blocker => {
    console.log(`  - ${blocker}`);
  });
}

memai.close();
```

### Filter Briefing by Category

```javascript
import Memai from 'memai';

const memai = new Memai();

// Get only decisions and checkpoints from last week
const weeklyBriefing = memai.generateBriefing({
  since: Date.now() - (7 * 24 * 60 * 60 * 1000),
  categories: ['decision', 'checkpoint'],
  maxDepth: 100
});

console.log('Weekly Decisions & Checkpoints:');
weeklyBriefing.memories.forEach(memory => {
  console.log(`[${memory.category}] ${memory.action}`);
});

memai.close();
```

---

## Integration Examples


### Express.js Integration

Track API requests and responses:

```javascript
import express from 'express';
import Memai from 'memai';

const app = express();
const memai = new Memai();

app.use(express.json());

// Middleware to track API requests
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    memai.record({
      category: 'user-interaction',
      action: `${req.method} ${req.path}`,
      context: `Status: ${res.statusCode}, Duration: ${duration}ms`,
      tags: `api,${req.method.toLowerCase()},${res.statusCode >= 400 ? 'error' : 'success'}`
    });
  });
  
  next();
});

// API endpoint to record memories
app.post('/api/memory', (req, res) => {
  try {
    const id = memai.record(req.body);
    res.json({ success: true, id });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// API endpoint to get briefing
app.get('/api/briefing', (req, res) => {
  const hours = parseInt(req.query.hours) || 24;
  const briefing = memai.generateBriefing({
    since: Date.now() - (hours * 60 * 60 * 1000),
    categories: req.query.categories?.split(',')
  });
  res.json(briefing);
});

// API endpoint to get statistics
app.get('/api/stats', (req, res) => {
  const stats = memai.getStats();
  res.json(stats);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  memai.close();
  process.exit(0);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```


### GitHub Actions Integration

Track CI/CD pipeline events:

```yaml
name: CI Pipeline with memAI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Record test results in memAI
        if: always()
        run: |
          node -e "
          import Memai from 'memai';
          const memai = new Memai();
          memai.record({
            category: 'validation',
            phase: 'CI Pipeline',
            action: 'Ran automated tests',
            context: 'GitHub Actions - ${{ github.ref }}',
            outcome: '${{ job.status }}',
            tags: 'ci,testing,github-actions'
          });
          memai.close();
          "
  
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: npm run deploy
      
      - name: Record deployment in memAI
        run: |
          node -e "
          import Memai from 'memai';
          const memai = new Memai();
          memai.createCheckpoint({
            phase: 'Production Deployment',
            status: 'completed',
            progressPercent: 100,
            pendingActions: [],
            blockers: []
          });
          memai.record({
            category: 'checkpoint',
            action: 'Deployed to production',
            context: 'Commit: ${{ github.sha }}',
            outcome: 'Deployment successful',
            tags: 'deployment,production,ci'
          });
          memai.close();
          "
```


### Next.js Integration

Track page views and API routes:

```javascript
// pages/api/memory.js
import Memai from 'memai';

const memai = new Memai();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const id = memai.record(req.body);
      res.status(200).json({ success: true, id });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else if (req.method === 'GET') {
    const recent = memai.getRecentMemories(20);
    res.status(200).json(recent);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
```

```javascript
// lib/memai-client.js
export async function recordMemory(memory) {
  const response = await fetch('/api/memory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(memory)
  });
  return response.json();
}

export async function getRecentMemories() {
  const response = await fetch('/api/memory');
  return response.json();
}
```

```javascript
// pages/index.js
import { useEffect } from 'react';
import { recordMemory } from '../lib/memai-client';

export default function Home() {
  useEffect(() => {
    // Track page view
    recordMemory({
      category: 'user-interaction',
      action: 'Viewed home page',
      tags: 'pageview,home'
    });
  }, []);

  return <div>Welcome to memAI</div>;
}
```


### Jest Testing Integration

Track test execution automatically:

```javascript
// jest.config.js
export default {
  testEnvironment: 'node',
  reporters: [
    'default',
    ['./memai-reporter.js', {}]
  ]
};
```

```javascript
// memai-reporter.js
import Memai from 'memai';

class MemaiReporter {
  constructor(globalConfig, options) {
    this.memai = new Memai();
  }

  onRunComplete(contexts, results) {
    this.memai.recordTestResults({
      testSuite: 'Jest Tests',
      total: results.numTotalTests,
      passed: results.numPassedTests,
      failed: results.numFailedTests,
      skipped: results.numPendingTests,
      durationMs: results.testResults.reduce((sum, r) => sum + (r.perfStats?.end - r.perfStats?.start || 0), 0),
      failureDetails: results.testResults
        .filter(r => r.numFailingTests > 0)
        .map(r => ({
          test: r.testFilePath,
          error: r.failureMessage
        }))
    });

    this.memai.close();
  }
}

export default MemaiReporter;
```

### CLI Script Integration

Create custom CLI tools with memAI:

```javascript
#!/usr/bin/env node
// scripts/deploy.js
import Memai from 'memai';
import { execSync } from 'child_process';

const memai = new Memai();

console.log('Starting deployment...');

try {
  // Record deployment start
  const memoryId = memai.record({
    category: 'checkpoint',
    phase: 'Deployment',
    action: 'Starting production deployment',
    tags: 'deployment,production'
  });

  // Run deployment commands
  execSync('npm run build', { stdio: 'inherit' });
  execSync('npm run upload', { stdio: 'inherit' });

  // Record success
  memai.record({
    category: 'checkpoint',
    action: 'Deployment completed successfully',
    outcome: 'All services running, health checks passed',
    tags: 'deployment,production,success',
    parentId: memoryId
  });

  console.log('✅ Deployment successful');
} catch (error) {
  // Record failure
  memai.recordIssue({
    severity: 'P0',
    category: 'deployment',
    description: `Deployment failed: ${error.message}`
  });

  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
} finally {
  memai.close();
}
```


---

## Advanced Usage

### Real-World Use Case: AI Agent Session Tracking

Track an AI agent's work session with context preservation:

```javascript
import Memai from 'memai';

class AIAgentSession {
  constructor(sessionName) {
    this.memai = new Memai();
    this.sessionName = sessionName;
    this.sessionId = null;
    this.startSession();
  }

  startSession() {
    this.sessionId = this.memai.record({
      category: 'checkpoint',
      phase: this.sessionName,
      action: 'AI agent session started',
      context: `Session: ${this.sessionName}`,
      tags: 'session,start'
    });

    this.memai.createCheckpoint({
      phase: this.sessionName,
      status: 'in-progress',
      progressPercent: 0,
      pendingActions: [],
      blockers: []
    });
  }

  recordThought(thought, reasoning) {
    return this.memai.record({
      category: 'insight',
      phase: this.sessionName,
      action: thought,
      reasoning: reasoning,
      tags: 'thought,reasoning',
      parentId: this.sessionId
    });
  }

  recordAction(action, context, outcome) {
    return this.memai.record({
      category: 'implementation',
      phase: this.sessionName,
      action: action,
      context: context,
      outcome: outcome,
      tags: 'action,implementation',
      parentId: this.sessionId
    });
  }

  recordDecision(decision, rationale, alternatives) {
    return this.memai.recordDecision({
      decision: decision,
      rationale: rationale,
      alternatives: alternatives,
      memoryId: this.sessionId
    });
  }

  recordIssue(description, severity = 'P2') {
    return this.memai.recordIssue({
      severity: severity,
      category: 'bug',
      description: description,
      memoryId: this.sessionId
    });
  }

  updateProgress(percent, pendingActions = [], blockers = []) {
    this.memai.createCheckpoint({
      phase: this.sessionName,
      status: 'in-progress',
      progressPercent: percent,
      pendingActions: pendingActions,
      blockers: blockers,
      memoryId: this.sessionId
    });
  }

  endSession(summary) {
    this.memai.record({
      category: 'checkpoint',
      phase: this.sessionName,
      action: 'AI agent session completed',
      outcome: summary,
      tags: 'session,end',
      parentId: this.sessionId
    });

    this.memai.createCheckpoint({
      phase: this.sessionName,
      status: 'completed',
      progressPercent: 100,
      pendingActions: [],
      blockers: []
    });

    this.memai.close();
  }

  generateSessionBriefing() {
    const briefing = this.memai.generateBriefing({
      since: 0,
      maxDepth: 1000
    });

    return briefing;
  }
}

// Usage
const session = new AIAgentSession('Feature Implementation');

session.recordThought(
  'Need to implement user authentication',
  'Security requirement from product spec'
);

session.recordDecision(
  'Use JWT for authentication',
  'Stateless, scalable, widely supported',
  'Session cookies, OAuth only'
);

session.recordAction(
  'Implemented JWT authentication middleware',
  'Created middleware to verify JWT tokens on protected routes',
  'Successfully integrated, all tests passing'
);

session.updateProgress(75, ['Add refresh token logic', 'Write documentation']);

session.endSession('Successfully implemented JWT authentication with middleware');
```


### Custom Export Format: HTML Report

Create a custom HTML export with styling:

```javascript
import Memai from 'memai';
import { writeFileSync } from 'fs';

function exportToHTML(outputPath) {
  const memai = new Memai();
  const briefing = memai.generateBriefing({ since: 0, maxDepth: 1000 });
  const stats = memai.getStats();
  const phaseProgress = memai.getPhaseProgress();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>memAI Project Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #667eea;
    }
    .stat-label {
      color: #666;
      margin-top: 5px;
    }
    .section {
      background: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .memory-item {
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 10px 0;
      background: #f9f9f9;
    }
    .phase-progress {
      margin: 10px 0;
      padding: 10px;
      background: #f0f0f0;
      border-radius: 5px;
    }
    .progress-bar {
      height: 20px;
      background: #e0e0e0;
      border-radius: 10px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>memAI Project Report</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
  </div>

  <div class="stats">
    <div class="stat-card">
      <div class="stat-value">${stats.totalMemories}</div>
      <div class="stat-label">Total Memories</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${stats.totalDecisions}</div>
      <div class="stat-label">Decisions Made</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${stats.activeIssues}</div>
      <div class="stat-label">Active Issues</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${briefing.summary.currentProgress}%</div>
      <div class="stat-label">Current Progress</div>
    </div>
  </div>

  <div class="section">
    <h2>Phase Progress</h2>
    ${phaseProgress.map(phase => `
      <div class="phase-progress">
        <strong>${phase.phase}</strong> - ${phase.status}
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${phase.progress_percent}%"></div>
        </div>
        <small>${phase.memory_count} memories</small>
      </div>
    `).join('')}
  </div>

  <div class="section">
    <h2>Recent Activity</h2>
    ${briefing.memories.slice(0, 20).map(memory => `
      <div class="memory-item">
        <strong>${memory.action}</strong>
        <div><small>${memory.category} | ${new Date(memory.timestamp).toLocaleString()}</small></div>
        ${memory.outcome ? `<p>${memory.outcome}</p>` : ''}
      </div>
    `).join('')}
  </div>
</body>
</html>
  `;

  writeFileSync(outputPath, html);
  console.log(`✅ HTML report exported to: ${outputPath}`);
  memai.close();
}

// Usage
exportToHTML('project-report.html');
```


### Custom Export Format: CSV for Analysis

Export data to CSV for spreadsheet analysis:

```javascript
import Memai from 'memai';
import { writeFileSync } from 'fs';

function exportToCSV(outputPath) {
  const memai = new Memai();
  
  // Get all memories
  const memories = memai.db.prepare('SELECT * FROM memories ORDER BY timestamp ASC').all();
  
  // CSV header
  let csv = 'ID,Timestamp,Date,Category,Phase,Action,Context,Outcome,Tags\n';
  
  // Add rows
  memories.forEach(memory => {
    const date = new Date(memory.timestamp).toISOString();
    const row = [
      memory.id,
      memory.timestamp,
      date,
      memory.category,
      memory.phase || '',
      `"${(memory.action || '').replace(/"/g, '""')}"`,
      `"${(memory.context || '').replace(/"/g, '""')}"`,
      `"${(memory.outcome || '').replace(/"/g, '""')}"`,
      memory.tags || ''
    ].join(',');
    
    csv += row + '\n';
  });
  
  writeFileSync(outputPath, csv);
  console.log(`✅ CSV exported to: ${outputPath}`);
  memai.close();
}

// Usage
exportToCSV('memories.csv');
```

### Dashboard Customization: Custom Metrics

Create custom analytics on top of memAI data:

```javascript
import Memai from 'memai';

class MemaiAnalytics {
  constructor() {
    this.memai = new Memai();
  }

  // Calculate velocity (memories per day)
  getVelocity(days = 7) {
    const since = Date.now() - (days * 24 * 60 * 60 * 1000);
    const memories = this.memai.db.prepare(
      'SELECT COUNT(*) as count FROM memories WHERE timestamp > ?'
    ).get(since);
    
    return (memories.count / days).toFixed(2);
  }

  // Get category distribution
  getCategoryDistribution() {
    const categories = this.memai.db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM memories 
      GROUP BY category 
      ORDER BY count DESC
    `).all();
    
    return categories;
  }

  // Calculate issue resolution rate
  getIssueResolutionRate() {
    const total = this.memai.db.prepare('SELECT COUNT(*) as count FROM issues').get().count;
    const resolved = this.memai.db.prepare(
      'SELECT COUNT(*) as count FROM issues WHERE resolved_at IS NOT NULL'
    ).get().count;
    
    return total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;
  }

  // Get most active phases
  getMostActivePhases(limit = 5) {
    const phases = this.memai.db.prepare(`
      SELECT phase, COUNT(*) as count 
      FROM memories 
      WHERE phase IS NOT NULL 
      GROUP BY phase 
      ORDER BY count DESC 
      LIMIT ?
    `).all(limit);
    
    return phases;
  }

  // Get decision impact analysis
  getDecisionImpact() {
    const decisions = this.memai.db.prepare(`
      SELECT impact, COUNT(*) as count 
      FROM decisions 
      WHERE impact IS NOT NULL 
      GROUP BY impact
    `).all();
    
    return decisions;
  }

  // Calculate average time between checkpoints
  getCheckpointCadence() {
    const checkpoints = this.memai.db.prepare(`
      SELECT timestamp FROM checkpoints ORDER BY timestamp ASC
    `).all();
    
    if (checkpoints.length < 2) return 0;
    
    let totalGap = 0;
    for (let i = 1; i < checkpoints.length; i++) {
      totalGap += checkpoints[i].timestamp - checkpoints[i - 1].timestamp;
    }
    
    const avgGapMs = totalGap / (checkpoints.length - 1);
    const avgGapHours = (avgGapMs / (1000 * 60 * 60)).toFixed(1);
    
    return avgGapHours;
  }

  // Generate comprehensive analytics report
  generateReport() {
    return {
      velocity: this.getVelocity(),
      categoryDistribution: this.getCategoryDistribution(),
      issueResolutionRate: this.getIssueResolutionRate(),
      mostActivePhases: this.getMostActivePhases(),
      decisionImpact: this.getDecisionImpact(),
      checkpointCadence: this.getCheckpointCadence()
    };
  }

  close() {
    this.memai.close();
  }
}

// Usage
const analytics = new MemaiAnalytics();
const report = analytics.generateReport();

console.log('Analytics Report:');
console.log(`  Velocity: ${report.velocity} memories/day`);
console.log(`  Issue Resolution Rate: ${report.issueResolutionRate}%`);
console.log(`  Checkpoint Cadence: Every ${report.checkpointCadence} hours`);
console.log('\nCategory Distribution:');
report.categoryDistribution.forEach(cat => {
  console.log(`  ${cat.category}: ${cat.count}`);
});

analytics.close();
```


### Real-World Use Case: Multi-Agent Collaboration

Track multiple AI agents working together:

```javascript
import Memai from 'memai';

class MultiAgentCoordinator {
  constructor(projectName) {
    this.memai = new Memai();
    this.projectName = projectName;
    this.agents = new Map();
  }

  registerAgent(agentId, agentName, role) {
    const memoryId = this.memai.record({
      category: 'checkpoint',
      phase: this.projectName,
      action: `Agent registered: ${agentName}`,
      context: `Role: ${role}`,
      tags: `agent,${agentId},registration`
    });

    this.agents.set(agentId, {
      name: agentName,
      role: role,
      memoryId: memoryId
    });

    return memoryId;
  }

  recordAgentAction(agentId, action, context, outcome) {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent ${agentId} not registered`);

    return this.memai.record({
      category: 'implementation',
      phase: this.projectName,
      action: `[${agent.name}] ${action}`,
      context: context,
      outcome: outcome,
      tags: `agent,${agentId},${agent.role}`,
      parentId: agent.memoryId
    });
  }

  recordAgentCommunication(fromAgentId, toAgentId, message) {
    const fromAgent = this.agents.get(fromAgentId);
    const toAgent = this.agents.get(toAgentId);

    return this.memai.record({
      category: 'user-interaction',
      phase: this.projectName,
      action: `Communication: ${fromAgent.name} → ${toAgent.name}`,
      context: message,
      tags: `agent,communication,${fromAgentId},${toAgentId}`
    });
  }

  getAgentActivity(agentId) {
    const memories = this.memai.db.prepare(`
      SELECT * FROM memories 
      WHERE tags LIKE ? 
      ORDER BY timestamp DESC
    `).all(`%${agentId}%`);

    return memories;
  }

  generateCollaborationReport() {
    const report = {
      project: this.projectName,
      agents: [],
      communications: 0,
      totalActions: 0
    };

    for (const [agentId, agent] of this.agents) {
      const activity = this.getAgentActivity(agentId);
      const communications = activity.filter(m => m.category === 'user-interaction');

      report.agents.push({
        id: agentId,
        name: agent.name,
        role: agent.role,
        actionsCount: activity.length,
        communicationsCount: communications.length
      });

      report.communications += communications.length;
      report.totalActions += activity.length;
    }

    return report;
  }

  close() {
    this.memai.close();
  }
}

// Usage
const coordinator = new MultiAgentCoordinator('E-commerce Platform');

// Register agents
coordinator.registerAgent('agent-1', 'Backend Developer', 'backend');
coordinator.registerAgent('agent-2', 'Frontend Developer', 'frontend');
coordinator.registerAgent('agent-3', 'DevOps Engineer', 'devops');

// Record actions
coordinator.recordAgentAction(
  'agent-1',
  'Implemented user authentication API',
  'Created REST endpoints for login, logout, and token refresh',
  'API endpoints working, tests passing'
);

coordinator.recordAgentAction(
  'agent-2',
  'Built login UI component',
  'Created React component with form validation',
  'Component integrated with backend API'
);

// Record communication
coordinator.recordAgentCommunication(
  'agent-2',
  'agent-1',
  'Need CORS headers enabled for authentication endpoints'
);

coordinator.recordAgentAction(
  'agent-1',
  'Enabled CORS for auth endpoints',
  'Added CORS middleware configuration',
  'Frontend can now call auth endpoints'
);

// Generate report
const report = coordinator.generateCollaborationReport();
console.log('Collaboration Report:', JSON.stringify(report, null, 2));

coordinator.close();
```


### Real-World Use Case: Code Review Tracking

Track code review process and feedback:

```javascript
import Memai from 'memai';

class CodeReviewTracker {
  constructor() {
    this.memai = new Memai();
  }

  startReview(prNumber, title, author) {
    return this.memai.record({
      category: 'checkpoint',
      phase: `PR-${prNumber}`,
      action: `Code review started: ${title}`,
      context: `Author: ${author}`,
      tags: `code-review,pr-${prNumber},${author}`
    });
  }

  recordComment(prNumber, reviewer, comment, severity) {
    return this.memai.record({
      category: 'user-interaction',
      phase: `PR-${prNumber}`,
      action: `Review comment by ${reviewer}`,
      context: comment,
      reasoning: `Severity: ${severity}`,
      tags: `code-review,pr-${prNumber},${reviewer},${severity}`
    });
  }

  recordChange(prNumber, author, changeDescription) {
    return this.memai.record({
      category: 'implementation',
      phase: `PR-${prNumber}`,
      action: `Code updated by ${author}`,
      context: changeDescription,
      tags: `code-review,pr-${prNumber},${author},update`
    });
  }

  approveReview(prNumber, reviewer) {
    return this.memai.record({
      category: 'decision',
      phase: `PR-${prNumber}`,
      action: `Review approved by ${reviewer}`,
      outcome: 'Changes approved',
      tags: `code-review,pr-${prNumber},${reviewer},approved`
    });
  }

  mergeReview(prNumber, merger) {
    return this.memai.createCheckpoint({
      phase: `PR-${prNumber}`,
      status: 'completed',
      progressPercent: 100,
      pendingActions: [],
      blockers: []
    });
  }

  getReviewStats(prNumber) {
    const memories = this.memai.db.prepare(`
      SELECT * FROM memories 
      WHERE phase = ? 
      ORDER BY timestamp ASC
    `).all(`PR-${prNumber}`);

    const comments = memories.filter(m => m.category === 'user-interaction');
    const changes = memories.filter(m => m.category === 'implementation');
    const approvals = memories.filter(m => m.tags?.includes('approved'));

    const startTime = memories[0]?.timestamp;
    const endTime = memories[memories.length - 1]?.timestamp;
    const durationHours = startTime && endTime 
      ? ((endTime - startTime) / (1000 * 60 * 60)).toFixed(1)
      : 0;

    return {
      totalComments: comments.length,
      totalChanges: changes.length,
      totalApprovals: approvals.length,
      durationHours: durationHours,
      reviewers: [...new Set(comments.map(c => c.action.match(/by (.+)/)?.[1]))].filter(Boolean)
    };
  }

  close() {
    this.memai.close();
  }
}

// Usage
const tracker = new CodeReviewTracker();

// Start review
tracker.startReview(123, 'Add user authentication', 'alice');

// Record comments
tracker.recordComment(
  123,
  'bob',
  'Consider using bcrypt for password hashing instead of SHA256',
  'high'
);

tracker.recordComment(
  123,
  'charlie',
  'Add input validation for email format',
  'medium'
);

// Record changes
tracker.recordChange(
  123,
  'alice',
  'Switched to bcrypt for password hashing, added email validation'
);

// Approve
tracker.approveReview(123, 'bob');
tracker.approveReview(123, 'charlie');

// Merge
tracker.mergeReview(123, 'alice');

// Get stats
const stats = tracker.getReviewStats(123);
console.log('Review Stats:', stats);

tracker.close();
```

---

## Best Practices

### 1. Use Consistent Tagging

```javascript
// Good: Consistent, searchable tags
memai.record({
  category: 'implementation',
  action: 'Added user profile page',
  tags: 'feature,user-profile,frontend,react'
});

// Avoid: Inconsistent or vague tags
memai.record({
  category: 'implementation',
  action: 'Added user profile page',
  tags: 'stuff,things,code'
});
```

### 2. Provide Context and Reasoning

```javascript
// Good: Clear context and reasoning
memai.record({
  category: 'decision',
  action: 'Chose Redis for session storage',
  context: 'Need fast, distributed session management for 10k+ concurrent users',
  reasoning: 'Redis provides sub-millisecond latency, built-in expiration, and horizontal scaling',
  outcome: 'Session performance improved by 80%'
});

// Avoid: Minimal information
memai.record({
  category: 'decision',
  action: 'Using Redis'
});
```

### 3. Link Related Memories

```javascript
// Record parent memory
const parentId = memai.record({
  category: 'checkpoint',
  action: 'Starting authentication feature'
});

// Link child memories
memai.record({
  category: 'implementation',
  action: 'Implemented login endpoint',
  parentId: parentId
});

memai.record({
  category: 'implementation',
  action: 'Implemented logout endpoint',
  parentId: parentId
});
```

### 4. Regular Checkpoints

```javascript
// Create checkpoints at regular intervals
setInterval(() => {
  memai.createCheckpoint({
    phase: 'Current Sprint',
    status: 'in-progress',
    progressPercent: calculateProgress(),
    pendingActions: getPendingTasks(),
    blockers: getCurrentBlockers()
  });
}, 60 * 60 * 1000); // Every hour
```

### 5. Close Connections

```javascript
// Always close when done
const memai = new Memai();
try {
  // Your code here
} finally {
  memai.close();
}

// Or use in async context
async function doWork() {
  const memai = new Memai();
  try {
    await someAsyncWork();
  } finally {
    memai.close();
  }
}
```

---

## Troubleshooting

### Database Locked Error

If you get "database is locked" errors:

```javascript
// Ensure only one instance per database
const memai = new Memai();

// Close properly when done
memai.close();

// For long-running processes, reuse the same instance
class MyApp {
  constructor() {
    this.memai = new Memai();
  }

  cleanup() {
    this.memai.close();
  }
}
```

### Memory Growth

For long-running processes:

```javascript
// Periodically export and archive old data
function archiveOldMemories() {
  const memai = new Memai();
  
  // Export to JSON
  memai.exportToJson(`archive-${Date.now()}.json`);
  
  // Optionally delete old memories
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  memai.db.prepare('DELETE FROM memories WHERE timestamp < ?').run(thirtyDaysAgo);
  
  memai.close();
}
```

---

## Additional Resources

- [API Reference](./API.md) - Complete API documentation
- [CLI Reference](./CLI.md) - Command-line interface guide
- [GitHub Repository](https://github.com/kraftyux/memai) - Source code and issues
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute

---

**Need help?** Open an issue on [GitHub](https://github.com/kraftyux/memai/issues) or check the [documentation](./README.md).
