import * as entrepriseModel from '../models/entrepriseModel.js';

// Page d'accueil
export const getAccueil = (req, res) => {
    const data = {
        title: 'FormaPro+ | Formation professionnelle',
        hero: entrepriseModel.getHeroData(),
        services: entrepriseModel.getServices(),
        formations: entrepriseModel.getFormationsPopulaires(),
        temoignages: entrepriseModel.getTemoignagesAccueil(),
        stats: entrepriseModel.getStatistiques()
    };
    res.render('entreprise/accueil', data);
};

// Page à propos
export const getAPropos = (req, res) => {
    const data = {
        title: 'À propos | FormaPro+',
        entreprise: entrepriseModel.getInfoEntreprise(),
        equipe: entrepriseModel.getEquipe(),
        valeurs: entrepriseModel.getValeurs(),
        histoire: entrepriseModel.getHistoire()
    };
    res.render('entreprise/a-propos', data);
};

// Page services
export const getServices = (req, res) => {
    const data = {
        title: 'Nos services | FormaPro+',
        services: entrepriseModel.getServices(),
        avantages: entrepriseModel.getAvantages(),
        processus: entrepriseModel.getProcessusFormation()
    };
    res.render('entreprise/services', data);
};

// Page formations (catalogue)
export const getFormations = (req, res) => {
    const filters = {
        category: req.query.category || 'all',
        level: req.query.level || 'all',
        duration: req.query.duration || 'all'
    };
    
    const data = {
        title: 'Catalogue formations | FormaPro+',
        formations: entrepriseModel.getFormations(filters),
        categories: entrepriseModel.getCategories(),
        filters: filters
    };
    res.render('entreprise/formations', data);
};

// Détails d'une formation
export const getFormationDetails = (req, res) => {
    const formationId = req.params.id;
    const formation = entrepriseModel.getFormationById(formationId);
    
    if (!formation) {
        return res.status(404).render('error', {
            title: 'Formation non trouvée',
            message: 'Cette formation n\'existe pas'
        });
    }

    const data = {
        title: `${formation.title} | FormaPro+`,
        formation: formation,
        formationsLiees: entrepriseModel.getFormationsLiees(formationId),
        temoignages: entrepriseModel.getTemoignagesFormation(formationId)
    };
    res.render('entreprise/formation-details', data);
};

// Page contact
export const getContact = (req, res) => {
    const data = {
        title: 'Contact | FormaPro+',
        contact: entrepriseModel.getInfoContact(),
        agences: entrepriseModel.getAgences()
    };
    res.render('entreprise/contact', data);
};

// Traitement du formulaire de contact
export const postContact = async (req, res) => {
    try {
        const contactData = {
            nom: req.body.nom,
            email: req.body.email,
            telephone: req.body.telephone,
            sujet: req.body.sujet,
            message: req.body.message,
            date: new Date()
        };

        await entrepriseModel.saveContactMessage(contactData);
        
        res.render('entreprise/contact-success', {
            title: 'Message envoyé | FormaPro+',
            nom: contactData.nom
        });
    } catch (error) {
        console.error('Erreur envoi contact:', error);
        res.render('entreprise/contact', {
            title: 'Contact | FormaPro+',
            error: 'Erreur lors de l\'envoi du message. Veuillez réessayer.',
            contact: entrepriseModel.getInfoContact(),
            agences: entrepriseModel.getAgences()
        });
    }
};

// Page tarifs
export const getTarifs = (req, res) => {
    const data = {
        title: 'Tarifs | FormaPro+',
        forfaits: entrepriseModel.getForfaits(),
        optionsSupp: entrepriseModel.getOptionsSupplementaires()
    };
    res.render('entreprise/tarifs', data);
};

// Page témoignages
export const getTemoignages = (req, res) => {
    const data = {
        title: 'Témoignages | FormaPro+',
        temoignages: entrepriseModel.getAllTemoignages(),
        stats: entrepriseModel.getStatsTemoignages()
    };
    res.render('entreprise/temoignages', data);
};