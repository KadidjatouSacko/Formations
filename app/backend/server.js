import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bodyParser from 'body-parser';
import session from 'express-session';

// Configuration ES6 pour __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app', 'views'));

// Servir les fichiers statiques
app.use(express.static(__dirname));
app.use(express.static('public'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'formapro-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Middleware de logging
app.use((req, res, next) => {
    console.log(`📍 Route demandée: ${req.method} ${req.path}`);
    next();
});

// Middleware d'authentification
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        console.log('❌ Pas de session, redirection login');
        return res.redirect('/auth/login');
    }
    next();
};

// DONNÉES DE FORMATIONS (simulation BDD)
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
    },
    {
        id: 4,
        titre: 'Gestion des Urgences & Premiers Secours',
        description: 'Formation complète aux gestes qui sauvent : RCP, défibrillateur, position latérale de sécurité.',
        niveau: 'Essentiel',
        modules_count: 5,
        duree: '6h',
        prix: 99,
        icon: '🚨',
        badge: 'Critique',
        competences: ['RCP & Défibrillateur', 'Position PLS', 'Gestion blessures', 'Situations critiques'],
        domaine: 'urgences',
        populaire: true,
        certifiante: true,
        nouveau: false
    },
    {
        id: 5,
        titre: 'Préparation des Repas & Alimentation',
        description: 'Hygiène alimentaire, repas équilibrés adaptés, gestion des textures.',
        niveau: 'Intermédiaire',
        modules_count: 4,
        duree: '4h',
        prix: 59,
        icon: '🍽️',
        badge: 'Pratique',
        competences: ['Hygiène alimentaire', 'Repas équilibrés', 'Textures adaptées', 'Hydratation'],
        domaine: 'nutrition',
        populaire: false,
        certifiante: false,
        nouveau: false
    },
    {
        id: 6,
        titre: 'Pathologies & Situations Spécifiques',
        description: 'Accompagnement des troubles cognitifs, Alzheimer, maladies chroniques.',
        niveau: 'Expert',
        modules_count: 4,
        duree: '5h',
        prix: 89,
        icon: '🧠',
        badge: 'Spécialisé',
        competences: ['Troubles cognitifs', 'Maladies chroniques', 'Perte mobilité', 'Fin de vie'],
        domaine: 'pathologies',
        populaire: false,
        certifiante: true,
        nouveau: true
    }
];

const domaines = [
    { nom: 'Communication', slug: 'communication' },
    { nom: 'Hygiène & Sécurité', slug: 'hygiene' },
    { nom: 'Ergonomie', slug: 'ergonomie' },
    { nom: 'Urgences', slug: 'urgences' },
    { nom: 'Nutrition', slug: 'nutrition' },
    { nom: 'Pathologies', slug: 'pathologies' }
];

// ===========================
// ROUTES PRINCIPALES
// ===========================

// Route racine
app.get('/', (req, res) => {
    console.log('🏠 Route / appelée');
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.send(`
            <h1>FormaPro+ - Accueil</h1>
            <p>Votre fichier index.html n'existe pas encore.</p>
            <p><a href="/formations/catalogue">Voir le catalogue</a></p>
            <p><a href="/dashboard">Dashboard</a></p>
        `);
    }
});

// ===========================
// ROUTES AUTHENTIFICATION
// ===========================

