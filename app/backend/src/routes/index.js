// app/backend/src/routes/index.js
import express from 'express';
const router = express.Router();

// Page d'accueil
router.get('/', (req, res) => {
    res.render('index', {
        title: 'FormaPro+ - Plateforme de formation professionnelle',
        meta: {
            description: 'Formez-vous aux métiers de l\'accompagnement avec FormaPro+',
            keywords: 'formation, aide à domicile, accompagnement'
        }
    });
});

// Page contact
router.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Contact - FormaPro+',
        contactInfo: {
            phone: '06 50 84 81 75',
            email: 'contact@formapro-plus.org',
            address: '123 Rue de la Formation, 75000 Paris'
        }
    });
});

// Traitement du formulaire de contact
router.post('/contact', (req, res) => {
    const { nom, email, sujet, message } = req.body;
    console.log('Nouveau message de contact:', { nom, email, sujet, message });
    res.redirect('/contact?success=1');
});

export default router;
