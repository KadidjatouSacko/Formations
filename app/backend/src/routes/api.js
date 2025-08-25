// app/backend/src/routes/api.js
import express from 'express';
import { simulatedData, generateId } from '../utils/helpers.js';

const router = express.Router();

// Middleware d'authentification pour l'API
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Non authentifié' });
    }
    next();
};

// Rafraîchissement des données du dashboard
router.get('/dashboard/refresh', requireAuth, (req, res) => {
    const user = req.session.user;
    const userData = simulatedData.users.find(u => u.id === user.id);
    
    const stats = {
        formationsEnCours: userData.formations.filter(f => f.statut === 'en_cours').length,
        formationsTerminees: userData.formations.filter(f => f.statut === 'termine').length,
        tempsTotal: `${Math.floor(Math.random() * 20) + 15}h${Math.floor(Math.random() * 60)}min`,
        scoreMoyen: Math.floor(Math.random() * 20) + 80,
        progressionGlobale: Math.floor(Math.random() * 30) + 70
    };
    
    res.json({ success: true, stats });
});

// Sauvegarde de la progression
router.post('/progress/save', requireAuth, (req, res) => {
    const { moduleId, formationId, progress, videoWatched, quizCompleted } = req.body;
    const userId = req.session.user.id;
    
    console.log(`Progression sauvegardée pour l'utilisateur ${userId}:`, {
        moduleId, formationId, progress, videoWatched, quizCompleted
    });
    
    // Mettre à jour les données simulées
    const userData = simulatedData.users.find(u => u.id === userId);
    if (userData) {
        const userFormation = userData.formations.find(uf => uf.id === formationId);
        if (userFormation && progress > userFormation.progression) {
            userFormation.progression = Math.min(progress, 100);
        }
    }
    
    res.json({ success: true, message: 'Progression sauvegardée' });
});

// Téléchargement de certificat
router.get('/certificates/download', requireAuth, (req, res) => {
    const { formation } = req.query;
    const userId = req.session.user.id;
    
    console.log(`Téléchargement certificat: ${formation} pour utilisateur ${userId}`);
    
    res.json({ 
        success: true, 
        message: 'Certificat généré',
        downloadUrl: `/certificates/certificat-${formation?.toLowerCase().replace(/\s+/g, '-')}.pdf`
    });
});

// Téléchargement de ressources
router.get('/resources/download', requireAuth, (req, res) => {
    const { module, resource } = req.query;
    
    const resourceNames = [
        'guide-communication-famille',
        'modeles-transmissions', 
        'exercices-pratiques'
    ];
    
    const filename = `${resourceNames[parseInt(resource)] || 'document'}.pdf`;
    
    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
    });
    
    // Simuler un contenu PDF basique
    const pdfContent = Buffer.from('%PDF-1.4\nSimulated PDF content for FormaPro+');
    res.send(pdfContent);
});

export default router;