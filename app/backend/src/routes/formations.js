// app/backend/src/routes/formations.js
import express from 'express';
import { simulatedData, formatDate } from '../utils/helpers.js';

const router = express.Router();

const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
};

// Catalogue des formations
router.get('/', (req, res) => {
    res.render('formations/catalogue', {
        title: 'Catalogue des formations - FormaPro+',
        formations: simulatedData.formations
    });
});

// Lecteur de formation - Module spécifique
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

export default router;
