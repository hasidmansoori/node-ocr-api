const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');  // Import pdf-parse for parsing PDFs directly

// Function to extract text from the given PDF file path
const extractReceiptDetails = (pdfPath) => {
  return new Promise((resolve, reject) => {
    // Read the PDF file into a buffer
    const pdfBuffer = fs.readFileSync(pdfPath);

    // Parse the PDF buffer
    pdfParse(pdfBuffer).then(function(data) {
      // The data.text contains the extracted text from the PDF
      resolve(data.text);
    }).catch((err) => {
      reject(err);  // Reject in case of error
    });
  });
};

module.exports = { extractReceiptDetails };
