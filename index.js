// DIAGNOSTIC : Votre index.js actuel a probablement un problème avec les imports

// 1. Vérifiez votre index.js - Il devrait ressembler à ça :

// index.js (CORRIGÉ)
import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app/views')); // IMPORTANT : votre chemin

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
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
    console.log(`📍 Route demandée: ${req.method} ${req.path}`); // DEBUG
    next();
});

// ROUTES SIMPLIFIÉES POUR DÉBUGGER
// On va d'abord faire des routes directes sans import pour voir si ça marche

// Page d'accueil
app.get('/', (req, res) => {
    console.log('🏠 Route / appelée');
    res.render('index', {
        title: 'FormaPro+ - Plateforme de formation'
    });
});

// Page contact
app.get('/contact', (req, res) => {
    console.log('📞 Route /contact appelée');
    res.render('contact', {
        title: 'Contact - FormaPro+',
        success: req.query.success === '1'
    });
});

// Traitement contact
app.post('/contact', (req, res) => {
    console.log('📧 Formulaire contact soumis:', req.body);
    res.redirect('/contact?success=1');
});

// Formations
app.get('/formations', (req, res) => {
    console.log('📚 Route /formations appelée');
    
    // Données simulées directement ici pour tester
    const formations = [
        {
            id: 1,
            titre: 'Communication & Relationnel',
            description: 'Maîtrisez les techniques de communication professionnelle',
            duree: '4h30',
            niveau: 'Débutant',
            prix: 0,
            objectifs: [
                'Communiquer efficacement avec les bénéficiaires',
                'Gérer les situations difficiles',
                'Travailler en équipe'
            ]
        },
        {
            id: 2,
            titre: 'Premiers Secours',
            description: 'Formation aux gestes de premiers secours',
            duree: '6h00',
            niveau: 'Intermédiaire',
            prix: 49,
            certification: true
        }
    ];
    
    res.render('formations/catalogue', {
        title: 'Catalogue des formations - FormaPro+',
        formations: formations
    });
});

// Auth - Page de connexion
app.get('/auth/login', (req, res) => {
    console.log('🔐 Route /auth/login appelée');
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('auth/login', {
        title: 'Connexion - FormaPro+',
        error: req.query.error
    });
});

// Auth - Traitement connexion
app.post('/auth/login', (req, res) => {
    console.log('🔐 Tentative de connexion:', req.body.email);
    const { email, password } = req.body;
    
    // Test simple
    if (email === 'sophie.martin@email.com' && password === 'password') {
        req.session.user = {
            id: 1,
            nom: 'Martin',
            prenom: 'Sophie',
            email: 'sophie.martin@email.com',
            role: 'etudiant',
            avatar: 'SM'
        };
        console.log('✅ Connexion réussie');
        res.redirect('/dashboard');
    } else {
        console.log('❌ Connexion échouée');
        res.redirect('/auth/login?error=credentials');
    }
});

// Auto-login pour les tests
app.get('/auth/auto-login', (req, res) => {
    console.log('🚀 Connexion automatique activée');
    req.session.user = {
        id: 1,
        nom: 'Martin',
        prenom: 'Sophie',
        email: 'sophie.martin@email.com',
        role: 'etudiant',
        avatar: 'SM'
    };
    res.redirect('/dashboard');
});