app.get('/auth/login', (req, res) => {
    console.log('🔐 Route /auth/login appelée');
    res.send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Connexion - FormaPro+</title>
            <style>
                body { font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #f5e6e6, #e6f2f5); height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; }
                .login-card { background: white; padding: 3rem; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.1); max-width: 400px; width: 100%; }
                h2 { color: #d4a5a5; margin-bottom: 2rem; text-align: center; }
                input { width: 100%; padding: 1rem; margin-bottom: 1rem; border: 2px solid #f0f0f0; border-radius: 10px; font-size: 1rem; }
                input:focus { outline: none; border-color: #a5c9d4; }
                button { width: 100%; padding: 1rem; background: linear-gradient(135deg, #d4a5a5, #a5c9d4); color: white; border: none; border-radius: 10px; font-size: 1rem; font-weight: 600; cursor: pointer; margin-bottom: 1rem; }
                button:hover { transform: translateY(-2px); }
                .auto-login { text-align: center; margin-top: 1rem; }
                .auto-login a { color: #a5c9d4; text-decoration: none; font-weight: 500; }
            </style>
        </head>
        <body>
            <div class="login-card">
                <h2>Connexion FormaPro+</h2>
                <form method="post" action="/auth/login">
                    <input type="email" name="email" placeholder="Votre email" required>
                    <input type="password" name="password" placeholder="Mot de passe" required>
                    <button type="submit">Se connecter</button>
                </form>
                <div class="auto-login">
                    <a href="/auth/auto-login">Connexion automatique (demo)</a>
                </div>
            </div>
        </body>
        </html>
    `);
});

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
        res.redirect('/auth/login?error=1');
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

app.get('/auth/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// ===========================
// ROUTES DASHBOARD
// ===========================

app.get('/dashboard', requireAuth, (req, res) => {
    console.log(`📊 Route /dashboard appelée`);
    console.log(`✅ Utilisateur connecté: ${req.session.user.name}`);
    
    const dashboardPath = path.join(__dirname, 'dashboard-etudiant.html');
    if (fs.existsSync(dashboardPath)) {
        res.sendFile(dashboardPath);
    } else {
        res.send(`
            <h1>Dashboard - ${req.session.user.name}</h1>
            <p>Votre fichier dashboard-etudiant.html n'existe pas.</p>
            <p><a href="/formations/catalogue">Voir les formations</a></p>
            <p><a href="/auth/logout">Se déconnecter</a></p>
        `);
    }
});

app.get('/dashboard/formation/:id', requireAuth, (req, res) => {
    console.log(`📖 Route dashboard formation: ${req.params.id}`);
    const formationPath = path.join(__dirname, 'dashboard-video.html');
    if (fs.existsSync(formationPath)) {
        res.sendFile(formationPath);
    } else {
        res.send(`<h1>Formation ${req.params.id}</h1><p>Fichier dashboard-video.html manquant</p>`);
    }
});

// ===========================
// ROUTES FORMATIONS
// ===========================

// Raccourci /catalogue -> /formations/catalogue
app.get('/catalogue', (req, res) => {
    console.log('📚 Route /catalogue (redirect vers /formations/catalogue)');
    res.redirect('/formations/catalogue');
});

// Route principale du catalogue
app.get('/formations/catalogue', (req, res) => {
    console.log('📚 Route /formations/catalogue appelée');
    
    try {
        const {
            niveau,
            domaine,
            search,
            page = 1,
            limit = 9
        } = req.query;

        // Filtrage des formations
        let formationsFiltrees = formations;

        if (niveau) {
            formationsFiltrees = formationsFiltrees.filter(f => 
                f.niveau.toLowerCase().replace('é', 'e') === niveau
            );
        }

        if (domaine) {
            formationsFiltrees = formationsFiltrees.filter(f => f.domaine === domaine);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            formationsFiltrees = formationsFiltrees.filter(f => 
                f.titre.toLowerCase().includes(searchLower) ||
                f.description.toLowerCase().includes(searchLower)
            );
        }

        // Vérifier si le template EJS existe
        const templatePath = path.join(__dirname, 'app', 'views', 'formations', 'catalogue.ejs');
        if (fs.existsSync(templatePath)) {
            res.render('formations/catalogue', {
                title: 'Catalogue des formations - FormaPro+',
                user: req.session.user || null,
                formations: formationsFiltrees,
                domaines: domaines,
                totalFormations: formationsFiltrees.length,
                totalModules: 36,
                totalBlocs: 10,
                filters: {
                    niveau: niveau || '',
                    domaine: domaine || '',
                    search: search || ''
                },
                niveaux: ['Débutant', 'Intermédiaire', 'Avancé', 'Expert']
            });
        } else {
            // Fallback HTML si le template EJS n'existe pas
            res.send(`
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Catalogue des formations - FormaPro+</title>
                    <style>
                        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 2rem; }
                        .formation-card { border: 1px solid #ddd; padding: 1.5rem; margin-bottom: 1rem; border-radius: 10px; }
                        .formation-title { color: #d4a5a5; font-size: 1.5rem; margin-bottom: 0.5rem; }
                        .formation-meta { color: #666; margin-bottom: 1rem; }
                        .btn { background: #a5c9d4; color: white; padding: 0.5rem 1rem; border: none; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <h1>Catalogue des formations FormaPro+</h1>
                    <p>📂 Template EJS manquant : ${templatePath}</p>
                    <p>Formations disponibles :</p>
                    ${formationsFiltrees.map(f => `
                        <div class="formation-card">
                            <h3 class="formation-title">${f.icon} ${f.titre}</h3>
                            <div class="formation-meta">${f.niveau} • ${f.modules_count} modules • ${f.duree}</div>
                            <p>${f.description}</p>
                            <button class="btn">Prix: ${f.prix === 0 ? 'Gratuit' : f.prix + '€'}</button>
                        </div>
                    `).join('')}
                    <p><a href="/dashboard">Retour au dashboard</a></p>
                </body>
                </html>
            `);
        }

    } catch (error) {
        console.error('❌ Erreur dans /formations/catalogue:', error);
        res.status(500).send('Erreur serveur');
    }
});

// Route pour une formation spécifique
app.get('/formations/:id', (req, res) => {
    console.log(`📖 Route formation ID: ${req.params.id}`);
    const formation = formations.find(f => f.id === parseInt(req.params.id));
    
    if (!formation) {
        return res.status(404).send('Formation non trouvée');
    }
    
    res.json(formation);
});

// ===========================
// MIDDLEWARE 404
// ===========================
app.use((req, res) => {
    console.log(`❌ 404 - Route non trouvée: ${req.path}`);
    
    // Essayer de servir un fichier HTML correspondant
    const htmlPath = path.join(__dirname, req.path + '.html');
    
    if (fs.existsSync(htmlPath)) {
        console.log(`📄 Fichier HTML trouvé: ${htmlPath}`);
        return res.sendFile(htmlPath);
    }
    
    res.status(404).send(`
        <h1>404 - Page non trouvée</h1>
        <p>La page ${req.path} n'existe pas.</p>
        <p><a href="/">Retour à l'accueil</a></p>
        <p><a href="/formations/catalogue">Voir le catalogue</a></p>
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
    console.log(`📚 Catalogue : http://localhost:${PORT}/formations/catalogue`);
});