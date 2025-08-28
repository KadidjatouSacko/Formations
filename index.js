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
app.get('/formations/catalogue', async (req, res) => {
    try {
        const formations = await Formation.findAll({
            include: [{
                model: Module,
                as: 'modules'
            }]
        });
        
        res.render('formations/catalogue', {
            title: 'Catalogue des formations - FormaPro+',
            user: req.session.user || null,
            formations: formations,
            categories: ['Communication', 'Sécurité', 'Premiers Secours'],
            levels: ['Débutant', 'Intermédiaire', 'Avancé']
        });
        
    } catch (error) {
        console.error('Erreur catalogue:', error);
        res.status(500).send('Erreur serveur');
    }
});

// Raccourci /catalogue -> /formations/catalogue
app.get('/catalogue', (req, res) => {
    console.log('📚 Route /catalogue - redirection vers /formations/catalogue');
    res.redirect('/formations/catalogue');
});

// Détail d'une formation (PUBLIC)
app.get('/formations/:id', async (req, res) => {
    try {
        const formationId = req.params.id;
        
        const formation = await Formation.findByPk(formationId, {
            include: [{
                model: Module,
                as: 'modules',
                order: [['sort_order', 'ASC']]
            }]
        });
        
        if (!formation) {
            return res.status(404).render('error', {
                title: 'Formation non trouvée',
                message: 'Cette formation n\'existe pas',
                user: req.session.user || null
            });
        }
        
        // Formations similaires
        const formationsSimilaires = await Formation.findAll({
            where: {
                category_name: formation.category_name,
                id: { [sequelize.Op.ne]: formationId }
            },
            limit: 3
        });
        
        res.render('formations/detail', {
            title: `${formation.title} - FormaPro+`,
            user: req.session.user || null,
            formation: formation,
            formationsSimilaires: formationsSimilaires,
            userHasAccess: !!req.session.user
        });
        
    } catch (error) {
        console.error('Erreur détail formation:', error);
        res.status(500).render('error', {
            title: 'Erreur',
            message: 'Erreur lors du chargement de la formation',
            user: req.session.user || null
        });
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