const db = require('../database/db');

const createReceiptFileTable = () => {
    db.run(`
        CREATE TABLE IF NOT EXISTS receipt_file (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_name TEXT,
            file_path TEXT,
            is_valid BOOLEAN,
            invalid_reason TEXT,
            is_processed BOOLEAN,
            created_at TEXT,
            updated_at TEXT
        )
    `);
};

module.exports = { createReceiptFileTable };
