// uploadMiddleware.js
const multer = require('multer');
const path = require('path');

// Set up multer for file upload
const upload = multer({
    dest: 'uploads/',  // Folder where files will be uploaded
    limits: { fileSize: 10 * 1024 * 1024 },  // Limit file size to 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Invalid file type. Only PDF allowed.'));
        }
        cb(null, true); // Accept the file
    }
});

// Exporting the upload middleware for use in routes
module.exports = upload;
