// middleware/upload.js - Gestion des uploads
const multer = require('multer');
const path = require('path');

// Configuration du stockage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = 'public/uploads/';
        
        // Organiser par type de fichier
        if (file.mimetype.startsWith('image/')) {
            uploadPath += 'images/';
        } else if (file.mimetype.startsWith('video/')) {
            uploadPath += 'videos/';
        } else {
            uploadPath += 'documents/';
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Générer un nom unique
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtrer les types de fichiers autorisés
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'video/mp4',
        'video/webm'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non autorisé'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB max
    }
});

module.exports = upload;
