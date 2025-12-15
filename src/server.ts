#!/usr/bin/env node

/**
 * memAI Dashboard Server
 * Simple HTTP server to view AI memories in the browser
 * 
 * Usage: npx memai dashboard [port]
 * Default port: 3030
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, dirname, extname } from 'path';
import Memai from './memai.js';

// Parse port from command line, ensuring it's a valid number
const portArg = process.argv[2];
const PORT = (portArg && !isNaN(parseInt(portArg))) ? parseInt(portArg) : 3030;

// Dashboard paths - prefer built React app (dashboard/dist), fallback to legacy HTML
const DASHBOARD_DIST_DIR = join(process.cwd(), 'dashboard', 'dist');
const DASHBOARD_LEGACY_PATH = join(process.cwd(), 'dashboard', 'index.html');

// Determine which dashboard to serve
const useReactDashboard = existsSync(join(DASHBOARD_DIST_DIR, 'index.html'));
const DASHBOARD_DIR = useReactDashboard ? DASHBOARD_DIST_DIR : dirname(DASHBOARD_LEGACY_PATH);
const DASHBOARD_INDEX = useReactDashboard 
  ? join(DASHBOARD_DIST_DIR, 'index.html') 
  : DASHBOARD_LEGACY_PATH;

const DB_PATH = process.env.MEMAI_DB_PATH || join(process.cwd(), '.memai', 'memory.db');

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.db': 'application/x-sqlite3',
  '.md': 'text/markdown',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

// Initialize memAI
let memai: Memai;
try {
  memai = new Memai(DB_PATH);
} catch (error: any) {
  console.error('❌ Failed to initialize memAI:', error.message);
  console.error('   Run "memai init" first to create the database');
  process.exit(1);
}

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API endpoints
  if (req.url && req.url.startsWith('/api/')) {
    handleApiRequest(req, res);
    return;
  }

  // Handle favicon request (ignore silently)
  if (req.url === '/favicon.ico') {
    res.writeHead(204); // No Content
    res.end();
    return;
  }

  // Parse URL - serve dashboard for root, otherwise look for static files
  let filePath: string;
  if (req.url === '/' || !req.url) {
    filePath = DASHBOARD_INDEX;
  } else {
    // Remove leading slash and resolve relative to dashboard directory
    const requestPath = req.url.substring(1);
    filePath = join(DASHBOARD_DIR, requestPath);
  }

  // Security: prevent directory traversal
  const resolvedPath = filePath;
  if (!resolvedPath.startsWith(DASHBOARD_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Check if file exists - for SPA routing, serve index.html for non-existent paths
  if (!existsSync(filePath)) {
    // SPA fallback: serve index.html for client-side routing (only for React dashboard)
    if (useReactDashboard && !extname(req.url || '')) {
      filePath = DASHBOARD_INDEX;
    } else {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
  }

  // Determine content type
  const ext = extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    const content = readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (error: any) {
    res.writeHead(500);
    res.end('Internal server error: ' + error.message);
  }
});

function handleApiRequest(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');

  try {
    if (req.url === '/api/data') {
      // Get all memories
      const memories = memai.getRecentMemories(1000);
      res.writeHead(200);
      res.end(JSON.stringify(memories));
    } else if (req.url === '/api/decisions') {
      // Get all decisions
      const decisions = memai.getDecisions(1000);
      res.writeHead(200);
      res.end(JSON.stringify(decisions));
    } else if (req.url === '/api/stats') {
      // Get statistics
      const stats = memai.getStats();
      res.writeHead(200);
      res.end(JSON.stringify(stats));
    } else if (req.url === '/api/briefing') {
      // Get briefing
      const briefing = memai.generateBriefing({ since: 0, maxDepth: 100 });
      res.writeHead(200);
      res.end(JSON.stringify(briefing));
    } else if (req.url === '/api/export') {
      // Export to markdown
      const tempFile = join(process.cwd(), '.memai', 'export.md');
      memai.exportToMarkdown(tempFile);
      const content = readFileSync(tempFile);
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', 'attachment; filename="memai-export.md"');
      res.writeHead(200);
      res.end(content);
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'API endpoint not found' }));
    }
  } catch (error: any) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: error.message }));
  }
}

server.listen(PORT, () => {
  console.log('');
  console.log('🧠 memAI Dashboard Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 Server running at: http://localhost:${PORT}`);
  console.log(`📂 Database: ${DB_PATH}`);
  console.log(`🎨 Dashboard: ${useReactDashboard ? 'React (dashboard/dist)' : 'Legacy (dashboard/index.html)'}`);
  console.log('');
  console.log('🌐 Open in browser:');
  console.log(`   http://localhost:${PORT}`);
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // Auto-open browser
  const open = async () => {
    const { default: openBrowser } = await import('open');
    await openBrowser(`http://localhost:${PORT}`);
  };

  // Try to open browser (optional dependency)
  import('open')
    .then(() => open())
    .catch(() => {
      console.log('💡 Tip: Install "open" package to auto-open browser');
      console.log('   npm install --save-dev open');
    });
});

server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.error(`   Try a different port: npx memai dashboard 3031`);
  } else {
    console.error('❌ Server error:', error.message);
  }
  process.exit(1);
});
