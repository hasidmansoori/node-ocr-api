const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { extractReceiptDetails } = require('../services/ocrService');
const db = require('../database/db');
const { createReceiptFileTable } = require('../models/receiptFile');
const { createReceiptTable } = require('../models/receipt');

// Setup file upload middleware
const upload = multer({
  dest: 'uploads/',  // Folder where files will be uploaded
  limits: { fileSize: 10 * 1024 * 1024 },  // Limit file size to 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Invalid file type. Only PDF allowed.'));
    }
    cb(null, true);
  }
});

const uploadReceipt = (req, res) => {
  const { file } = req;

  if (!file || file.mimetype !== 'application/pdf') {
    return res.status(400).send({ message: 'Invalid file type. Only PDF allowed.' });
  }

  const createdAt = new Date().toISOString();
  const filePath = path.resolve(__dirname, '../uploads', file.filename);

  // Insert file information into receipt_file table
  const query = `INSERT INTO receipt_file (file_name, file_path, is_valid, created_at) VALUES (?, ?, ?, ?)`;
  db.run(query, [file.originalname, filePath, true, createdAt], (err) => {
    if (err) {
      console.error("Error inserting file data into database:", err);
      return res.status(500).send({ message: 'Error uploading receipt', error: err.message });
    }
    res.status(200).send({ message: 'File uploaded successfully' });
  });
};

const validateReceipt = (req, res) => {
  const { id } = req.body;

  const query = `SELECT * FROM receipt_file WHERE id = ?`;
  db.get(query, [id], (err, row) => {
    if (err || !row) {
      return res.status(404).send({ message: 'Receipt not found' });
    }

    if (row.is_valid) {
      res.status(200).send({ message: 'Receipt is valid' });
    } else {
      res.status(400).send({ message: 'Receipt is invalid', reason: row.invalid_reason });
    }
  });
};

const processReceipt = (req, res) => {
  const { id } = req.body;

  const query = `SELECT * FROM receipt_file WHERE id = ?`;
  db.get(query, [id], async (err, row) => {
    if (err || !row) {
      return res.status(404).send({ message: 'Receipt not found' });
    }

    if (row.is_processed) {
      return res.status(400).send({ message: 'Receipt already processed' });
    }

    try {
      // Pass the file path to the OCR service to extract receipt details
      const extractedData = await extractReceiptDetails(row.file_path);
      const { purchased_at, merchant_name, total_amount } = extractedData;
      const createdAt = new Date().toISOString();

      // Insert the extracted data into the receipt table
      const receiptQuery = `INSERT INTO receipt (purchased_at, merchant_name, total_amount, file_path, created_at) VALUES (?, ?, ?, ?, ?)`;
      db.run(receiptQuery, [purchased_at, merchant_name, total_amount, row.file_path, createdAt], (err) => {
        if (err) {
          console.error("Error processing receipt:", err);
          return res.status(500).send({ message: 'Error processing receipt', error: err.message });
        }

        // Update the receipt_file table to mark the receipt as processed
        const updateQuery = `UPDATE receipt_file SET is_processed = 1 WHERE id = ?`;
        db.run(updateQuery, [id], () => {
          res.status(200).send({ message: 'Receipt processed successfully' });
        });
      });
    } catch (err) {
      console.error("Error extracting data from receipt:", err);
      res.status(500).send({ message: 'Error extracting data from receipt', error: err.message });
    }
  });
};

const getFilePathFromReceiptFile = (receiptId) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT file_path FROM receipt_file WHERE id = ?`;
      
      db.get(query, [receiptId], (err, row) => {
        if (err) {
          return reject({ message: 'Error fetching file path', error: err });
        }
        
        if (row) {
          resolve(row.file_path); // Return the file path
        } else {
          reject({ message: 'Receipt not found' });
        }
      });
    });
  };

module.exports = { uploadReceipt, validateReceipt, processReceipt, getFilePathFromReceiptFile };
