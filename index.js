import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bodyParser from 'body-parser';
import session from 'express-session';
import authRoutes from './app/backend/src/routes/auth.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app', 'views'));

// Middleware
app.use(express.static(__dirname));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'formapro-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use('/', authRoutes);
// Middleware de logging
app.use((req, res, next) => {
    console.log(`📍 Route demandée: ${req.method} ${req.path}`);
    next();
});

// DONNÉES FORMATIONS (simulation BDD)
const formations = [
    {
        id: 1,
        titre: 'Communication & Relationnel',
        description: 'Maîtrisez l\'art de la communication bienveillante, la gestion des émotions et des situations difficiles.',
        niveau: 'Débutant',
        modules_count: 5,
        duree: '3h',
        prix: 0,
        icon: '🗣️',
        badge: 'Essentiel',
        competences: ['Écoute active', 'Gestion conflits', 'Respect dignité', 'Vidéos pratiques'],
        domaine: 'communication',
        populaire: true,
        certifiante: false,
        nouveau: false
    },
    {
        id: 2,
        titre: 'Hygiène, Sécurité & Prévention',
        description: 'Protocoles d\'hygiène professionnelle, sécurité avec les produits ménagers, prévention des risques.',
        niveau: 'Intermédiaire',
        modules_count: 4,
        duree: '4h',
        prix: 49,
        prix_original: 79,
        icon: '🛡️',
        badge: 'Avancé',
        competences: ['Protocoles hygiène', 'Sécurité produits', 'Prévention chutes', 'Anti-infections'],
        domaine: 'hygiene',
        populaire: true,
        certifiante: true,
        nouveau: false
    },
    {
        id: 3,
        titre: 'Ergonomie & Gestes Professionnels',
        description: 'Techniques de manutention, prévention des TMS, utilisation du matériel médical.',
        niveau: 'Avancé',
        modules_count: 3,
        duree: '5h',
        prix: 79,
        icon: '🏥',
        badge: 'Expert',
        competences: ['Bonnes postures', 'Transferts sécurisés', 'Matériel médical', 'Prévention TMS'],
        domaine: 'ergonomie',
        populaire: false,
        certifiante: true,
        nouveau: false
    }
];

// ===========================
// ROUTES - ACCUEIL
// ===========================
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
    { url: '/formations', text: 'Formations' },
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
    description: 'ADSIAM est la plateforme de formation de référence.',
    copyright: '© 2024 ADSIAM. Tous droits réservés.',
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
  const stats = {
    totalBlocks: 5,   // ou récupérés depuis ta base
    totalModules: 12
  };

  res.render('index', {
    title: 'FormaPro+',
    config,
    navLinks,
    hero,
    stats,
    formations,
     currentPage: 'index',
    globalStats,
    cta,
    footer,
    chat
  });
});

// ===========================
// ROUTES FORMATIONS - PUBLIQUES
// ===========================

// Catalogue des formations (PUBLIC - pas de connexion requise)
app.get('/formations/catalogue', (req, res) => {
    console.log('📚 Route /formations/catalogue appelée - ACCÈS PUBLIC');
    
    try {
        const templatePath = path.join(__dirname, 'app', 'views', 'formations', 'catalogue.ejs');
        
        if (fs.existsSync(templatePath)) {
            res.render('formations/catalogue', {
                title: 'Catalogue des formations - FormaPro+',
                user: req.session.user || null,
                formations: formations,
                domaines: [
                    { nom: 'Communication', slug: 'communication' },
                    { nom: 'Hygiène & Sécurité', slug: 'hygiene' },
                    { nom: 'Ergonomie', slug: 'ergonomie' }
                ],
                totalFormations: formations.length,
                totalModules: 36,
                totalBlocs: 10,
                niveaux: ['Débutant', 'Intermédiaire', 'Avancé', 'Expert']
            });
        } else {
            // Page HTML de fallback si template EJS manquant
            res.send(`
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <title>Catalogue ADSIAM</title>
                    <style>
                        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 2rem; background: #f8f9fa; }
                        .formation-card { background: white; border: 1px solid #ddd; padding: 2rem; margin-bottom: 2rem; border-radius: 15px; }
                        .formation-title { color: #d4a5a5; font-size: 1.5rem; margin-bottom: 0.5rem; }
                        .formation-meta { color: #666; margin-bottom: 1rem; display: flex; gap: 1rem; }
                        .btn { background: linear-gradient(135deg, #d4a5a5, #a5c9d4); color: white; padding: 0.8rem 1.5rem; border: none; border-radius: 10px; cursor: pointer; }
                        .header { text-align: center; margin-bottom: 3rem; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>📚 Catalogue des formations FormaPro+</h1>
                        <p>Formations professionnelles pour l'aide à domicile et EHPAD</p>
                    </div>
                    
                    ${formations.map(f => `
                        <div class="formation-card">
                            <h3 class="formation-title">${f.icon} ${f.titre}</h3>
                            <div class="formation-meta">
                                <span>${f.niveau}</span>
                                <span>${f.modules_count} modules</span>
                                <span>${f.duree}</span>
                                ${f.certifiante ? '<span>🏆 Certifiante</span>' : ''}
                            </div>
                            <p>${f.description}</p>
                            <p><strong>Prix:</strong> ${f.prix === 0 ? 'Gratuit' : f.prix + '€'}</p>
                            <button class="btn">Voir la formation</button>
                        </div>
                    `).join('')}
                    
                    <p style="text-align: center; margin-top: 3rem;">
                        <a href="/">← Retour à l'accueil</a> | 
                        <a href="/auth/auto-login">Se connecter</a>
                    </p>
                    
                    <p style="color: #999; text-align: center; margin-top: 1rem;">
                        Template EJS manquant: ${templatePath}
                    </p>
                </body>
                </html>
            `);
        }
    } catch (error) {
        console.error('❌ Erreur catalogue:', error);
        res.status(500).send('Erreur serveur');
    }
});

