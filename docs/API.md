# memAI API Reference

Complete reference for the Memai class API. This document covers all public methods, their parameters, return values, and usage patterns.

## Table of Contents

- [Installation](#installation)
- [Initialization](#initialization)
- [Recording Methods](#recording-methods)
- [Querying Methods](#querying-methods)
- [Management Methods](#management-methods)
- [Export Methods](#export-methods)
- [Utility Methods](#utility-methods)

## Installation

```bash
npm install memai
```

## Initialization

### `new Memai(dbPath)`

Creates a new memAI instance and initializes the database.

**Parameters:**

- `dbPath` (string, optional): Path to the SQLite database file
  - Default: `{cwd}/.memai/memory.db`
  - The directory will be created if it doesn't exist

**Returns:** Memai instance

**Example:**

```javascript
import Memai from 'memai';

// Use default path
const memai = new Memai();

// Use custom path
const memai = new Memai('./my-project/.memai/memory.db');
```

**Notes:**

- Automatically creates database schema if not exists
- Enables WAL (Write-Ahead Logging) mode for better performance
- Creates a logs directory for JSON audit trails

## Recording Methods

### `record(options)`

Records a memory entry with context, reasoning, and outcome.

**Parameters:**

- `options` (object):
  - `category` (string, required): Memory category (e.g., 'development', 'testing', 'debugging')
  - `phase` (string, optional): Current project phase
  - `action` (string, required): Action performed or event that occurred
  - `context` (string, optional): Additional context about the action
  - `reasoning` (string, optional): Why this action was taken
  - `outcome` (string, optional): Result of the action
  - `tags` (string, optional): Comma-separated tags for categorization
  - `parentId` (number, optional): ID of parent memory for hierarchical relationships

**Returns:** number - ID of the created memory entry

**Example:**

```javascript
const memoryId = memai.record({
  category: 'development',
  phase: 'implementation',
  action: 'Implemented user authentication',
  context: 'Added JWT-based authentication system',
  reasoning: 'Required for secure API access',
  outcome: 'Successfully implemented with tests passing',
  tags: 'auth,security,api'
});

console.log('Memory ID:', memoryId);
```

### `recordDecision(options)`

Records a decision with rationale and alternatives considered.

**Parameters:**

- `options` (object):
  - `decision` (string, required): The decision made
  - `rationale` (string, required): Why this decision was made
  - `alternatives` (string, optional): Other options that were considered
  - `impact` (string, optional): Expected impact of the decision
  - `reversible` (boolean, optional): Whether the decision can be reversed (default: true)
  - `memoryId` (number, optional): Associated memory entry ID

**Returns:** number - ID of the created decision entry

**Example:**

```javascript
const decisionId = memai.recordDecision({
  decision: 'Use PostgreSQL instead of MongoDB',
  rationale: 'Need ACID compliance and complex queries',
  alternatives: 'MongoDB, MySQL, SQLite',
  impact: 'Better data integrity, more complex setup',
  reversible: false,
  memoryId: 123
});
```

### `recordFileChange(options)`

Records a file change with diff information.

**Parameters:**

- `options` (object):
  - `filePath` (string, required): Path to the changed file
  - `changeType` (string, required): Type of change ('created', 'modified', 'deleted')
  - `reason` (string, optional): Why the file was changed
  - `diffSummary` (string, optional): Summary of changes
  - `linesAdded` (number, optional): Number of lines added (default: 0)
  - `linesRemoved` (number, optional): Number of lines removed (default: 0)
  - `memoryId` (number, optional): Associated memory entry ID

**Returns:** number - ID of the created file change entry

**Example:**

```javascript
const changeId = memai.recordFileChange({
  filePath: 'src/auth/login.js',
  changeType: 'modified',
  reason: 'Added password validation',
  diffSummary: 'Added bcrypt comparison and error handling',
  linesAdded: 15,
  linesRemoved: 3,
  memoryId: 123
});
```

### `addKnowledge(options)`

Adds an entry to the knowledge base.

**Parameters:**

- `options` (object):
  - `topic` (string, required): Knowledge topic or title
  - `content` (string, required): Knowledge content
  - `confidence` (number, optional): Confidence level (0.0 to 1.0, default: 0.5)
  - `source` (string, optional): Source of the knowledge
  - `tags` (string, optional): Comma-separated tags

**Returns:** number - ID of the created knowledge entry

**Example:**

```javascript
const knowledgeId = memai.addKnowledge({
  topic: 'JWT Token Expiration',
  content: 'Access tokens expire after 15 minutes, refresh tokens after 7 days',
  confidence: 0.9,
  source: 'Security documentation',
  tags: 'auth,security,jwt'
});
```

### `createCheckpoint(options)`

Creates a checkpoint to track project progress.

**Parameters:**

- `options` (object):
  - `phase` (string, required): Current phase name
  - `status` (string, required): Current status (e.g., 'in-progress', 'completed', 'blocked')
  - `progressPercent` (number, optional): Progress percentage (0-100, default: 0)
  - `pendingActions` (array, optional): List of pending actions (default: [])
  - `blockers` (array, optional): List of current blockers (default: [])
  - `memoryId` (number, optional): Associated memory entry ID

**Returns:** number - ID of the created checkpoint

**Example:**

```javascript
const checkpointId = memai.createCheckpoint({
  phase: 'authentication',
  status: 'in-progress',
  progressPercent: 75,
  pendingActions: ['Add password reset', 'Implement 2FA'],
  blockers: ['Waiting for email service API keys'],
  memoryId: 123
});
```

### `recordIssue(options)`

Records an issue or problem encountered.

**Parameters:**

- `options` (object):
  - `severity` (string, required): Issue severity ('P0', 'P1', 'P2', 'P3')
  - `category` (string, required): Issue category (e.g., 'bug', 'performance', 'security')
  - `description` (string, required): Issue description
  - `memoryId` (number, optional): Associated memory entry ID

**Returns:** number - ID of the created issue

**Example:**

```javascript
const issueId = memai.recordIssue({
  severity: 'P1',
  category: 'security',
  description: 'JWT tokens not properly validated on refresh',
  memoryId: 123
});
```

### `resolveIssue(issueId, resolution)`

Marks an issue as resolved.

**Parameters:**

- `issueId` (number, required): ID of the issue to resolve
- `resolution` (string, required): Description of how the issue was resolved

**Returns:** object - SQLite run result

**Example:**

```javascript
memai.resolveIssue(42, 'Added proper JWT signature verification');
```

### `recordTestResults(options)`

Records test execution results.

**Parameters:**

- `options` (object):
  - `testSuite` (string, required): Name of the test suite
  - `total` (number, optional): Total number of tests (default: 0)
  - `passed` (number, optional): Number of passed tests (default: 0)
  - `failed` (number, optional): Number of failed tests (default: 0)
  - `skipped` (number, optional): Number of skipped tests (default: 0)
  - `durationMs` (number, optional): Test duration in milliseconds (default: 0)
  - `failureDetails` (array, optional): Details of failed tests (default: [])
  - `memoryId` (number, optional): Associated memory entry ID

**Returns:** number - ID of the created test result entry

**Example:**

```javascript
const testId = memai.recordTestResults({
  testSuite: 'auth-tests',
  total: 25,
  passed: 23,
  failed: 2,
  skipped: 0,
  durationMs: 1250,
  failureDetails: [
    { test: 'should reject invalid tokens', error: 'Expected 401, got 500' }
  ],
  memoryId: 123
});
```

## Querying Methods

### `getRecentMemories(limit)`

Retrieves the most recent memory entries.

**Parameters:**

- `limit` (number, optional): Maximum number of memories to retrieve (default: 20)

**Returns:** array - Array of memory objects, ordered by timestamp (newest first)

**Example:**

```javascript
const recent = memai.getRecentMemories(10);
recent.forEach(memory => {
  console.log(`${memory.action} - ${new Date(memory.timestamp).toLocaleString()}`);
});
```

### `getPhaseContext(phase)`

Retrieves all memories for a specific phase.

**Parameters:**

- `phase` (string, required): Phase name to query

**Returns:** array - Array of memory objects for the phase, ordered by timestamp (oldest first)

**Example:**

```javascript
const authMemories = memai.getPhaseContext('authentication');
console.log(`Found ${authMemories.length} memories for authentication phase`);
```

### `getRecentDecisions(limit)`

Retrieves recent decisions with associated memory context.

**Parameters:**

- `limit` (number, optional): Maximum number of decisions to retrieve (default: 10)

**Returns:** array - Array of decision objects with joined memory data

**Example:**

```javascript
const decisions = memai.getRecentDecisions(5);
decisions.forEach(decision => {
  console.log(`Decision: ${decision.decision}`);
  console.log(`Rationale: ${decision.rationale}`);
});
```

### `findIssues(keyword)`

Searches for issues by keyword in description or resolution.

**Parameters:**

- `keyword` (string, required): Search keyword

**Returns:** array - Array of matching issues, ordered by severity and timestamp

**Example:**

```javascript
const authIssues = memai.findIssues('authentication');
console.log(`Found ${authIssues.length} issues related to authentication`);
```

### `getActiveIssues()`

Retrieves all unresolved issues.

**Parameters:** None

**Returns:** array - Array of active issue objects with age information

**Example:**

```javascript
const active = memai.getActiveIssues();
const critical = active.filter(issue => issue.severity === 'P0');
console.log(`${critical.length} critical issues need attention`);
```

### `getPhaseProgress()`

Retrieves progress information for all phases.

**Parameters:** None

**Returns:** array - Array of phase progress objects with status and metrics

**Example:**

```javascript
const progress = memai.getPhaseProgress();
progress.forEach(phase => {
  console.log(`${phase.phase}: ${phase.progress_percent}% (${phase.status})`);
});
```

### `getTopKnowledge(limit)`

Retrieves top knowledge entries by confidence and validation count.

**Parameters:**

- `limit` (number, optional): Maximum number of entries to retrieve (default: 20)

**Returns:** array - Array of knowledge objects, ordered by confidence and validation count

**Example:**

```javascript
const knowledge = memai.getTopKnowledge(10);
knowledge.forEach(k => {
  console.log(`${k.topic} (confidence: ${k.confidence})`);
});
```

### `searchByTag(tag)`

Searches memories by tag.

**Parameters:**

- `tag` (string, required): Tag to search for

**Returns:** array - Array of memory objects with matching tag, ordered by timestamp (newest first)

**Example:**

```javascript
const securityMemories = memai.searchByTag('security');
console.log(`Found ${securityMemories.length} security-related memories`);
```

### `generateBriefing(options)`

Generates a comprehensive briefing for resuming work.

**Parameters:**

- `options` (object):
  - `since` (string|number, optional): Start time (ISO string or timestamp, default: 24 hours ago)
  - `categories` (array, optional): Filter by specific categories
  - `maxDepth` (number, optional): Maximum number of items per category (default: 3)

**Returns:** object - Briefing object containing:

- `memories` (array): Filtered memory entries
- `activeIssues` (array): Current unresolved issues
- `latestCheckpoint` (object): Most recent checkpoint
- `summary` (object): Aggregated statistics and status

**Example:**

```javascript
// Get briefing for last 48 hours
const briefing = memai.generateBriefing({
  since: Date.now() - (48 * 60 * 60 * 1000),
  categories: ['development', 'testing'],
  maxDepth: 5
});

console.log('Summary:', briefing.summary);
console.log('Active Issues:', briefing.activeIssues.length);
console.log('Current Phase:', briefing.latestCheckpoint?.phase);
```

### `getStats()`

Retrieves overall statistics.

**Parameters:** None

**Returns:** object - Statistics object containing:

- `totalMemories` (number): Total memory entries
- `totalDecisions` (number): Total decisions recorded
- `totalIssues` (number): Total issues recorded
- `resolvedIssues` (number): Number of resolved issues
- `activeIssues` (number): Number of unresolved issues
- `avgResolveTimeMs` (number): Average resolution time in milliseconds
- `avgResolveTimeHours` (string): Average resolution time in hours

**Example:**

```javascript
const stats = memai.getStats();
console.log(`Total memories: ${stats.totalMemories}`);
console.log(`Active issues: ${stats.activeIssues}`);
console.log(`Avg resolve time: ${stats.avgResolveTimeHours} hours`);
```

## Management Methods

### `init()`

Initializes the database and creates tables. This is called automatically by the constructor.

**Parameters:** None

**Returns:** void

**Notes:**

- Creates database directory if it doesn't exist
- Creates logs directory for audit trails
- Executes schema.sql to create tables
- Enables WAL mode for better performance

## Export Methods

### `exportToJson(outputPath)`

Exports all data to a JSON file.

**Parameters:**

- `outputPath` (string, required): Path where the JSON file will be saved

**Returns:** void

**Example:**

```javascript
memai.exportToJson('./exports/memory-backup.json');
```

**Output Format:**

```json
{
  "version": "1.0.0",
  "exportedAt": 1234567890,
  "memories": [...],
  "decisions": [...],
  "fileChanges": [...],
  "knowledge": [...],
  "checkpoints": [...],
  "issues": [...],
  "testResults": [...]
}
```

### `exportToMarkdown(outputPath)`

Exports data as a formatted Markdown report.

**Parameters:**

- `outputPath` (string, required): Path where the Markdown file will be saved

**Returns:** void

**Example:**

```javascript
memai.exportToMarkdown('./reports/project-status.md');
```

**Report Includes:**

- Summary statistics
- Phase progress table
- Test health metrics
- Active issues
- Recent activity timeline

## Utility Methods

### `close()`

Closes the database connection.

**Parameters:** None

**Returns:** void

**Example:**

```javascript
// When done with memAI
memai.close();
```

**Notes:**

- Should be called when the application exits
- Ensures all data is properly written to disk
- Releases database file locks

---

## Type Definitions

### Memory Object

```typescript
{
  id: number;
  timestamp: number;
  category: string;
  phase: string | null;
  action: string;
  context: string | null;
  reasoning: string | null;
  outcome: string | null;
  tags: string | null;
  parent_id: number | null;
}
```

### Decision Object

```typescript
{
  id: number;
  timestamp: number;
  decision: string;
  rationale: string;
  alternatives: string | null;
  impact: string | null;
  reversible: number; // 0 or 1
  memory_id: number | null;
}
```

### Issue Object

```typescript
{
  id: number;
  timestamp: number;
  severity: 'P0' | 'P1' | 'P2' | 'P3';
  category: string;
  description: string;
  resolution: string | null;
  resolved_at: number | null;
  time_to_resolve: number | null;
  memory_id: number | null;
}
```

### Checkpoint Object

```typescript
{
  id: number;
  timestamp: number;
  phase: string;
  status: string;
  progress_percent: number;
  pending_actions: string; // JSON array
  blockers: string; // JSON array
  memory_id: number | null;
}
```

---

## Best Practices

### Memory Recording

- Use consistent category names across your project
- Include meaningful context and reasoning for better AI resume
- Use tags for cross-cutting concerns (e.g., 'security', 'performance')
- Link related memories using parentId for hierarchical relationships

### Decision Tracking

- Record all significant technical decisions
- Document alternatives considered, even if rejected
- Mark irreversible decisions appropriately
- Link decisions to related memories for full context

### Issue Management

- Use severity levels consistently (P0 = critical, P3 = minor)
- Provide detailed descriptions for better searchability
- Resolve issues promptly with clear resolution notes
- Track time-to-resolve for process improvement

### Checkpoints

- Create checkpoints at phase boundaries
- Update progress regularly for accurate tracking
- Document blockers immediately when encountered
- Keep pending actions list current

### Querying

- Use specific queries over broad ones for better performance
- Leverage tags for flexible categorization
- Generate briefings before resuming work
- Review phase context when switching tasks

### Export

- Export regularly for backup purposes
- Use JSON exports for data migration
- Use Markdown exports for human-readable reports
- Store exports in version control for history

---

## Error Handling

All methods may throw errors in the following cases:

- Database connection failures
- Invalid SQL operations
- File system errors (for exports)
- Invalid parameters

**Example Error Handling:**

```javascript
try {
  const memoryId = memai.record({
    category: 'development',
    action: 'Implemented feature X'
  });
  console.log('Recorded:', memoryId);
} catch (error) {
  console.error('Failed to record memory:', error.message);
}
```

---

## Performance Considerations

- WAL mode is enabled for better concurrent access
- Indexes are created on frequently queried columns
- Use limits on query methods to avoid loading large datasets
- Close connections when done to release resources
- JSON logs are written asynchronously for better performance

---

## See Also

- [CLI Reference](./CLI.md) - Command-line interface documentation
- [Examples](./EXAMPLES.md) - Practical usage examples
- [GitHub Repository](https://github.com/kraftyux/memai) - Source code and issues

## Usage Examples

### Basic Usage

#### Recording Development Activity

```javascript
import Memai from 'memai';

const memai = new Memai();

// Record a development action
const memoryId = memai.record({
  category: 'development',
  phase: 'feature-implementation',
  action: 'Implemented user profile page',
  context: 'Created React component with form validation',
  reasoning: 'User story US-123 requires profile editing',
  outcome: 'Component complete with 95% test coverage',
  tags: 'frontend,react,user-profile'
});

// Record the decision behind the implementation
memai.recordDecision({
  decision: 'Use Formik for form handling',
  rationale: 'Reduces boilerplate and provides built-in validation',
  alternatives: 'React Hook Form, custom implementation',
  impact: 'Faster development, easier maintenance',
  reversible: true,
  memoryId: memoryId
});

// Track file changes
memai.recordFileChange({
  filePath: 'src/components/UserProfile.jsx',
  changeType: 'created',
  reason: 'New user profile component',
  linesAdded: 150,
  memoryId: memoryId
});
```

#### Tracking Issues and Resolution

```javascript
// Record an issue when discovered
const issueId = memai.recordIssue({
  severity: 'P1',
  category: 'bug',
  description: 'Form validation fails for international phone numbers',
  memoryId: memoryId
});

// Later, when resolved
memai.resolveIssue(
  issueId,
  'Updated regex pattern to support international formats (+XX-XXX-XXX-XXXX)'
);

// Check active issues
const activeIssues = memai.getActiveIssues();
console.log(`${activeIssues.length} issues need attention`);
```

#### Creating Checkpoints

```javascript
// Create checkpoint at end of sprint
memai.createCheckpoint({
  phase: 'sprint-3',
  status: 'completed',
  progressPercent: 100,
  pendingActions: ['Deploy to staging', 'Update documentation'],
  blockers: [],
  memoryId: memoryId
});

// Check progress across all phases
const progress = memai.getPhaseProgress();
progress.forEach(p => {
  console.log(`${p.phase}: ${p.progress_percent}% - ${p.status}`);
});
```

### Error Handling Examples

#### Handling Database Errors

```javascript
import Memai from 'memai';

try {
  const memai = new Memai('/invalid/path/memory.db');
} catch (error) {
  console.error('Failed to initialize memAI:', error.message);
  // Fallback to default location
  const memai = new Memai();
}
```

#### Handling Recording Errors

```javascript
function recordWithRetry(memai, data, maxRetries = 3) {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      const id = memai.record(data);
      console.log('Successfully recorded:', id);
      return id;
    } catch (error) {
      attempts++;
      console.error(`Attempt ${attempts} failed:`, error.message);
      
      if (attempts >= maxRetries) {
        console.error('Max retries reached, giving up');
        throw error;
      }
      
      // Wait before retry
      setTimeout(() => {}, 1000 * attempts);
    }
  }
}

// Usage
try {
  recordWithRetry(memai, {
    category: 'development',
    action: 'Critical operation'
  });
} catch (error) {
  // Handle final failure
  console.error('Failed to record after retries');
}
```

#### Handling Query Errors

```javascript
function safeQuery(queryFn, fallback = []) {
  try {
    return queryFn();
  } catch (error) {
    console.error('Query failed:', error.message);
    return fallback;
  }
}

// Usage
const memories = safeQuery(
  () => memai.getRecentMemories(50),
  []
);

const issues = safeQuery(
  () => memai.findIssues('authentication'),
  []
);
```

#### Handling Export Errors

```javascript
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

function safeExport(memai, outputPath, format = 'json') {
  try {
    // Ensure directory exists
    const dir = dirname(outputPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    
    // Export based on format
    if (format === 'json') {
      memai.exportToJson(outputPath);
    } else if (format === 'markdown') {
      memai.exportToMarkdown(outputPath);
    }
    
    console.log(`Successfully exported to ${outputPath}`);
    return true;
  } catch (error) {
    console.error('Export failed:', error.message);
    return false;
  }
}

// Usage
safeExport(memai, './exports/backup.json', 'json');
safeExport(memai, './reports/status.md', 'markdown');
```

### Integration Patterns

#### Express.js Integration

```javascript
import express from 'express';
import Memai from 'memai';

const app = express();
const memai = new Memai('./api-memory.db');

// Middleware to record all API requests
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Capture response
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    // Record API call
    memai.record({
      category: 'api-request',
      action: `${req.method} ${req.path}`,
      context: JSON.stringify({
        query: req.query,
        body: req.body,
        statusCode: res.statusCode,
        duration: duration
      }),
      outcome: res.statusCode < 400 ? 'success' : 'error',
      tags: `api,${req.method.toLowerCase()},${res.statusCode}`
    });
    
    originalSend.call(this, data);
  };
  
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Record error
  const issueId = memai.recordIssue({
    severity: 'P1',
    category: 'api-error',
    description: `${req.method} ${req.path}: ${err.message}`
  });
  
  res.status(500).json({ error: 'Internal server error', issueId });
});

// Endpoint to get API statistics
app.get('/api/stats', (req, res) => {
  const stats = memai.getStats();
  const recentErrors = memai.findIssues('api-error');
  
  res.json({
    ...stats,
    recentErrors: recentErrors.slice(0, 10)
  });
});

// Endpoint to generate briefing
app.get('/api/briefing', (req, res) => {
  const hours = parseInt(req.query.hours) || 24;
  const since = Date.now() - (hours * 60 * 60 * 1000);
  
  const briefing = memai.generateBriefing({
    since,
    categories: ['api-request', 'api-error']
  });
  
  res.json(briefing);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  memai.close();
  process.exit(0);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

#### GitHub Actions Integration

```javascript
// .github/workflows/ci.yml companion script
// File: scripts/record-ci-run.js

import Memai from 'memai';
import { readFileSync } from 'fs';

const memai = new Memai('./.memai/ci-memory.db');

// Get CI environment variables
const {
  GITHUB_WORKFLOW,
  GITHUB_RUN_ID,
  GITHUB_SHA,
  GITHUB_REF,
  GITHUB_ACTOR
} = process.env;

// Record CI run start
const memoryId = memai.record({
  category: 'ci-cd',
  phase: GITHUB_WORKFLOW,
  action: `CI Run #${GITHUB_RUN_ID}`,
  context: JSON.stringify({
    commit: GITHUB_SHA,
    branch: GITHUB_REF,
    actor: GITHUB_ACTOR
  }),
  tags: 'ci,github-actions'
});

// Record test results (assuming test output is in JSON)
try {
  const testResults = JSON.parse(readFileSync('./test-results.json', 'utf-8'));
  
  memai.recordTestResults({
    testSuite: 'unit-tests',
    total: testResults.numTotalTests,
    passed: testResults.numPassedTests,
    failed: testResults.numFailedTests,
    skipped: testResults.numPendingTests,
    durationMs: testResults.testDuration,
    failureDetails: testResults.testResults
      .filter(t => t.status === 'failed')
      .map(t => ({ test: t.name, error: t.message })),
    memoryId
  });
  
  // Record issues for failures
  if (testResults.numFailedTests > 0) {
    memai.recordIssue({
      severity: 'P1',
      category: 'test-failure',
      description: `${testResults.numFailedTests} tests failed in CI run #${GITHUB_RUN_ID}`,
      memoryId
    });
  }
} catch (error) {
  console.error('Failed to record test results:', error.message);
}

// Create checkpoint
memai.createCheckpoint({
  phase: GITHUB_WORKFLOW,
  status: process.exitCode === 0 ? 'completed' : 'failed',
  progressPercent: process.exitCode === 0 ? 100 : 0,
  pendingActions: [],
  blockers: process.exitCode === 0 ? [] : ['CI tests failing'],
  memoryId
});

memai.close();
```

#### Testing Framework Integration

```javascript
// Jest integration example
// File: jest.setup.js

import Memai from 'memai';

const memai = new Memai('./.memai/test-memory.db');
let suiteStartTime;
let currentMemoryId;

// Before all tests
beforeAll(() => {
  suiteStartTime = Date.now();
  currentMemoryId = memai.record({
    category: 'testing',
    phase: 'test-execution',
    action: 'Test suite started',
    tags: 'jest,testing'
  });
});

// After all tests
afterAll(() => {
  const duration = Date.now() - suiteStartTime;
  
  // Get test results from Jest
  const results = global.__JEST_RESULTS__;
  
  if (results) {
    memai.recordTestResults({
      testSuite: 'jest-suite',
      total: results.numTotalTests,
      passed: results.numPassedTests,
      failed: results.numFailedTests,
      skipped: results.numPendingTests,
      durationMs: duration,
      memoryId: currentMemoryId
    });
  }
  
  memai.close();
});

// Record individual test failures
afterEach(() => {
  const testState = expect.getState();
  
  if (testState.currentTestName && testState.testPath) {
    const testFailed = testState.numPassingAsserts === 0;
    
    if (testFailed) {
      memai.recordIssue({
        severity: 'P2',
        category: 'test-failure',
        description: `Test failed: ${testState.currentTestName}`,
        memoryId: currentMemoryId
      });
    }
  }
});
```

#### CLI Tool Integration

```javascript
// Example: Custom CLI tool with memAI
// File: my-cli.js

import { Command } from 'commander';
import Memai from 'memai';

const program = new Command();
const memai = new Memai('./.memai/cli-memory.db');

program
  .name('my-tool')
  .description('CLI tool with memAI integration')
  .version('1.0.0');

program
  .command('deploy')
  .description('Deploy application')
  .option('-e, --env <environment>', 'deployment environment', 'staging')
  .action(async (options) => {
    const memoryId = memai.record({
      category: 'deployment',
      phase: 'deploy',
      action: `Deploy to ${options.env}`,
      tags: `deploy,${options.env}`
    });
    
    try {
      // Deployment logic here
      console.log(`Deploying to ${options.env}...`);
      
      // Record success
      memai.record({
        category: 'deployment',
        action: 'Deployment completed',
        outcome: 'success',
        parentId: memoryId
      });
      
      memai.createCheckpoint({
        phase: 'deployment',
        status: 'completed',
        progressPercent: 100,
        pendingActions: [],
        blockers: []
      });
    } catch (error) {
      // Record failure
      memai.recordIssue({
        severity: 'P0',
        category: 'deployment-failure',
        description: `Deployment to ${options.env} failed: ${error.message}`,
        memoryId
      });
      
      console.error('Deployment failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Show deployment status')
  .action(() => {
    const briefing = memai.generateBriefing({
      categories: ['deployment'],
      maxDepth: 10
    });
    
    console.log('\nDeployment Status:');
    console.log('==================');
    console.log(`Total deployments: ${briefing.memories.length}`);
    console.log(`Active issues: ${briefing.activeIssues.length}`);
    
    if (briefing.latestCheckpoint) {
      console.log(`\nLatest: ${briefing.latestCheckpoint.phase}`);
      console.log(`Status: ${briefing.latestCheckpoint.status}`);
      console.log(`Progress: ${briefing.latestCheckpoint.progress_percent}%`);
    }
  });

program.parse();

// Cleanup on exit
process.on('exit', () => {
  memai.close();
});
```

#### Build Tool Integration (Webpack Plugin)

```javascript
// Example: Webpack plugin with memAI
// File: webpack-memai-plugin.js

import Memai from 'memai';

class MemaiWebpackPlugin {
  constructor(options = {}) {
    this.memai = new Memai(options.dbPath || './.memai/build-memory.db');
    this.buildStartTime = null;
    this.currentMemoryId = null;
  }
  
  apply(compiler) {
    // Record build start
    compiler.hooks.compile.tap('MemaiWebpackPlugin', () => {
      this.buildStartTime = Date.now();
      this.currentMemoryId = this.memai.record({
        category: 'build',
        phase: 'compilation',
        action: 'Build started',
        tags: 'webpack,build'
      });
    });
    
    // Record build completion
    compiler.hooks.done.tap('MemaiWebpackPlugin', (stats) => {
      const duration = Date.now() - this.buildStartTime;
      const hasErrors = stats.hasErrors();
      const hasWarnings = stats.hasWarnings();
      
      // Record build result
      this.memai.record({
        category: 'build',
        action: 'Build completed',
        outcome: hasErrors ? 'failed' : 'success',
        context: JSON.stringify({
          duration,
          errors: stats.compilation.errors.length,
          warnings: stats.compilation.warnings.length,
          assets: Object.keys(stats.compilation.assets).length
        }),
        parentId: this.currentMemoryId
      });
      
      // Record errors as issues
      if (hasErrors) {
        stats.compilation.errors.forEach(error => {
          this.memai.recordIssue({
            severity: 'P1',
            category: 'build-error',
            description: error.message,
            memoryId: this.currentMemoryId
          });
        });
      }
      
      // Create checkpoint
      this.memai.createCheckpoint({
        phase: 'build',
        status: hasErrors ? 'failed' : 'completed',
        progressPercent: hasErrors ? 0 : 100,
        pendingActions: hasErrors ? ['Fix build errors'] : [],
        blockers: hasErrors ? ['Build errors present'] : []
      });
    });
    
    // Cleanup on shutdown
    compiler.hooks.shutdown.tap('MemaiWebpackPlugin', () => {
      this.memai.close();
    });
  }
}

export default MemaiWebpackPlugin;

// Usage in webpack.config.js:
// import MemaiWebpackPlugin from './webpack-memai-plugin.js';
//
// export default {
//   plugins: [
//     new MemaiWebpackPlugin({ dbPath: './.memai/build.db' })
//   ]
// };
```

### Advanced Patterns

#### Hierarchical Memory Tracking

```javascript
// Track related memories in a hierarchy
const projectId = memai.record({
  category: 'project',
  action: 'Started new feature: User Dashboard',
  tags: 'feature,dashboard'
});

const designId = memai.record({
  category: 'design',
  action: 'Created dashboard wireframes',
  parentId: projectId,
  tags: 'design,dashboard'
});

const implementationId = memai.record({
  category: 'development',
  action: 'Implemented dashboard components',
  parentId: designId,
  tags: 'development,dashboard'
});

const testingId = memai.record({
  category: 'testing',
  action: 'Wrote dashboard tests',
  parentId: implementationId,
  tags: 'testing,dashboard'
});

// Query the entire hierarchy
const dashboardMemories = memai.searchByTag('dashboard');
console.log(`Dashboard feature has ${dashboardMemories.length} related memories`);
```

#### Knowledge Base Building

```javascript
// Build a knowledge base over time
function learnFromExperience(memai, topic, content, source) {
  // Check if knowledge already exists
  const existing = memai.getTopKnowledge(100)
    .find(k => k.topic.toLowerCase() === topic.toLowerCase());
  
  if (existing) {
    // Update confidence if we're seeing this again
    console.log(`Knowledge about "${topic}" already exists`);
    return existing.id;
  }
  
  // Add new knowledge
  return memai.addKnowledge({
    topic,
    content,
    confidence: 0.7,
    source,
    tags: 'learned,experience'
  });
}

// Usage during development
learnFromExperience(
  memai,
  'React useEffect cleanup',
  'Always return cleanup function to prevent memory leaks',
  'Bug fix in UserProfile component'
);

learnFromExperience(
  memai,
  'PostgreSQL connection pooling',
  'Set max pool size to 20 for optimal performance',
  'Performance optimization session'
);

// Later, retrieve knowledge
const knowledge = memai.getTopKnowledge(10);
console.log('\nTop Knowledge:');
knowledge.forEach(k => {
  console.log(`- ${k.topic} (confidence: ${k.confidence})`);
  console.log(`  ${k.content}`);
});
```

#### Automated Issue Tracking

```javascript
// Automatically track and categorize issues
class IssueTracker {
  constructor(memai) {
    this.memai = memai;
  }
  
  trackError(error, context = {}) {
    // Determine severity based on error type
    let severity = 'P2';
    if (error.name === 'SecurityError') severity = 'P0';
    else if (error.name === 'TypeError') severity = 'P1';
    
    // Record the issue
    const issueId = this.memai.recordIssue({
      severity,
      category: this.categorizeError(error),
      description: `${error.name}: ${error.message}\n${error.stack}`
    });
    
    return issueId;
  }
  
  categorizeError(error) {
    if (error.name.includes('Security')) return 'security';
    if (error.name.includes('Type')) return 'type-error';
    if (error.name.includes('Reference')) return 'reference-error';
    if (error.message.includes('network')) return 'network';
    return 'general';
  }
  
  getIssueReport() {
    const active = this.memai.getActiveIssues();
    
    const report = {
      total: active.length,
      bySeverity: {},
      byCategory: {},
      oldest: null
    };
    
    active.forEach(issue => {
      report.bySeverity[issue.severity] = 
        (report.bySeverity[issue.severity] || 0) + 1;
      report.byCategory[issue.category] = 
        (report.byCategory[issue.category] || 0) + 1;
      
      if (!report.oldest || issue.age_ms > report.oldest.age_ms) {
        report.oldest = issue;
      }
    });
    
    return report;
  }
}

// Usage
const tracker = new IssueTracker(memai);

try {
  // Some code that might fail
  throw new TypeError('Cannot read property of undefined');
} catch (error) {
  const issueId = tracker.trackError(error);
  console.log('Issue tracked:', issueId);
}

// Get issue report
const report = tracker.getIssueReport();
console.log('Issue Report:', report);
```

#### Session Management

```javascript
// Track development sessions
class SessionManager {
  constructor(memai) {
    this.memai = memai;
    this.sessionId = null;
    this.sessionStart = null;
  }
  
  startSession(phase, goals = []) {
    this.sessionStart = Date.now();
    this.sessionId = this.memai.record({
      category: 'session',
      phase,
      action: 'Development session started',
      context: JSON.stringify({ goals }),
      tags: 'session,start'
    });
    
    console.log(`Session started: ${this.sessionId}`);
    return this.sessionId;
  }
  
  endSession(accomplishments = [], blockers = []) {
    if (!this.sessionId) {
      console.error('No active session');
      return;
    }
    
    const duration = Date.now() - this.sessionStart;
    const hours = (duration / (1000 * 60 * 60)).toFixed(2);
    
    this.memai.record({
      category: 'session',
      action: 'Development session ended',
      outcome: `Duration: ${hours} hours`,
      context: JSON.stringify({ accomplishments, blockers }),
      parentId: this.sessionId,
      tags: 'session,end'
    });
    
    // Create checkpoint
    this.memai.createCheckpoint({
      phase: 'session-summary',
      status: blockers.length > 0 ? 'blocked' : 'completed',
      progressPercent: accomplishments.length > 0 ? 100 : 0,
      pendingActions: [],
      blockers,
      memoryId: this.sessionId
    });
    
    console.log(`Session ended: ${hours} hours`);
    this.sessionId = null;
  }
  
  getSessionSummary(days = 7) {
    const since = Date.now() - (days * 24 * 60 * 60 * 1000);
    const sessions = this.memai.searchByTag('session')
      .filter(m => m.timestamp > since);
    
    return {
      totalSessions: sessions.length / 2, // start + end
      sessions: sessions
    };
  }
}

// Usage
const sessionMgr = new SessionManager(memai);

sessionMgr.startSession('feature-development', [
  'Implement user authentication',
  'Write tests',
  'Update documentation'
]);

// ... do work ...

sessionMgr.endSession(
  ['Implemented authentication', 'Wrote 15 tests'],
  ['Documentation pending review']
);

// Get summary
const summary = sessionMgr.getSessionSummary(7);
console.log(`${summary.totalSessions} sessions in last 7 days`);
```

---

## Integration Best Practices

### 1. Consistent Categorization

Use a consistent set of categories across your application:

```javascript
const CATEGORIES = {
  DEVELOPMENT: 'development',
  TESTING: 'testing',
  DEPLOYMENT: 'deployment',
  BUG_FIX: 'bug-fix',
  REFACTORING: 'refactoring',
  DOCUMENTATION: 'documentation',
  PERFORMANCE: 'performance',
  SECURITY: 'security'
};

memai.record({
  category: CATEGORIES.DEVELOPMENT,
  action: 'Implemented feature'
});
```

### 2. Structured Tagging

Use a consistent tagging strategy:

```javascript
// Format: domain,subdomain,specific
const tags = [
  'frontend,react,component',
  'backend,api,authentication',
  'database,migration,users',
  'testing,unit,integration'
].join(',');
```

### 3. Graceful Degradation

Don't let memAI failures break your application:

```javascript
class SafeMemai {
  constructor(dbPath) {
    try {
      this.memai = new Memai(dbPath);
      this.enabled = true;
    } catch (error) {
      console.warn('memAI initialization failed, running without memory');
      this.enabled = false;
    }
  }
  
  record(data) {
    if (!this.enabled) return null;
    try {
      return this.memai.record(data);
    } catch (error) {
      console.warn('Failed to record memory:', error.message);
      return null;
    }
  }
  
  // Wrap other methods similarly...
}
```

### 4. Periodic Exports

Set up automated exports for backup:

```javascript
import { CronJob } from 'cron';

// Export every day at midnight
new CronJob('0 0 * * *', () => {
  const date = new Date().toISOString().split('T')[0];
  memai.exportToJson(`./backups/memory-${date}.json`);
  console.log(`Exported memory backup for ${date}`);
}).start();
```

### 5. Memory Cleanup

Implement cleanup for old data:

```javascript
// Note: This requires direct SQL access
function cleanupOldMemories(memai, daysToKeep = 90) {
  const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
  
  const stmt = memai.db.prepare(`
    DELETE FROM memories 
    WHERE timestamp < ? 
    AND category NOT IN ('decision', 'knowledge')
  `);
  
  const result = stmt.run(cutoffTime);
  console.log(`Cleaned up ${result.changes} old memories`);
}
```
