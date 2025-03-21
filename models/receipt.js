const db = require('../database/db');

const createReceiptTable = () => {
    db.run(`
        CREATE TABLE IF NOT EXISTS receipt (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            purchased_at TEXT,
            merchant_name TEXT,
            total_amount REAL,
            file_path TEXT,
            created_at TEXT,
            updated_at TEXT
        )
    `);
};

module.exports = { createReceiptTable };