// Raccourci /catalogue -> /formations/catalogue
app.get('/catalogue', (req, res) => {
    console.log('📚 Route /catalogue - redirection vers /formations/catalogue');
    res.redirect('/formations/catalogue');
});

// Détail d'une formation (PUBLIC)
app.get('/formations/:id', async (req, res, next) => {
    try {
        const formationId = parseInt(req.params.id);
        console.log(`📖 Demande de détail formation: ${formationId}`);
        
        // Valider l'ID
        if (isNaN(formationId)) {
            const error = new Error('ID de formation invalide');
            error.status = 400;
            return next(error);
        }
        
        // Chercher la formation dans les données statiques
        const formation = formations.find(f => f.id === formationId);
        
        if (!formation) {
            const error = new Error('Formation non trouvée');
            error.status = 404;
            return next(error);
        }
        
        // Formations similaires (même domaine)
        const formationsSimilaires = formations.filter(f => 
            f.domaine === formation.domaine && 
            f.id !== formationId
        ).slice(0, 3);
        
        res.render('formations/detail', {
            title: `${formation.titre} - FormaPro+`,
            user: req.session.user || null,
            formation: formation,
            formationsSimilaires: formationsSimilaires,
            userHasAccess: !!req.session.user
        });
        
    } catch (error) {
        console.error('Erreur détail formation:', error);
        next(error);
    }
});

// ===========================
// ROUTES AUTHENTIFICATION
// ===========================


app.post('/auth/login', (req, res) => {
    console.log(`🔐 Tentative de connexion: ${req.body.email}`);
    const { email, password } = req.body;
    
    if (email === 'demo@formapro.fr' && password === 'demo') {
        req.session.user = {
            id: 1,
            name: 'Sophie Martin',
            email: email,
            role: 'etudiant'
        };
        console.log('✅ Connexion réussie');
        res.redirect('/dashboard');
    } else {
        res.redirect('/connexion?error=1');
    }
});

app.get('/auth/auto-login', (req, res) => {
    console.log('🔗 Auto-login activé');
    req.session.user = {
        id: 1,
        name: 'Sophie Martin',
        email: 'demo@formapro.fr',
        role: 'etudiant'
    };
    res.redirect('/dashboard');
});

// ===========================
// ROUTES DASHBOARD (nécessitent connexion)
// ===========================
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        console.log('❌ Pas de session, redirection login');
        return res.redirect('/connexion');
    }
    console.log(`✅ Utilisateur connecté: ${req.session.user.name}`);
    next();
};

app.get('/dashboard', requireAuth, (req, res) => {
    console.log('📊 Route /dashboard appelée');
    const dashboardPath = path.join(__dirname, 'dashboard-etudiant.html');
    if (fs.existsSync(dashboardPath)) {
        res.sendFile(dashboardPath);
    } else {
        res.send(`<h1>Dashboard - ${req.session.user.name}</h1><p>Fichier dashboard-etudiant.html manquant</p>`);
    }
});

app.get('/dashboard/formation/:id', requireAuth, (req, res) => {
    console.log(`📖 Route formation: ${req.params.id}`);
    const formationPath = path.join(__dirname, 'dashboard-video.html');
    if (fs.existsSync(formationPath)) {
        res.sendFile(formationPath);
    } else {
        res.send(`<h1>Formation ${req.params.id}</h1>`);
    }
});

// ===========================
// MIDDLEWARE 404
// ===========================
app.use((req, res) => {
    console.log(`❌ 404 - Route non trouvée: ${req.path}`);
    
    // Essayer de servir un fichier HTML
    const htmlPath = path.join(__dirname, req.path + '.html');
    if (fs.existsSync(htmlPath)) {
        console.log(`📄 Fichier HTML trouvé: ${htmlPath}`);
        return res.sendFile(htmlPath);
    }
    
    res.status(404).send(`
        <h1>404 - Page non trouvée</h1>
        <p>La route ${req.path} n'existe pas.</p>
        <p><a href="/">Retour accueil</a> | <a href="/formations/catalogue">Catalogue</a></p>
    `);
});

// ===========================
// DÉMARRAGE SERVEUR
// ===========================
app.listen(PORT, () => {
    console.log(`🚀 Serveur FormaPro+ démarré sur le port ${PORT}`);
    console.log(`📱 Interface accessible sur : http://localhost:${PORT}`);
    console.log(`📊 Dashboard : http://localhost:${PORT}/dashboard`);
    console.log(`🔗 Auto-login : http://localhost:${PORT}/auth/auto-login`);
    console.log(`📂 Views path: ${path.join(__dirname, 'app', 'views')}`);
    console.log('');
    console.log('🔓 ROUTES PUBLIQUES (sans connexion):');
    console.log(`   📚 Catalogue: http://localhost:${PORT}/formations/catalogue`);
    console.log(`   📚 Raccourci: http://localhost:${PORT}/catalogue`);
});