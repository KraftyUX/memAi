/**
 * memAI - AI Memory System
 * Version: 1.0.0
 * 
 * Provides persistent, queryable memory for AI agents and development teams.
 * Enables context preservation, intelligent resume, and decision tracking.
 */

import Database from 'better-sqlite3';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateEmbedding, cosineSimilarity } from './embeddings.js';



interface Memory {
  id?: number;
  timestamp?: number;
  category: 'checkpoint' | 'decision' | 'implementation' | 'issue' | 'validation' | 'insight' | 'user-interaction';
  phase?: string;
  action: string;
  context?: string;
  reasoning?: string;
  outcome?: string;
  tags?: string;
  parentId?: number;
  embedding?: string;
}

interface Decision {
  decision: string;
  rationale: string;
  alternatives?: string;
  impact?: string;
  reversible?: boolean;
  memoryId?: number;
}

interface FileChange {
  filePath: string;
  changeType: string;
  reason?: string;
  diffSummary?: string;
  linesAdded?: number;
  linesRemoved?: number;
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

interface Issue {
  severity: 'P0' | 'P1' | 'P2' | 'P3';
  category: string;
  description: string;
  memoryId?: number;
}

interface TestResult {
  testSuite: string;
  total?: number;
  passed?: number;
  failed?: number;
  skipped?: number;
  durationMs?: number;
  failureDetails?: any[];
  memoryId?: number;
}

class Memai {
  dbPath: string;
  db: Database.Database | null;
  logDir: string;

  constructor(dbPath: string = join(process.cwd(), '.memai', 'memory.db')) {
    this.dbPath = dbPath;
    this.db = null;
    this.logDir = join(dirname(dbPath), 'logs');
    this.init();
  }

