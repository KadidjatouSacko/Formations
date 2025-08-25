// index.js (votre fichier principal à la racine)
import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Configuration ES6 pour __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app/views')); // views à la racine

// Middlewares
app.use(express.static(path.join(__dirname, 'public'))); // vos fichiers statiques
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// Configuration des sessions
app.use(session({
    secret: process.env.SESSION_SECRET || 'formapro-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Middleware pour les données utilisateur globales
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.isLoggedIn = !!req.session.user;
    res.locals.currentRoute = req.path;
    next();
});

// Import des routes (avec votre structure)
import indexRoutes from './app/backend/src/routes/index.js';
import authRoutes from './app/backend/src/routes/auth.js';
import dashboardRoutes from './app/backend/src/routes/dashboard.js';
import formationRoutes from './app/backend/src/routes/formations.js';
import apiRoutes from './app/backend/src/routes/api.js';

// Utilisation des routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/formations', formationRoutes);
app.use('/api', apiRoutes);

// Redirections pour vos anciens fichiers HTML
app.get('/dashboard-etudiant.html', (req, res) => {
    res.redirect('/dashboard');
});

app.get('/dashboard-video.html', (req, res) => {
    const course = req.query.course || 'communication';
    const module = req.query.module || '4';
    res.redirect(`/formations/1/module/${module}`);
});

app.get('/formations.html', (req, res) => {
    res.redirect('/formations');
});

app.get('/contact.html', (req, res) => {
    res.redirect('/contact');
});

// Redirections pour compatibilité avec les anciens liens HTML
app.get('/dashboard-etudiant.html', (req, res) => {
    res.redirect('/dashboard');
});

app.get('/dashboard-video.html', (req, res) => {
    const course = req.query.course || 'communication';
    const module = req.query.module || '4';
    
    let formationId = 1;
    if (course === 'premiers-secours') formationId = 2;
    if (course === 'hygiene-securite') formationId = 3;
    
    res.redirect(`/formations/${formationId}/module/${module}`);
});

app.get('/lecteur-formation.html', (req, res) => {
    const course = req.query.course || 'communication';
    const module = req.query.module || '4';
    
    let formationId = 1;
    if (course === 'premiers-secours') formationId = 2;
    
    res.redirect(`/formations/${formationId}/module/${module}`);
});

app.get('/formations.html', (req, res) => {
    res.redirect('/formations');
});

app.get('/contact.html', (req, res) => {
    res.redirect('/contact');
});

// Gestion des erreurs 404
app.use((req, res, next) => {
    res.status(404).render('error', {
        title: 'Page non trouvée - FormaPro+',
        error: {
            status: 404,
            message: 'La page demandée n\'existe pas'
        }
    });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Erreur serveur - FormaPro+',
        error: {
            status: 500,
            message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur interne est survenue'
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur FormaPro+ démarré sur le port ${PORT}`);
    console.log(`📱 Interface accessible sur : http://localhost:${PORT}`);
    console.log(`📊 Dashboard : http://localhost:${PORT}/dashboard`);
    console.log(`📚 Formations : http://localhost:${PORT}/formations`);
});

export default app;
