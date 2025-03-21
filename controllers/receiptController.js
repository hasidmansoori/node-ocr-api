// receiptController.js
const path = require('path');
const fs = require('fs');
const { extractReceiptDetails } = require('../services/ocrService');  // OCR service for extracting details
const db = require('../database/db');

// Upload receipt controller (after file upload has been handled by middleware)
const uploadReceipt = (req, res) => {
    const { file } = req;
    if (!file || file.mimetype !== 'application/pdf') {
        return res.status(400).send({ message: 'Invalid file type. Only PDF allowed.' });
    }

    const createdAt = new Date().toISOString();
    const filePath = path.resolve(__dirname, '../uploads', file.filename);

    // Insert metadata into the receipt_file table
    const query = `INSERT INTO receipt_file (file_name, file_path, is_valid, created_at) VALUES (?, ?, ?, ?)`;
    db.run(query, [file.originalname, filePath, true, createdAt], (err) => {
        if (err) {
            return res.status(500).send({ message: 'Error uploading receipt' });
        }
        res.status(200).send({ message: 'File uploaded successfully' });
    });
};

// Process receipt and extract details via OCR
const processReceipt = (req, res) => {
    const { id } = req.body;  // Assuming ID is passed in the body

    const query = `SELECT * FROM receipt_file WHERE id = ?`;
    db.get(query, [id], async (err, row) => {
        if (err || !row) {
            return res.status(404).send({ message: 'Receipt not found' });
        }

        if (row.is_processed) {
            return res.status(400).send({ message: 'Receipt already processed' });
        }

        try {
            // Extract receipt details using OCR
            const extractedData = await extractReceiptDetails(row.file_path);
            const { purchased_at, merchant_name, total_amount } = extractedData;
            const createdAt = new Date().toISOString();

            // Insert extracted data into the receipt table
            const receiptQuery = `INSERT INTO receipt (purchased_at, merchant_name, total_amount, file_path, created_at) VALUES (?, ?, ?, ?, ?)`;
            db.run(receiptQuery, [purchased_at, merchant_name, total_amount, row.file_path, createdAt], (err) => {
                if (err) {
                    return res.status(500).send({ message: 'Error processing receipt' });
                }

                // Mark the receipt as processed in the receipt_file table
                const updateQuery = `UPDATE receipt_file SET is_processed = 1 WHERE id = ?`;
                db.run(updateQuery, [id], () => {
                    res.status(200).send({ message: 'Receipt processed successfully' });
                });
            });
        } catch (err) {
            res.status(500).send({ message: 'Error extracting data from receipt', error: err });
        }
    });
};

// Export the controller functions
module.exports = { uploadReceipt, processReceipt };
