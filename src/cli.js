#!/usr/bin/env node

/**
 * memAI CLI
 * Command-line interface for memAI memory system
 */

import Memai from './memai.js';
import { existsSync } from 'fs';
import { join } from 'path';

const args = process.argv.slice(2);
const command = args[0];

// Default database path
const dbPath = process.env.MEMAI_DB_PATH || join(process.cwd(), '.memai', 'memory.db');

// Helper to check if database exists
function checkDatabase() {
  if (!existsSync(dbPath)) {
    console.error('❌ Database not found. Run "memai init" first.');
    process.exit(1);
  }
}

// Helper to format timestamp
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

// Helper to format age
function formatAge(ms) {
  const hours = ms / (1000 * 60 * 60);
  if (hours < 1) return `${Math.round(hours * 60)} minutes`;
  if (hours < 24) return `${hours.toFixed(1)} hours`;
  return `${(hours / 24).toFixed(1)} days`;
}

// Commands
const commands = {
  init() {
    console.log('Initializing memAI...');
    const memai = new Memai(dbPath);
    memai.close();
    console.log('✅ memAI initialized successfully!');
    console.log(`📁 Database: ${dbPath}`);
    console.log('\nNext steps:');
    console.log('  - Run "memai stats" to see statistics');
    console.log('  - Run "memai dashboard" to launch the web UI');
  },

  stats() {
    checkDatabase();
    const memai = new Memai(dbPath);
    const stats = memai.getStats();
    
    console.log('\n📊 memAI Statistics\n');
    console.log(`Memories:     ${stats.totalMemories} total`);
    console.log(`Decisions:    ${stats.totalDecisions} tracked`);
    console.log(`Issues:       ${stats.totalIssues} total (${stats.activeIssues} active, ${stats.resolvedIssues} resolved)`);
    if (stats.avgResolveTimeHours > 0) {
      console.log(`Avg Resolve:  ${stats.avgResolveTimeHours} hours`);
    }
    console.log(`\nDatabase:     ${dbPath}`);
    
    memai.close();
  },

  recent() {
    checkDatabase();
    const limit = parseInt(args[1]) || 20;
    const memai = new Memai(dbPath);
    const memories = memai.getRecentMemories(limit);
    
    console.log(`\n📝 Recent Memories (Last ${limit})\n`);
    
    if (memories.length === 0) {
      console.log('No memories found.');
    } else {
      memories.forEach(m => {
        const time = formatTime(m.timestamp);
        console.log(`[${time}] ${m.category}${m.phase ? ' | ' + m.phase : ''}`);
        console.log(`  Action: ${m.action}`);
        if (m.context) console.log(`  Context: ${m.context}`);
        if (m.reasoning) console.log(`  Reasoning: ${m.reasoning}`);
        if (m.outcome) console.log(`  Outcome: ${m.outcome}`);
        if (m.tags) console.log(`  Tags: ${m.tags}`);
        console.log();
      });
    }
    
    memai.close();
  },

  search() {
    checkDatabase();
    const query = args[1];
    if (!query) {
      console.error('❌ Please provide a search query');
      process.exit(1);
    }
    
    const memai = new Memai(dbPath);
    const memories = memai.db.prepare(`
      SELECT * FROM memories 
      WHERE action LIKE ? OR context LIKE ? OR reasoning LIKE ? OR outcome LIKE ?
      ORDER BY timestamp DESC
      LIMIT 50
    `).all(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`);
    
    console.log(`\n🔍 Search Results for "${query}" (${memories.length} matches)\n`);
    
    if (memories.length === 0) {
      console.log('No matches found.');
    } else {
      memories.forEach(m => {
        const time = formatTime(m.timestamp);
        console.log(`[${time}] ${m.category}${m.phase ? ' | ' + m.phase : ''}`);
        console.log(`  Action: ${m.action}`);
        if (m.context) console.log(`  Context: ${m.context}`);
        if (m.tags) console.log(`  Tags: ${m.tags}`);
        console.log();
      });
    }
    
    memai.close();
  },

  phase() {
    checkDatabase();
    const phaseName = args[1];
    if (!phaseName) {
      console.error('❌ Please provide a phase name');
      process.exit(1);
    }
    
    const memai = new Memai(dbPath);
    const memories = memai.getPhaseContext(phaseName);
    
    console.log(`\n📂 Phase: ${phaseName}\n`);
    console.log(`Memories: ${memories.length}\n`);
    
    if (memories.length === 0) {
      console.log('No memories found for this phase.');
    } else {
      memories.forEach(m => {
        const time = formatTime(m.timestamp);
        console.log(`[${time}] ${m.category}`);
        console.log(`  ${m.action}`);
        if (m.outcome) console.log(`  Outcome: ${m.outcome}`);
        console.log();
      });
    }
    
    memai.close();
  },

  issues() {
    checkDatabase();
    const status = args[1] || 'active';
    const memai = new Memai(dbPath);
    
    let issues;
    if (status === 'active') {
      issues = memai.getActiveIssues();
      console.log(`\n🐛 Active Issues (${issues.length})\n`);
    } else if (status === 'resolved') {
      issues = memai.db.prepare(`
        SELECT * FROM issues 
        WHERE resolved_at IS NOT NULL 
        ORDER BY resolved_at DESC 
        LIMIT 20
      `).all();
      console.log(`\n✅ Recently Resolved Issues (${issues.length})\n`);
    } else {
      issues = memai.db.prepare('SELECT * FROM issues ORDER BY timestamp DESC').all();
      console.log(`\n🐛 All Issues (${issues.length})\n`);
    }
    
    if (issues.length === 0) {
      console.log('No issues found.');
    } else {
      issues.forEach(i => {
        console.log(`[${i.severity}] ${i.category}`);
        console.log(`  ${i.description}`);
        if (i.resolved_at) {
          const resolveTime = (i.time_to_resolve / (1000 * 60 * 60)).toFixed(1);
          console.log(`  ✅ Resolved: ${i.resolution} (took ${resolveTime}h)`);
        } else if (i.age_ms) {
          console.log(`  Age: ${formatAge(i.age_ms)}`);
        }
        console.log();
      });
    }
    
    memai.close();
  },

  export() {
    checkDatabase();
    const format = args[1];
    const output = args[2];
    
    if (!format || !output) {
      console.error('❌ Usage: memai export <format> <output>');
      console.error('   Formats: json, markdown');
      process.exit(1);
    }
    
    const memai = new Memai(dbPath);
    
    console.log(`\n📦 Exporting to ${format}...\n`);
    
    if (format === 'json') {
      memai.exportToJson(output);
    } else if (format === 'markdown') {
      memai.exportToMarkdown(output);
    } else {
      console.error(`❌ Unknown format: ${format}`);
      process.exit(1);
    }
    
    memai.close();
  },

  briefing() {
    checkDatabase();
    const hours = parseInt(args[1]) || 24;
    const memai = new Memai(dbPath);
    
    const since = Date.now() - (hours * 60 * 60 * 1000);
    const briefing = memai.generateBriefing({ since, maxDepth: 50 });
    
    console.log(`\n🧠 memAI Briefing (Last ${hours} hours)\n`);
    console.log('━'.repeat(60));
    console.log('\n📊 Summary');
    console.log(`  Total Memories: ${briefing.summary.totalMemories}`);
    console.log(`  Active Issues: ${briefing.summary.activeIssuesCount}${briefing.summary.criticalIssuesCount > 0 ? ` (${briefing.summary.criticalIssuesCount} critical)` : ''}`);
    console.log(`  Current Phase: ${briefing.summary.currentPhase}`);
    console.log(`  Progress: ${briefing.summary.currentProgress}%`);
    console.log(`  Status: ${briefing.summary.currentStatus}`);
    
    if (briefing.summary.pendingActions.length > 0) {
      console.log('\n📋 Pending Actions:');
      briefing.summary.pendingActions.forEach(action => {
        console.log(`  • ${action}`);
      });
    }
    
    if (briefing.summary.blockers.length > 0) {
      console.log('\n⛔ Blockers:');
      briefing.summary.blockers.forEach(blocker => {
        console.log(`  • ${blocker}`);
      });
    }
    
    if (briefing.activeIssues.length > 0) {
      console.log('\n🐛 Active Issues:');
      briefing.activeIssues.slice(0, 5).forEach(i => {
        console.log(`  [${i.severity}] ${i.description}`);
      });
    }
    
    console.log('\n━'.repeat(60));
    
    memai.close();
  },

  dashboard() {
    checkDatabase();
    const port = args[1] || 3030;
    console.log('\n🚀 Launching memAI Dashboard...\n');
    console.log(`Starting server on port ${port}...`);
    
    // Set the port in process.argv for server.js to read
    process.argv[2] = port;
    
    // Import and run server
    import('./server.js').catch(err => {
      console.error('❌ Failed to start dashboard:', err.message);
      process.exit(1);
    });
  },

  help() {
    console.log(`
memAI - AI Memory System

Usage: memai <command> [options]

Commands:
  init                    Initialize memAI database
  stats                   Show database statistics
  recent [n]              Show recent memories (default: 20)
  search <query>          Search memories by keyword
  phase <name>            Show all memories for a phase
  issues [status]         List issues (active/resolved/all)
  export <format> <file>  Export data (json/markdown)
  briefing [hours]        Generate briefing (default: 24h)
  dashboard               Launch web dashboard
  help                    Show this help message

Examples:
  memai init
  memai stats
  memai recent 50
  memai search "authentication"
  memai phase "MVP Development"
  memai issues active
  memai export markdown report.md
  memai briefing 48
  memai dashboard

Environment Variables:
  MEMAI_DB_PATH          Custom database path

Documentation: https://github.com/yourusername/memai
`);
  }
};

// Execute command
if (!command || command === 'help' || command === '--help' || command === '-h') {
  commands.help();
} else if (commands[command]) {
  try {
    commands[command]();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
} else {
  console.error(`❌ Unknown command: ${command}`);
  console.log('Run "memai help" for usage information');
  process.exit(1);
}
