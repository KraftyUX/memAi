import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), '.memai', 'memory.db');
const db = new Database(dbPath);

try {
    console.log('Adding embedding column to memories table...');
    db.exec('ALTER TABLE memories ADD COLUMN embedding BLOB');
    console.log('✅ Column added successfully.');
} catch (error) {
    if (error.message.includes('duplicate column name')) {
        console.log('ℹ️ Column already exists.');
    } else {
        console.error('❌ Error adding column:', error.message);
    }
}

db.close();
