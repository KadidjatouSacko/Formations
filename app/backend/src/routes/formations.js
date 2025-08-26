// app/backend/src/routes/formations.js (MISE À JOUR avec catalogue)
import express from 'express';
import { simulatedData, formatDate } from '../utils/helpers.js';

const router = express.Router();

const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
};

// Catalogue des formations (ACCESSIBLE SANS CONNEXION)
router.get('/', (req, res) => {
    res.render('formations/catalogue', {
        title: 'Catalogue des formations - FormaPro+',
        formations: simulatedData.formations
    });
});

router.get('/catalogue', async (req, res) => {
    try {
        // Récupération des paramètres de requête pour les filtres
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

        // Construction des filtres dynamiques
        const filters = {};
        
        if (niveau) {
            filters.niveau = niveau;
        }
        
        if (domaine) {
            filters.domaine = domaine;
        }
        
        if (prix_min || prix_max) {
            filters.prix = {};
            if (prix_min) filters.prix.$gte = parseInt(prix_min);
            if (prix_max) filters.prix.$lte = parseInt(prix_max);
        }
        
        if (search) {
            filters.$or = [
                { titre: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { competences: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Récupération des formations avec pagination
        // Exemple avec Mongoose
        /*
        const formations = await Formation.find(filters)
            .populate('domaine_id', 'nom slug')
            .sort({ [sort]: order === 'desc' ? -1 : 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        const totalFormations = await Formation.countDocuments(filters);
        */

        // Exemple avec une requête SQL brute ou ORM
        /*
        const formations = await db.query(`
            SELECT f.*, d.nom as domaine_nom, d.slug as domaine_slug 
            FROM formations f 
            LEFT JOIN domaines d ON f.domaine_id = d.id 
            WHERE ${buildWhereClause(filters)}
            ORDER BY ${sort} ${order.toUpperCase()}
            LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `);
        */

        // Simulation de récupération depuis BDD (remplacez par votre logique)
        const formations = await getFormationsFromDB(filters, { page, limit, sort, order });
        const totalFormations = await getFormationsCount(filters);
        
        // Récupération des domaines pour les filtres
        const domaines = await getDomainesFromDB();
        
        // Calcul des métadonnées
        const totalPages = Math.ceil(totalFormations / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        
        // Statistiques générales
        const stats = await getStatsFromDB();

        res.render('formations/catalogue', {
            title: 'Catalogue des formations - FormaPro+',
            user: req.session.user || null,
            formations: formations,
            domaines: domaines,
            totalFormations: totalFormations,
            totalModules: stats.totalModules,
            totalBlocs: stats.totalBlocs,
            pagination: {
                currentPage: parseInt(page),
                totalPages: totalPages,
                hasNextPage: hasNextPage,
                hasPrevPage: hasPrevPage,
                limit: parseInt(limit)
            },
            filters: {
                niveau: niveau || '',
                domaine: domaine || '',
                prix_min: prix_min || '',
                prix_max: prix_max || '',
                search: search || ''
            },
            sort: {
                field: sort,
                order: order
            },
            niveaux: ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'],
            success: req.flash('success'),
            error: req.flash('error')
        });

    } catch (error) {
        console.error('Erreur lors du chargement du catalogue:', error);
        req.flash('error', 'Erreur lors du chargement des formations');
        res.redirect('/');
    }
});

// Lecteur de formation - Module spécifique (NÉCESSITE CONNEXION)
router.get('/:id/module/:moduleId', requireAuth, (req, res) => {
    const formationId = parseInt(req.params.id);
    const moduleId = parseInt(req.params.moduleId);
    const user = req.session.user;
    
    // Récupérer la formation
    const formation = simulatedData.formations.find(f => f.id === formationId);
    if (!formation) {
        return res.status(404).render('error', {
            title: 'Formation non trouvée',
            error: {
                status: 404,
                message: 'Cette formation n\'existe pas'
            }
        });
    }
    
    // Récupérer le module
    const module = formation.modules.find(m => m.id === moduleId);
    if (!module) {
        return res.status(404).render('error', {
            title: 'Module non trouvé',
            error: {
                status: 404,
                message: 'Ce module n\'existe pas'
            }
        });
    }
    
    // Récupérer les données utilisateur pour cette formation
    const userData = simulatedData.users.find(u => u.id === user.id);
    const userFormation = userData.formations.find(uf => uf.id === formationId);
    
    // Calculer la progression
    const modulesCompletes = Math.floor((userFormation?.progression || 0) / 100 * formation.modules.length);
    const progression = {
        pourcentage: userFormation?.progression || 0,
        modulesCompletes: modulesCompletes,
        tempsPassé: '2h15',
        scoreMoyen: 94
    };
    
    // Enrichir les données du module
    const moduleData = {
        ...module,
        numero: moduleId,
        description: module.description || `Apprenez à maîtriser ${module.titre.toLowerCase()} dans votre pratique professionnelle.`,
        contenu: {
            video: {
                url: module.videoUrl || `/videos/module-${moduleId}.mp4`,
                duree: module.completeDuration ? `${module.completeDuration}:00` : '18:24'
            },
            ressources: module.ressources || [
                { nom: 'Guide de communication famille', type: 'PDF', taille: '2.3 Mo' },
                { nom: 'Modèles de transmissions', type: 'PDF', taille: '1.8 Mo' },
                { nom: 'Exercices pratiques', type: 'PDF', taille: '1.2 Mo' }
            ],
            quiz: {
                questions: 15,
                duree: 10,
                scoreRequis: 80
            }
        }
    };
    
    // Préparer les données de la formation
    const formationData = {
        ...formation,
        totalModules: formation.modules.length,
        quizFinal: true
    };
    
    res.render('lecteur-formation', {
        title: `${module.titre} - ${formation.titre} | FormaPro+`,
        user: user,
        formation: formationData,
        module: moduleData,
        progression: progression,
        formatDate: formatDate
    });
});

// Route de révision d'une formation
router.get('/:id/review', requireAuth, (req, res) => {
    const formationId = parseInt(req.params.id);
    res.redirect(`/formations/${formationId}/module/1?mode=review`);
});

export default router;