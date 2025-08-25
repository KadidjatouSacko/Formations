// app/backend/src/routes/index.js (MISE À JOUR)
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
    const success = req.query.success === '1';
    
    res.render('contact', {
        title: 'Contact - FormaPro+',
        contactInfo: {
            phone: '06 50 84 81 75',
            email: 'contact@formapro-plus.org',
            address: '123 Rue de la Formation, 75000 Paris'
        },
        success: success
    });
});

// Traitement du formulaire de contact
router.post('/contact', (req, res) => {
    const { nom, email, sujet, message } = req.body;
    
    // Validation basique
    if (!nom || !email || !message) {
        return res.render('contact', {
            title: 'Contact - FormaPro+',
            contactInfo: {
                phone: '06 50 84 81 75',
                email: 'contact@formapro-plus.org',
                address: '123 Rue de la Formation, 75000 Paris'
            },
            error: 'Veuillez remplir tous les champs obligatoires'
        });
    }
    
    // Log du message (en production, envoyer un email)
    console.log('📧 Nouveau message de contact:', { 
        nom, 
        email, 
        sujet, 
        message,
        timestamp: new Date().toISOString()
    });
    
    // Ici vous pourriez ajouter l'envoi d'email avec nodemailer
    // await sendContactEmail({ nom, email, sujet, message });
    
    res.redirect('/contact?success=1');
});

export default router;