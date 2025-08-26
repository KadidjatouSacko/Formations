import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Données de formations (simulées - remplacer par BDD)
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
        description: 'Hygiène alimentaire, repas équilibrés adaptés, gestion des textures pour éviter les fausses routes.',
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
        description: 'Accompagnement des troubles cognitifs, Alzheimer, maladies chroniques, perte de mobilité.',
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
    },
    {
        id: 7,
        titre: 'Bonnes Pratiques & Déontologie',
        description: 'Limites professionnelles, confidentialité, bonnes pratiques quotidiennes.',
        niveau: 'Intermédiaire',
        modules_count: 3,
        duree: '3h',
        prix: 45,
        icon: '⚖️',
        badge: 'Professionnel',
        competences: ['Limites pro', 'Confidentialité', 'Bonnes pratiques', 'Situations délicates'],
        domaine: 'communication',
        populaire: false,
        certifiante: false,
        nouveau: false
    },
    {
        id: 8,
        titre: 'Professionnalisation & Bien-être',
        description: 'Gestion du stress, prévention de l\'épuisement, organisation du temps.',
        niveau: 'Avancé',
        modules_count: 3,
        duree: '3h',
        prix: 39,
        icon: '💪',
        badge: 'Bien-être',
        competences: ['Gestion stress', 'Anti-épuisement', 'Organisation temps', 'Formation continue'],
        domaine: 'communication',
        populaire: false,
        certifiante: false,
        nouveau: true
    },
    {
        id: 9,
        titre: 'Outils Numériques & Communication',
        description: 'Cahiers de liaison numériques, applications professionnelles, outils vidéo.',
        niveau: 'Débutant',
        modules_count: 3,
        duree: '2h',
        prix: 35,
        icon: '📱',
        badge: 'Digital',
        competences: ['Cahiers numériques', 'Apps professionnelles', 'Outils vidéo', 'Lien famille'],
        domaine: 'communication',
        populaire: false,
        certifiante: false,
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

// Route du catalogue des formations
router.get('/catalogue', async (req, res) => {
    console.log('📚 Route /formations/catalogue appelée');
    
    try {
        const {
            niveau,
            domaine,
            prix_min,
            prix_max,
            search,
            page = 1,
            limit = 9,
            sort = 'created_at',
            order = 'desc'
        } = req.query;

        // Filtrage des formations (simulation)
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

    } catch (error) {
        console.error('❌ Erreur dans /formations/catalogue:', error);
        res.status(500).send('Erreur serveur');
    }
});

// Route pour une formation spécifique
router.get('/:id', (req, res) => {
    console.log(`📖 Route formation ID: ${req.params.id}`);
    const formation = formations.find(f => f.id === parseInt(req.params.id));
    
    if (!formation) {
        return res.status(404).send('Formation non trouvée');
    }
    
    res.json(formation);
});

export default router;