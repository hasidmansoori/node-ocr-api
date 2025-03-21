# Receipt OCR API

This API provides functionality to upload, validate, process, and extract text from receipts in PDF format. The API uses Optical Character Recognition (OCR) to extract text from PDF files and store receipt details in a database.

## Features

- **Upload Receipts**: Allows users to upload PDF receipt files.
- **Validate Receipt**: Validates whether a receipt is available and its status.
- **Process Receipt**: Extracts information like purchased date, merchant name, and total amount from the uploaded receipt.
- **Extract Text from PDF**: Converts a receipt PDF to text using OCR.

## Prerequisites

Before running the API, ensure that you have the following installed on your machine:

- **Node.js**: [Download and Install Node.js](https://nodejs.org/)
- **npm**: Comes installed with Node.js
- **SQLite**: Database used for storing receipt information (alternatively, you can use any other supported database)
- **GraphicsMagick/ImageMagick**: Required for converting PDFs to images (needed for OCR)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/receipt-ocr-api.git

2. Navigate into the project folder:
   ```bash
   cd receipt-ocr-api

3. Install dependencies:
   ```bash
   npm install

# Usage

## 1. Run the API
To start the API server, run the following command:

```bash
npm start

## 2. API Endpoints

### `POST /upload`
**Description**: Upload a PDF receipt file.

- **Request Body**: A `multipart/form-data` request with a field named `receipt`.
- **Response**: A success or error message.

**Example cURL**:
```bash
curl -X POST -F "receipt=@path_to_receipt.pdf" http://localhost:3000/upload

### `POST /validate`
**Description**: Validate if a receipt is uploaded and check its status.

- **Request Body**: JSON containing the `id` of the receipt.
  ```json
  {
    "id": 1
  }
- **Response**:  A message indicating whether the receipt is valid or not.

**Example cURL**:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"id": 1}' http://localhost:3000/validate

### `POST /process`
**Description**: Process a receipt by extracting details like purchased date, merchant name, and total amount.

- **Request Body**: JSON containing the `id` of the receipt.
  ```json
  {
    "id": 1
  }
- **Response**:  A message confirming if the receipt was successfully processed.

**Example cURL**:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"id": 1}' http://localhost:3000/process

### `POST /extract-pdf`
**Description**: Extract text from a PDF receipt.

- **Request Body**: JSON containing the `id` of the receipt.
  ```json
  {
    "id": 1
  }
- **Response**: The extracted text from the receipt.

**Example cURL**:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"id": 1}' http://localhost:3000/extract-pdf

### 3. Database Structure

#### `receipt_file`: Contains information about the uploaded receipts.

- **id**: The unique ID for each receipt.
- **file_name**: The original name of the receipt file.
- **file_path**: The path where the file is stored.
- **is_valid**: A boolean indicating whether the receipt is valid.
- **created_at**: Timestamp of when the receipt was uploaded.
- **is_processed**: A boolean indicating whether the receipt has been processed.

#### `receipt`: Stores processed receipt details.

- **id**: The unique ID for each processed receipt.
- **purchased_at**: The date the receipt was issued.
- **merchant_name**: The name of the merchant.
- **total_amount**: The total amount on the receipt.
- **file_path**: Path to the original receipt file.
- **created_at**: Timestamp of when the receipt was processed.

