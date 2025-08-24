// ===================================================
// 🚀 SERVEUR PRINCIPAL FORMAPRO+ (index.js)
// Serveur Express avec modules ES6
// ===================================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import 'dotenv/config';

// Importation des routes (à créer)
import authRoutes from "./app/backend/src/routes/auth.js";

// import authRoutes from './routes/auth.js';
import userRoutes from './app/backend/src/routes/users.js';
import formationRoutes from './app/backend/src/routes/formations.js';
import progressRoutes from './app/backend/src/routes/progress.js';
import adminRoutes from './app/backend/src/routes/admin.js';

// Importation des middlewares personnalisés

import errorHandler from "./app/backend/src/middleware/errorHandler.js";
// import notFound from "./app/backend/src/middleware/notFound.js";
import { authenticateToken } from "./app/backend/src/middleware/auth.js";
// ===================================================
// 🔧 CONFIGURATION ES6 MODULES
// ===================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🎓 DÉMARRAGE FORMAPRO+ (Modules ES6)');
console.log('====================================');
console.log('');

// ===================================================
// 🛡️ MIDDLEWARES DE SÉCURITÉ
// ===================================================

// Protection des en-têtes HTTP
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "fonts.gstatic.com", "cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "cdnjs.cloudflare.com"],
            connectSrc: ["'self'"],
            mediaSrc: ["'self'", "blob:", "data:"],
            objectSrc: ["'none'"],
            frameSrc: ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Configuration CORS
const corsOptions = {
    origin: function (origin, callback) {
        // En développement, autoriser toutes les origines
        if (process.env.NODE_ENV === 'development') {
            callback(null, true);
            return;
        }
        
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000'
        ];
        
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Permissif en développement
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Limitation du taux de requêtes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX || 100,
    message: {
        success: false,
        error: 'Trop de requêtes depuis cette IP, réessayez plus tard.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// ===================================================
// 🔧 MIDDLEWARES GÉNÉRAUX
// ===================================================

// Compression des réponses
app.use(compression());

// Parsing des cookies
app.use(cookieParser());

// Logging des requêtes
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Parsing du body (JSON et URL-encoded)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));
app.use(express.static(path.join(__dirname, 'public')));

// ===================================================
// 🌐 ROUTES PRINCIPALES
// ===================================================

// Route de santé (health check)
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'FormaPro+ API est fonctionnel',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/formations', formationRoutes);
app.use('/api/progress', authenticateToken, progressRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);

// ===================================================
// 🏠 ROUTES FRONTEND (vos pages HTML)
// ===================================================

// Page d'accueil - redirection vers dashboard
app.get('/', (req, res) => {
    res.redirect('/dashboard');
});

// Dashboard étudiant (votre fichier existant)
app.get('/dashboard', (req, res) => {
    const filePath = path.join(__dirname, 'public/dashboard-etudiant.html');
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send(`
            <div style="text-align: center; padding: 3rem; font-family: Arial, sans-serif;">
                <h1>🎓 FormaPro+</h1>
                <h2>📁 Dashboard étudiant manquant</h2>
                <p>Copiez votre fichier <strong>dashboard-etudiant.html</strong> dans le dossier <strong>public/</strong></p>
                <a href="/api/health" style="color: #007bff;">Tester l'API</a>
            </div>
        `);
    }
});

// Lecteur de formation (votre fichier existant)
app.get('/video', (req, res) => {
    const filePath = path.join(__dirname, 'public/dashboard-video.html');
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send(`
            <div style="text-align: center; padding: 3rem; font-family: Arial, sans-serif;">
                <h1>🎓 FormaPro+</h1>
                <h2>🎥 Lecteur vidéo manquant</h2>
                <p>Copiez votre fichier <strong>dashboard-video.html</strong> dans le dossier <strong>public/</strong></p>
                <a href="/dashboard">Retour au dashboard</a>
            </div>
        `);
    }
});

// Route de formation dynamique
app.get('/formation/:slug', (req, res) => {
    res.redirect(`/video?course=${req.params.slug}`);
});

// Lecteur de formation avec paramètres
app.get('/lecteur-formation.html', (req, res) => {
    res.redirect('/video' + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''));
});

// ===================================================
// 🚨 GESTION DES ERREURS
// ===================================================

// Route non trouvée
// app.use(notFound);

// Gestionnaire d'erreurs global
// app.use(errorHandler);

// ===================================================
// 🎯 DÉMARRAGE DU SERVEUR
// ===================================================

const server = app.listen(PORT, () => {
    console.log('');
    console.log('🎓 ========================================');
    console.log('🚀   FORMAPRO+ API DÉMARRÉ AVEC SUCCÈS');
    console.log('🎓 ========================================');
    console.log('');
    console.log(`🌐 Serveur: http://localhost:${PORT}`);
    console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⚡ Modules ES6: Activés`);
    console.log('');
    console.log('📋 Pages principales:');
    console.log(`   🏠 Accueil: http://localhost:${PORT}/`);
    console.log(`   📊 Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`   🎥 Lecteur: http://localhost:${PORT}/video`);
    console.log('');
    console.log('🔍 API Endpoints:');
    console.log(`   ✅ Health: http://localhost:${PORT}/api/health`);
    console.log(`   🔐 Auth: http://localhost:${PORT}/api/auth/*`);
    console.log(`   📚 Formations: http://localhost:${PORT}/api/formations`);
    console.log(`   👥 Users: http://localhost:${PORT}/api/users/*`);
    console.log('');
    console.log('✨ FormaPro+ prêt à révolutionner l\'apprentissage !');
    console.log('');

    // Vérifier si les fichiers frontend existent
    const publicDir = path.join(__dirname, 'public');
    const dashboardFile = path.join(publicDir, 'dashboard-etudiant.html');
    const videoFile = path.join(publicDir, 'dashboard-video.html');

    console.log('📁 Vérification des fichiers frontend:');
    console.log(`   Dashboard: ${fs.existsSync(dashboardFile) ? '✅' : '❌'} dashboard-etudiant.html`);
    console.log(`   Lecteur: ${fs.existsSync(videoFile) ? '✅' : '❌'} dashboard-video.html`);
    
    if (!fs.existsSync(dashboardFile) || !fs.existsSync(videoFile)) {
        console.log('');
        console.log('⚠️  Action requise: Copiez vos fichiers HTML dans public/');
        console.log('   cp dashboard-etudiant.html public/');
        console.log('   cp dashboard-video.html public/');
    }
    console.log('');
});

// ===================================================
// 🛡️ GESTION GRACIEUSE DE L'ARRÊT
// ===================================================

const gracefulShutdown = (signal) => {
    console.log(`\n🛑 Signal ${signal} reçu, arrêt gracieux en cours...`);
    
    server.close(() => {
        console.log('✅ Serveur HTTP fermé');
        
        // Ici vous pourriez fermer les connexions de base de données
        // await db.close();
        
        process.exit(0);
    });

    // Force l'arrêt si ça prend trop de temps
    setTimeout(() => {
        console.log('⚠️  Arrêt forcé');
        process.exit(1);
    }, 10000);
};

// Écoute des signaux d'arrêt
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
    console.error('💥 Exception non capturée:', error);
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Promesse rejetée non gérée:', reason, 'at:', promise);
    gracefulShutdown('unhandledRejection');
});

export default app;