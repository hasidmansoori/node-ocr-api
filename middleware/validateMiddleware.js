// validateMiddleware.js
const db = require('../database/db');  // Assuming you have a db module for SQLite

const validateReceipt = (req, res, next) => {
    const { id } = req.body;  // Assuming ID is passed in the body
    const query = `SELECT * FROM receipt_file WHERE id = ?`;

    db.get(query, [id], (err, row) => {
        if (err || !row) {
            return res.status(404).send({ message: 'Receipt not found' });
        }

        // If the receipt is valid, proceed to the next middleware or controller
        if (row.is_valid) {
            next(); // Continue to the next step (e.g., processing the receipt)
        } else {
            res.status(400).send({ message: 'Receipt is invalid', reason: row.invalid_reason });
        }
    });
};

module.exports = validateReceipt;
