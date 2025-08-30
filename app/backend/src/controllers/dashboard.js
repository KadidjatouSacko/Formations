// ==================== ROUTES/DASHBOARD.JS ====================
import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';

const router = express.Router();

// Routes du dashboard étudiant
router.get('/etudiant', dashboardController.getDashboardEtudiant);
router.get('/etudiant/profil', dashboardController.getProfil);
router.get('/etudiant/progression', dashboardController.getProgression);
router.get('/etudiant/certificats', dashboardController.getCertificats);
router.get('/etudiant/statistiques', dashboardController.getStatistiques);
router.post('/etudiant/update-progress', dashboardController.updateProgress);

export default router;