  /**
   * Initialize database and create tables
   */
  init() {
    // Ensure directories exist
    const dbDir = dirname(this.dbPath);
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
    }

    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true });
    }

    // Open database
    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL'); // Write-Ahead Logging for performance
    if (!this.db) throw new Error('Database not initialized');

    // Load and execute schema
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    this.db.exec(schema);

    console.log('✅ memAI initialized:', this.dbPath);
  }

  /**
   * Record a memory entry
   */
  record({ category, phase, action, context, reasoning, outcome, tags, parentId }: Memory): number | bigint {
    const timestamp = Date.now();

    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT INTO memories (timestamp, category, phase, action, context, reasoning, outcome, tags, parent_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      timestamp,
      category,
      phase || null,
      action,
      context || null,
      reasoning || null,
      outcome || null,
      tags || null,
      parentId || null
    );

    const id = result.lastInsertRowid;

    // Generate and save embedding asynchronously
    this.updateEmbedding(Number(id), action, context, reasoning).catch(err =>
      console.error('Failed to generate embedding for memory', id, err)
    );

    // Also log to JSON for audit trail
    this.appendToJsonLog({
      id: result.lastInsertRowid,
      timestamp,
      category,
      phase,
      action,
      context,
      reasoning,
      outcome,
      tags,
      parentId
    });

    return id;
  }

  async updateEmbedding(id: number, action: string, context?: string, reasoning?: string) {
    if (!this.db) return;
    const text = `${action}\n${context || ''}\n${reasoning || ''}`;
    const embedding = await generateEmbedding(text);
    if (embedding) {
      this.db.prepare('UPDATE memories SET embedding = ? WHERE id = ?').run(JSON.stringify(embedding), id);
    }
  }

  /**
   * Search memories (Semantic + Keyword)
   */
  async search(query: string, limit: number = 10): Promise<Memory[]> {
    // 1. Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);

    if (!this.db) throw new Error('Database not initialized');

    // 2. Get all memories with embeddings
    const memories = this.db.prepare(`
      SELECT id, action, context, reasoning, outcome, tags, timestamp, category, phase, embedding 
      FROM memories 
      WHERE embedding IS NOT NULL
    `).all() as Memory[];

    // 3. Calculate similarities
    if (queryEmbedding && memories.length > 0) {
      const results = memories.map(m => {
        const embedding = JSON.parse(m.embedding!);
        return {
          ...m,
          similarity: cosineSimilarity(queryEmbedding, embedding)
        };
      });

      // 4. Sort by similarity and return top K
      return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map(({ embedding, ...rest }) => rest); // Remove embedding from result
    }

    // Fallback to keyword search if embedding fails or no data
    return this.db.prepare(`
      SELECT * FROM memories 
      WHERE action LIKE ? OR context LIKE ? OR reasoning LIKE ?
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(`%${query}%`, `%${query}%`, `%${query}%`, limit) as Memory[];
  }

  /**
   * Record a decision
   */
  recordDecision({ decision, rationale, alternatives, impact, reversible, memoryId }: Decision): number | bigint {
    const timestamp = Date.now();

    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT INTO decisions (timestamp, decision, rationale, alternatives, impact, reversible, memory_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    return stmt.run(
      timestamp,
      decision,
      rationale,
      alternatives || null,
      impact || null,
      reversible !== false ? 1 : 0,
      memoryId || null
    ).lastInsertRowid;
  }

  /**
   * Record file change
   */
  recordFileChange({ filePath, changeType, reason, diffSummary, linesAdded, linesRemoved, memoryId }: FileChange): number | bigint {
    const timestamp = Date.now();

    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT INTO file_changes (timestamp, file_path, change_type, reason, diff_summary, lines_added, lines_removed, memory_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    return stmt.run(
      timestamp,
      filePath,
      changeType,
      reason || null,
      diffSummary || null,
      linesAdded || 0,
      linesRemoved || 0,
      memoryId || null
    ).lastInsertRowid;
  }

  /**
   * Add knowledge to the knowledge base
   */
  addKnowledge({ topic, content, confidence, source, tags }: { topic: string; content: string; confidence?: number; source?: string; tags?: string }): number | bigint {
    const timestamp = Date.now();

    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT INTO knowledge (topic, content, confidence, source, last_validated, tags, validation_count)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);

    return stmt.run(
      topic,
      content,
      confidence || 0.5,
      source || null,
      timestamp,
      tags || null
    ).lastInsertRowid;
  }

  /**
   * Create checkpoint
   */
  createCheckpoint({ phase, status, progressPercent, pendingActions, blockers, memoryId }: Checkpoint): number | bigint {
    const timestamp = Date.now();

    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT INTO checkpoints (timestamp, phase, status, progress_percent, pending_actions, blockers, memory_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    return stmt.run(
      timestamp,
      phase,
      status,
      progressPercent || 0,
      JSON.stringify(pendingActions || []),
      JSON.stringify(blockers || []),
      memoryId || null
    ).lastInsertRowid;
  }

  /**
   * Record an issue
   */
  recordIssue({ severity, category, description, memoryId }: Issue): number | bigint {
    const timestamp = Date.now();

    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT INTO issues (timestamp, severity, category, description, memory_id)
      VALUES (?, ?, ?, ?, ?)
    `);

    return stmt.run(
      timestamp,
      severity,
      category,
      description,
      memoryId || null
    ).lastInsertRowid;
  }

  /**
   * Resolve an issue
   */
  resolveIssue(issueId: number, resolution: string) {
    const resolvedAt = Date.now();

    if (!this.db) throw new Error('Database not initialized');

    // Get issue creation time
    const issue = this.db.prepare('SELECT timestamp FROM issues WHERE id = ?').get(issueId) as { timestamp: number } | undefined;
    const timeToResolve = issue ? resolvedAt - issue.timestamp : 0;

    const stmt = this.db.prepare(`
      UPDATE issues 
      SET resolution = ?, resolved_at = ?, time_to_resolve = ?
      WHERE id = ?
    `);

    return stmt.run(resolution, resolvedAt, timeToResolve, issueId);
  }

  /**
   * Record test results
   */
  recordTestResults({ testSuite, total, passed, failed, skipped, durationMs, failureDetails, memoryId }: TestResult): number | bigint {
    const timestamp = Date.now();

    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT INTO test_results (timestamp, test_suite, total_tests, passed, failed, skipped, duration_ms, failure_details, memory_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    return stmt.run(
      timestamp,
      testSuite,
      total || 0,
      passed || 0,
      failed || 0,
      skipped || 0,
      durationMs || 0,
      JSON.stringify(failureDetails || []),
      memoryId || null
    ).lastInsertRowid;
  }

  /**
   * Get recent memories
   */
  getRecentMemories(limit: number = 20): Memory[] {
    if (!this.db) throw new Error('Database not initialized');
    const stmt = this.db.prepare(`
      SELECT * FROM memories 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);

    return stmt.all(limit) as Memory[];
  }

  /**
   * Get phase context
   */
  getPhaseContext(phase: string): Memory[] {
    if (!this.db) throw new Error('Database not initialized');
    const stmt = this.db.prepare(`
      SELECT * FROM memories 
      WHERE phase = ? 
      ORDER BY timestamp ASC
    `);

    return stmt.all(phase) as Memory[];
  }

  /**
   * Get recent decisions
   */
  getRecentDecisions(limit: number = 10): (Decision & { context?: string; phase?: string })[] {
    if (!this.db) throw new Error('Database not initialized');
    const stmt = this.db.prepare(`
      SELECT d.*, m.context, m.phase 
      FROM decisions d
      LEFT JOIN memories m ON d.memory_id = m.id
      ORDER BY d.timestamp DESC
      LIMIT ?
    `);

    return stmt.all(limit) as (Decision & { context?: string; phase?: string })[];
  }

  /**
   * Find issues by keyword
   */
  findIssues(keyword: string): Issue[] {
    if (!this.db) throw new Error('Database not initialized');
    const stmt = this.db.prepare(`
      SELECT * FROM issues 
      WHERE description LIKE ? OR resolution LIKE ?
      ORDER BY 
        CASE severity 
          WHEN 'P0' THEN 1 
          WHEN 'P1' THEN 2 
          WHEN 'P2' THEN 3 
          ELSE 4 
        END,
        timestamp DESC
    `);

    return stmt.all(`%${keyword}%`, `%${keyword}%`) as Issue[];
  }

  /**
   * Get active (unresolved) issues
   */
  getActiveIssues(): Issue[] {
    if (!this.db) throw new Error('Database not initialized');
    const stmt = this.db.prepare(`
      SELECT * FROM active_issues
    `);

    return stmt.all() as Issue[];
  }

  /**
   * Get phase progress
   */
  getPhaseProgress(): any[] {
    if (!this.db) throw new Error('Database not initialized');
    const stmt = this.db.prepare(`
      SELECT * FROM phase_progress
    `);

    return stmt.all();
  }

  /**
   * Get top knowledge
   */
  getTopKnowledge(limit: number = 20): any[] {
    if (!this.db) throw new Error('Database not initialized');
    const stmt = this.db.prepare(`
      SELECT * FROM top_knowledge LIMIT ?
    `);

    return stmt.all(limit);
  }

  /**
   * Search memories by tag
   */
  searchByTag(tag: string): Memory[] {
    if (!this.db) throw new Error('Database not initialized');
    const stmt = this.db.prepare(`
      SELECT * FROM memories 
      WHERE tags LIKE ? 
      ORDER BY timestamp DESC
    `);

    return stmt.all(`%${tag}%`) as Memory[];
  }

  /**
   * Generate resume briefing
   */
  generateBriefing({ since, categories, maxDepth = 3 }: { since?: number | string | Date; categories?: string[]; maxDepth?: number }): any {
    const sinceTimestamp = since ? new Date(since).getTime() : Date.now() - (24 * 60 * 60 * 1000);

    if (!this.db) throw new Error('Database not initialized');

    const query = categories
      ? `SELECT * FROM memories WHERE timestamp > ? AND category IN (${categories.map(() => '?').join(',')}) ORDER BY timestamp DESC LIMIT ?`
      : `SELECT * FROM memories WHERE timestamp > ? ORDER BY timestamp DESC LIMIT ?`;

    const params = categories
      ? [sinceTimestamp, ...categories, maxDepth * 10]
      : [sinceTimestamp, maxDepth * 10];

    const stmt = this.db.prepare(query);
    const memories = stmt.all(...params) as Memory[];

    // Get active issues
    const activeIssues = this.getActiveIssues();

    // Get latest checkpoint
    const latestCheckpoint = this.db.prepare(`
      SELECT * FROM checkpoints 
      ORDER BY timestamp DESC 
      LIMIT 1
    `).get() as Checkpoint | undefined;

    return {
      memories,
      activeIssues,
      latestCheckpoint,
      summary: this.summarizeBriefing(memories, activeIssues, latestCheckpoint)
    };
  }

  /**
   * Summarize briefing for AI consumption
   */
  summarizeBriefing(memories: Memory[], issues: Issue[], checkpoint?: Checkpoint): any {
    const categories = memories.reduce((acc: Record<string, number>, m) => {
      acc[m.category] = (acc[m.category] || 0) + 1;
      return acc;
    }, {});

    return {
      totalMemories: memories.length,
      categoryCounts: categories,
      activeIssuesCount: issues.length,
      criticalIssuesCount: issues.filter(i => i.severity === 'P0').length,
      currentPhase: checkpoint?.phase || 'Unknown',
      currentProgress: checkpoint?.progressPercent || 0,
      currentStatus: checkpoint?.status || 'Unknown',
      lastActivity: memories[0]?.timestamp || null,
      pendingActions: checkpoint ? JSON.parse((checkpoint.pendingActions as any) || '[]') : [],
      blockers: checkpoint ? JSON.parse((checkpoint.blockers as any) || '[]') : []
    };
  }

  /**
   * Export to JSON
   */
  exportToJson(outputPath: string): void {
    if (!this.db) throw new Error('Database not initialized');
    const memories = this.db.prepare('SELECT * FROM memories ORDER BY timestamp ASC').all();
    const decisions = this.db.prepare('SELECT * FROM decisions ORDER BY timestamp ASC').all();
    const fileChanges = this.db.prepare('SELECT * FROM file_changes ORDER BY timestamp ASC').all();
    const knowledge = this.db.prepare('SELECT * FROM knowledge').all();
    const checkpoints = this.db.prepare('SELECT * FROM checkpoints ORDER BY timestamp ASC').all();
    const issues = this.db.prepare('SELECT * FROM issues ORDER BY timestamp ASC').all();
    const testResults = this.db.prepare('SELECT * FROM test_results ORDER BY timestamp ASC').all();

    const exportData = {
      version: '1.0.0',
      exportedAt: Date.now(),
      memories,
      decisions,
      fileChanges,
      knowledge,
      checkpoints,
      issues,
      testResults
    };

    writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
    console.log('✅ Exported to:', outputPath);
  }

  /**
   * Export to Markdown report
   */
  exportToMarkdown(outputPath: string): void {
    if (!this.db) throw new Error('Database not initialized');
    const briefing = this.generateBriefing({ since: 0, maxDepth: 1000 });
    const phaseProgress = this.getPhaseProgress();
    const testHealth = this.db.prepare('SELECT * FROM test_health').all() as any[];

    let md = '# memAI - Project Memory Report\n\n';
    md += `**Generated**: ${new Date().toISOString()}\n\n`;
    md += `---\n\n`;

    md += `## Summary\n\n`;
    md += `- **Total Memories**: ${briefing.summary.totalMemories}\n`;
    md += `- **Active Issues**: ${briefing.summary.activeIssuesCount}\n`;
    md += `- **Critical Issues**: ${briefing.summary.criticalIssuesCount}\n`;
    md += `- **Current Phase**: ${briefing.summary.currentPhase}\n`;
    md += `- **Progress**: ${briefing.summary.currentProgress}%\n`;
    md += `- **Status**: ${briefing.summary.currentStatus}\n\n`;

    md += `---\n\n`;
    md += `## Phase Progress\n\n`;
    md += `| Phase | Status | Progress | Memories | Last Activity |\n`;
    md += `|-------|--------|----------|----------|---------------|\n`;
    phaseProgress.forEach((p: any) => {
      const lastActivity = p.last_activity ? new Date(p.last_activity).toLocaleString() : 'N/A';
      md += `| ${p.phase} | ${p.status} | ${p.progress_percent}% | ${p.memory_count} | ${lastActivity} |\n`;
    });

    md += `\n---\n\n`;
    md += `## Test Health\n\n`;
    md += `| Suite | Pass Rate | Avg Duration | Runs | Last Run |\n`;
    md += `|-------|-----------|--------------|------|----------|\n`;
    testHealth.forEach((t: any) => {
      const lastRun = t.last_run ? new Date(t.last_run).toLocaleString() : 'N/A';
      md += `| ${t.test_suite} | ${t.avg_pass_rate.toFixed(1)}% | ${t.avg_duration.toFixed(0)}ms | ${t.run_count} | ${lastRun} |\n`;
    });

    md += `\n---\n\n`;
    md += `## Active Issues\n\n`;
    if (briefing.activeIssues.length === 0) {
      md += `*No active issues* ✅\n\n`;
    } else {
      md += `| Severity | Category | Description | Age |\n`;
      md += `|----------|----------|-------------|-----|\n`;
      briefing.activeIssues.forEach((i: any) => {
        const ageHours = (i.age_ms / (1000 * 60 * 60)).toFixed(1);
        md += `| ${i.severity} | ${i.category} | ${i.description} | ${ageHours}h |\n`;
      });
    }

    md += `\n---\n\n`;
    md += `## Recent Activity\n\n`;
    briefing.memories.slice(0, 20).forEach((m: Memory) => {
      md += `### ${m.action}\n`;
      md += `**Category**: ${m.category}  \n`;
      md += `**Phase**: ${m.phase || 'N/A'}  \n`;
      md += `**Time**: ${new Date(m.timestamp!).toLocaleString()}  \n\n`;
      if (m.context) md += `**Context**: ${m.context}  \n`;
      if (m.reasoning) md += `**Reasoning**: ${m.reasoning}  \n`;
      if (m.outcome) md += `**Outcome**: ${m.outcome}  \n`;
      if (m.tags) md += `**Tags**: ${m.tags}  \n`;
      md += `\n---\n\n`;
    });

    writeFileSync(outputPath, md);
    console.log('✅ Markdown report exported to:', outputPath);
  }

  /**
   * Append to JSON log (audit trail)
   */
  appendToJsonLog(entry: any): void {
    const logFile = join(this.logDir, `${new Date().toISOString().split('T')[0]}.json`);
    let logs: any[] = [];

    if (existsSync(logFile)) {
      logs = JSON.parse(readFileSync(logFile, 'utf-8'));
    }

    logs.push(entry);
    writeFileSync(logFile, JSON.stringify(logs, null, 2));
  }

  /**
   * Get statistics
   */
  getStats(): any {
    if (!this.db) throw new Error('Database not initialized');
    const totalMemories = (this.db.prepare('SELECT COUNT(*) as count FROM memories').get() as any).count;
    const totalDecisions = (this.db.prepare('SELECT COUNT(*) as count FROM decisions').get() as any).count;
    const totalIssues = (this.db.prepare('SELECT COUNT(*) as count FROM issues').get() as any).count;
    const resolvedIssues = (this.db.prepare('SELECT COUNT(*) as count FROM issues WHERE resolved_at IS NOT NULL').get() as any).count;
    const avgResolveTime = (this.db.prepare('SELECT AVG(time_to_resolve) as avg FROM issues WHERE time_to_resolve IS NOT NULL').get() as any).avg;

    return {
      totalMemories,
      totalDecisions,
      totalIssues,
      resolvedIssues,
      activeIssues: totalIssues - resolvedIssues,
      avgResolveTimeMs: avgResolveTime || 0,
      avgResolveTimeHours: avgResolveTime ? (avgResolveTime / (1000 * 60 * 60)).toFixed(2) : 0
    };
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      console.log('✅ memAI closed');
    }
  }
}

export default Memai;
