// ==================== ROUTES/ENTREPRISE.JS ====================
import express from 'express';
import * as entrepriseController from '../controllers/entrepriseController.js';

const router = express.Router();

// Routes principales de l'entreprise
router.get('/', entrepriseController.getAccueil);
router.get('/accueil', entrepriseController.getAccueil);
router.get('/a-propos', entrepriseController.getAPropos);
router.get('/services', entrepriseController.getServices);
router.get('/formations', entrepriseController.getFormations);
router.get('/formations/:id', entrepriseController.getFormationDetails);
router.get('/contact', entrepriseController.getContact);
router.post('/contact', entrepriseController.postContact);
router.get('/tarifs', entrepriseController.getTarifs);
router.get('/temoignages', entrepriseController.getTemoignages);

export default router;