// Déconnexion
app.get('/auth/logout', (req, res) => {
    console.log('👋 Déconnexion');
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// Dashboard (protégé)
app.get('/dashboard', (req, res) => {
    console.log('📊 Route /dashboard appelée');
    
    if (!req.session.user) {
        console.log('❌ Pas de session, redirection login');
        return res.redirect('/auth/login');
    }
    
    console.log('✅ Utilisateur connecté:', req.session.user.prenom);
    
    // Données simulées pour le dashboard
    const stats = {
        formationsEnCours: 2,
        formationsTerminees: 1,
        tempsTotal: '15h32min',
        scoreMoyen: 95
    };
    
    const formations = [
        {
            id: 1,
            titre: 'Communication & Relationnel',
            progression: 75,
            statut: 'en_cours',
            duree: '4h30',
            modules: 5,
            modulesCompletes: 4,
            dateDebut: new Date('2024-06-20')
        },
        {
            id: 2,
            titre: 'Premiers Secours',
            progression: 45,
            statut: 'en_cours',
            duree: '6h00',
            modules: 8,
            modulesCompletes: 3,
            dateDebut: new Date('2024-07-01')
        }
    ];
    
    const activiteRecente = [
        {
            type: 'module_complete',
            titre: 'Module terminé',
            description: 'Gestion des émotions',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
    ];
    
    res.render('dashboard-etudiant', {
        title: 'Mon espace - FormaPro+',
        user: req.session.user,
        stats: stats,
        formations: formations,
        activiteRecente: activiteRecente,
        formatDate: (date) => new Date(date).toLocaleDateString('fr-FR'),
        timeAgo: (date) => {
            const now = new Date();
            const diff = now - new Date(date);
            const hours = Math.floor(diff / (1000 * 60 * 60));
            if (hours < 24) return `Il y a ${hours}h`;
            const days = Math.floor(hours / 24);
            return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
        }
    });
});

// Lecteur de formation
app.get('/formations/:id/module/:moduleId', (req, res) => {
    console.log(`📖 Route lecteur appelée: formation ${req.params.id}, module ${req.params.moduleId}`);
    
    if (!req.session.user) {
        console.log('❌ Pas de session, redirection login');
        return res.redirect('/auth/login');
    }
    
    const formationId = parseInt(req.params.id);
    const moduleId = parseInt(req.params.moduleId);
    
    // Données simulées
    const formation = {
        id: formationId,
        titre: 'Communication & Relationnel',
        totalModules: 5,
        modules: [
            { id: 1, titre: 'Introduction à la communication', duree: '15 min' },
            { id: 2, titre: 'Bases de la communication bienveillante', duree: '20 min' },
            { id: 3, titre: 'Gestion des émotions', duree: '25 min' },
            { id: 4, titre: 'Communication avec les familles et l\'équipe', duree: '18 min' },
            { id: 5, titre: 'Respect de la dignité et autonomie', duree: '22 min' }
        ]
    };
    
    const module = formation.modules.find(m => m.id === moduleId) || formation.modules[0];
    
    const progression = {
        pourcentage: 75,
        modulesCompletes: 3,
        tempsPassé: '2h15',
        scoreMoyen: 94
    };
    
    res.render('lecteur-formation', {
        title: `${module.titre} - ${formation.titre} | FormaPro+`,
        user: req.session.user,
        formation: formation,
        module: {
            ...module,
            numero: moduleId,
            description: `Apprenez à maîtriser ${module.titre.toLowerCase()}.`
        },
        progression: progression,
        formatDate: (date) => new Date(date).toLocaleDateString('fr-FR')
    });
});

// Redirections des anciennes URLs
app.get('/dashboard-etudiant.html', (req, res) => {
    console.log('🔄 Redirection: dashboard-etudiant.html -> /dashboard');
    res.redirect('/dashboard');
});

app.get('/dashboard-video.html', (req, res) => {
    console.log('🔄 Redirection: dashboard-video.html -> lecteur');
    const module = req.query.module || '4';
    res.redirect(`/formations/1/module/${module}`);
});

app.get('/formations.html', (req, res) => {
    console.log('🔄 Redirection: formations.html -> /formations');
    res.redirect('/formations');
});

app.get('/contact.html', (req, res) => {
    console.log('🔄 Redirection: contact.html -> /contact');
    res.redirect('/contact');
});

// Gestion des erreurs 404
app.use((req, res, next) => {
    console.log('❌ 404 - Route non trouvée:', req.path);
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
    console.error('💥 Erreur serveur:', err.message);
    res.status(500).render('error', {
        title: 'Erreur serveur - FormaPro+',
        error: {
            status: 500,
            message: 'Une erreur interne est survenue'
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur FormaPro+ démarré sur le port ${PORT}`);
    console.log(`📱 Interface accessible sur : http://localhost:${PORT}`);
    console.log(`📊 Dashboard : http://localhost:${PORT}/dashboard`);
    console.log(`🔗 Auto-login : http://localhost:${PORT}/auth/auto-login`);
    console.log(`📂 Views path: ${path.join(__dirname, 'app/views')}`);
});

export default app;