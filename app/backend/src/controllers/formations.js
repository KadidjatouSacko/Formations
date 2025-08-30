import express from 'express';
import * as formationController from '../controllers/formationController.js';

const router = express.Router();

// Routes des formations
router.get('/lecteur/:courseId', formationController.getLecteur);
router.get('/lecteur/:courseId/module/:moduleId', formationController.getModule);
router.post('/lecteur/progress', formationController.updateProgress);
router.get('/quiz/:moduleId', formationController.getQuiz);
router.post('/quiz/:moduleId/submit', formationController.submitQuiz);

export default router;