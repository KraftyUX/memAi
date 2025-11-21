#!/usr/bin/env node

/**
 * memAI Initialization Script
 * Standalone script to initialize memAI database
 */

import Memai from './memai.js';
import { join } from 'path';

const dbPath = process.env.MEMAI_DB_PATH || join(process.cwd(), '.memai', 'memory.db');

console.log('\n🧠 memAI Initialization\n');
console.log('━'.repeat(60));

try {
  console.log('\n📁 Creating database...');
  const memai = new Memai(dbPath);

  console.log('✅ Database created successfully!');
  console.log(`📍 Location: ${dbPath}`);

  // Record initial memory
  memai.record({
    category: 'checkpoint',
    action: 'memAI initialized',
    context: 'First-time setup',
    outcome: 'Database created and ready to use',
    tags: 'initialization,setup'
  });

  console.log('✅ Initial memory recorded');

  memai.close();

  console.log('\n━'.repeat(60));
  console.log('\n🎉 memAI is ready to use!\n');
  console.log('Next steps:');
  console.log('  • Run "memai stats" to see statistics');
  console.log('  • Run "memai dashboard" to launch the web UI');
  console.log('  • Run "memai help" for all commands');
  console.log('\n📚 Documentation: https://github.com/yourusername/memai\n');

} catch (error: any) {
  console.error('\n❌ Initialization failed:', error.message);
  console.error('\nPlease check:');
  console.error('  • You have write permissions in the current directory');
  console.error('  • SQLite is properly installed (better-sqlite3)');
  console.error('  • No other process is using the database file');
  process.exit(1);
}
