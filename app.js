const express = require('express');
const path = require('path');
const { uploadReceipt, validateReceipt, processReceipt, getFilePathFromReceiptFile } = require('./controllers/fileController');
const multer = require('multer');
const { extractReceiptDetails } = require('./services/ocrService');  // Import the extractTextFromPDF function
const app = express();
const port = 3000;

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Folder where files will be uploaded
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Naming the file with timestamp to avoid filename conflicts
  }
});

const upload = multer({ storage });  // Use the storage configuration

// Create tables if not exist
const { createReceiptFileTable } = require('./models/receiptFile');
const { createReceiptTable } = require('./models/receipt');
createReceiptFileTable();
createReceiptTable();

app.use(express.json());

// Routes
app.post('/upload', upload.single('receipt'), uploadReceipt);  // Use the multer middleware with the correct field name ('receipt')
app.post('/validate', validateReceipt);
app.post('/process', processReceipt);

// New route for extracting text from PDF
// The route will use the ID passed in the body to get the file path and extract the details
app.post('/extract-pdf', async (req, res) => {
  try {
    const { id } = req.body;  // Assuming the ID of the receipt is passed in the body

    // Get the file path from the database based on the receipt ID
    const filePath = await getFilePathFromReceiptFile(id);
    
    // Once you have the file path, pass it to the OCR service to extract text from the PDF
    const extractedText = await extractReceiptDetails(filePath);

    // Return the extracted text as the response
    res.status(200).send({ extractedText });

  } catch (err) {
    console.error('Error extracting PDF:', err);
    res.status(500).send({ message: 'Error extracting data from PDF', error: err });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
