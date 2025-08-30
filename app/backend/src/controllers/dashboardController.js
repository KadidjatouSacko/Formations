// ==================== CONTROLLERS/DASHBOARDCONTROLLER.JS ====================
import * as dashboardModel from '../models/dashboardModel.js';

// Dashboard principal étudiant
export const getDashboardEtudiant = async (req, res) => {
    try {
        const userId = req.session?.userId || 'demo-user'; // Simulation session
        
        const data = {
            title: 'Mon Espace | FormaPro+',
            user: await dashboardModel.getUserInfo(userId),
            formations: await dashboardModel.getFormationsEnCours(userId),
            progression: await dashboardModel.getProgressionGlobale(userId),
            activites: await dashboardModel.getActivitesRecentes(userId),
            statistiques: await dashboardModel.getStatistiquesUser(userId)
        };
        res.render('dashboard/etudiant', data);
    } catch (error) {
        console.error('Erreur dashboard:', error);
        res.status(500).render('error', {
            title: 'Erreur',
            message: 'Impossible de charger le dashboard'
        });
    }
};

// Profil utilisateur
export const getProfil = async (req, res) => {
    const userId = req.session?.userId || 'demo-user';
    
    const data = {
        title: 'Mon Profil | FormaPro+',
        user: await dashboardModel.getUserInfo(userId),
        preferences: await dashboardModel.getUserPreferences(userId)
    };
    res.render('dashboard/profil', data);
};

// Progression détaillée
export const getProgression = async (req, res) => {
    const userId = req.session?.userId || 'demo-user';
    
    const data = {
        title: 'Ma Progression | FormaPro+',
        progression: await dashboardModel.getProgressionDetaillee(userId),
        graphiques: await dashboardModel.getGraphiquesProgression(userId)
    };
    res.render('dashboard/progression', data);
};

// Certificats
export const getCertificats = async (req, res) => {
    const userId = req.session?.userId || 'demo-user';
    
    const data = {
        title: 'Mes Certificats | FormaPro+',
        certificats: await dashboardModel.getCertificats(userId)
    };
    res.render('dashboard/certificats', data);
};

// Statistiques
export const getStatistiques = async (req, res) => {
    const userId = req.session?.userId || 'demo-user';
    
    const data = {
        title: 'Statistiques | FormaPro+',
        stats: await dashboardModel.getStatistiquesCompletes(userId)
    };
    res.render('dashboard/statistiques', data);
};

// Mise à jour progression AJAX
export const updateProgress = async (req, res) => {
    try {
        const userId = req.session?.userId || 'demo-user';
        const { courseId, moduleId, progress } = req.body;
        
        const result = await dashboardModel.updateUserProgress(userId, courseId, moduleId, progress);
        
        res.json({
            success: true,
            message: 'Progression mise à jour',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour'
        });
    }
};