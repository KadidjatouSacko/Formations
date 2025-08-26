// ===================================================
// 🚀 SERVEUR PRINCIPAL FORMAPRO+ (server.js)
// ===================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

// Importation des routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const formationRoutes = require('./src/routes/formations');
const progressRoutes = require('./src/routes/progress');
const adminRoutes = require('./src/routes/admin');

// Importation des middlewares personnalisés
const { errorHandler } = require('./src/middleware/errorHandler');
const { notFound } = require('./src/middleware/notFound');

// ===================================================
// 📱 CONFIGURATION DE L'APPLICATION
// ===================================================

const app = express();
const PORT = process.env.PORT || 3000;

// ===================================================
// 🛡️ MIDDLEWARES DE SÉCURITÉ
// ===================================================

// Protection des en-têtes HTTP
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
            fontSrc: ["'self'", "fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'"],
        },
    },
}));

// Configuration CORS
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001'];
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Non autorisé par CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Limitation du taux de requêtes
const limiter = rateLimit({
    windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX || 100,
    message: {
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
app.use('/public', express.static(path.join(__dirname, '../frontend')));

// ===================================================
// 🌐 ROUTES API
// ===================================================

// Route de santé
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'FormaPro+ API est fonctionnel',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV
    });
});

// Routes principales
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/formations', formationRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);

// Route pour servir le frontend
app.get('/', (req, res) => {
  console.log('🏠 Route / appelée');
  
  // Définir toutes les variables nécessaires
  const config = {
    phone: '06 50 84 81 75',
    email: 'contact@formapro-plus.org',
    phoneIcon: '📞',
    emailIcon: '✉️',
    socialLinks: [
      { url: '#', title: 'Facebook', icon: '📘' },
      { url: '#', title: 'Instagram', icon: '📷' },
      { url: '#', title: 'LinkedIn', icon: '💼' }
    ]
  };

  const navLinks = [
    { url: '#formations', text: 'Formations' },
    { url: '#financements', text: 'Financements' },
    { url: '#evenements', text: 'Événements' },
    { url: '#blog', text: 'Blog' },
    { url: '/contact', text: 'Contact' }
  ];

  const hero = {
    title: 'FORMATION COMPLÈTE',
    highlight: 'AIDE À DOMICILE & EHPAD',
    subtitle: 'Communication, sécurité, pratiques professionnelles',
    description: 'Développez vos compétences avec notre formation complète.',
    stats: [
      { number: '36', label: 'Modules' },
      { number: '10', label: 'Blocs' },
      { number: '24/7', label: 'Accès' }
    ],
    button: { text: '🚀 DÉCOUVRIR NOS FORMATIONS', url: '#formations' },
    imageIcon: '🎓'
  };

  const formations = {
    title: 'NOS FORMATIONS',
    intro: 'Découvrez notre catalogue de formations spécialisées.',
    list: [
      {
        id: 1,
        slug: 'communication-relationnel',
        icon: '🗣️',
        badge: 'Essentiel',
        modules: 5,
        level: 'Débutant',
        title: 'Communication & Relationnel',
        description: 'Maîtrisez l\'art de la communication bienveillante.',
        features: ['Écoute active', 'Gestion conflits', 'Respect dignité', 'Vidéos pratiques'],
        price: 'Gratuit'
      }
      // Ajoutez les autres formations...
    ]
  };

  const globalStats = [
    { number: '2,500+', label: 'Professionnels formés' },
    { number: '36', label: 'Modules interactifs' },
    { number: '97%', label: 'Taux de satisfaction' },
    { number: '24/7', label: 'Support disponible' }
  ];

  const cta = {
    title: 'Prêt à',
    highlight: 'développer vos compétences',
    description: 'Rejoignez plus de 2500 professionnels.',
    buttons: [
      { text: '🚀 Commencer maintenant', url: '#formations' },
      { text: '▶️ Voir la démonstration', url: '#demo', style: 'secondary' }
    ]
  };

  const footer = {
    description: 'FormaPro+ est la plateforme de formation de référence.',
    copyright: '© 2024 FormaPro+. Tous droits réservés.',
    sections: [
      {
        title: 'Nos Formations',
        links: [{ text: 'Communication & Relationnel', url: '/formation/communication-relationnel' }]
      }
    ]
  };

  const chat = {
    tooltip: 'Besoin d\'aide ?',
    icon: '💬',
    notificationCount: 1
  };

  res.render('index', {
    title: 'FormaPro+',
    config,
    navLinks,
    hero,
    formations,
    globalStats,
    cta,
    footer,
    chat
  });
});
app.use('/formations', formationRoutes);

// ===================================================
// 🚨 GESTION DES ERREURS
// ===================================================

// Route non trouvée
app.use(notFound);

// Gestionnaire d'erreurs global
app.use(errorHandler);

// ===================================================
// 🎯 DÉMARRAGE DU SERVEUR
// ===================================================

const server = app.listen(PORT, () => {
    console.log('');
    console.log('🎓 ========================================');
    console.log('🚀   FORMAPRO+ API DÉMARRÉ AVEC SUCCÈS');
    console.log('🎓 ========================================');
    console.log('');
    console.log(`🌐 Serveur démarré sur le port: ${PORT}`);
    console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⚡ API disponible sur: http://localhost:${PORT}/api`);
    console.log(`🏠 Frontend accessible sur: http://localhost:${PORT}`);
    console.log('');
    console.log('📋 Endpoints principaux:');
    console.log('   🔐 Auth: /api/auth/*');
    console.log('   👥 Users: /api/users/*');
    console.log('   📚 Formations: /api/formations/*');
    console.log('   📊 Progress: /api/progress/*');
    console.log('   ⚙️  Admin: /api/admin/*');
    console.log('');
    console.log('🔍 Health Check: /api/health');
    console.log('');
    console.log('✨ FormaPro+ est prêt à transformer l\'apprentissage !');
    console.log('');
});

// ===================================================
// 🛡️ GESTION GRACIEUSE DE L'ARRÊT
// ===================================================

const gracefulShutdown = (signal) => {
    console.log(`\n🛑 Signal ${signal} reçu, arrêt gracieux en cours...`);
    
    server.close(() => {
        console.log('✅ Serveur HTTP fermé');
        
        // Fermeture des connexions de base de données
        const db = require('./src/utils/database');
        if (db.pool) {
            db.pool.end(() => {
                console.log('✅ Connexions base de données fermées');
                process.exit(0);
            });
        } else {
            process.exit(0);
        }
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

module.exports = app;