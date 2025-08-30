// ==================== MODELS/ENTREPRISEMODEL.JS ====================

// Données de l'hero section
export const getHeroData = () => ({
    title: "Développez vos compétences professionnelles",
    subtitle: "FormaPro+ vous accompagne dans votre évolution professionnelle avec des formations certifiantes de qualité",
    ctaText: "Découvrir nos formations",
    ctaLink: "/entreprise/formations",
    image: "/images/hero-formation.jpg"
});

// Services de l'entreprise
export const getServices = () => [
    {
        id: 1,
        icon: "🎓",
        title: "Formations certifiantes",
        description: "Des formations reconnues par les professionnels du secteur",
        features: ["Certification officielle", "Suivi personnalisé", "Support 24/7"]
    },
    {
        id: 2,
        icon: "💼",
        title: "Formation en entreprise",
        description: "Nous nous déplaçons dans vos locaux pour former vos équipes",
        features: ["Sur-mesure", "Flexibilité horaire", "Groupe jusqu'à 20 personnes"]
    },
    {
        id: 3,
        icon: "🌐",
        title: "E-learning interactif",
        description: "Plateforme moderne avec vidéos, quiz et suivi en temps réel",
        features: ["Accessible 24/7", "Mobile-friendly", "Progression sauvegardée"]
    }
];

// Formations populaires
export const getFormationsPopulaires = () => [
    {
        id: "communication-relationnel",
        title: "Communication & Relationnel",
        category: "Compétences transversales",
        duration: "6h",
        level: "Intermédiaire",
        price: 299,
        rating: 4.8,
        studentsCount: 1247,
        image: "/images/communication.jpg",
        description: "Maîtrisez la communication professionnelle et le relationnel"
    },
    {
        id: "hygiene-securite",
        title: "Hygiène & Sécurité",
        category: "Sécurité",
        duration: "4h",
        level: "Débutant",
        price: 199,
        rating: 4.9,
        studentsCount: 2156,
        image: "/images/hygiene.jpg",
        description: "Formation obligatoire aux règles d'hygiène et de sécurité"
    },
    {
        id: "premiers-secours",
        title: "Premiers Secours",
        category: "Sécurité",
        duration: "8h",
        level: "Tous niveaux",
        price: 399,
        rating: 4.7,
        studentsCount: 987,
        image: "/images/secours.jpg",
        description: "Apprenez les gestes qui sauvent en situation d'urgence"
    }
];

// Informations de contact
export const getInfoContact = () => ({
    telephone: "06 50 84 81 75",
    email: "contact@formapro-plus.org",
    adresse: {
        rue: "123 Avenue de la Formation",
        ville: "Paris",
        codePostal: "75001",
        pays: "France"
    },
    horaires: {
        semaine: "Lundi - Vendredi : 9h00 - 18h00",
        weekend: "Samedi : 9h00 - 12h00",
        ferme: "Dimanche : Fermé"
    }
});

// Sauvegarde message de contact
export const saveContactMessage = async (contactData) => {
    // Simulation de sauvegarde en base de données
    console.log('💾 Sauvegarde message contact:', contactData);
    
    // Simulation d'envoi d'email
    await simulateEmailSend(contactData);
    
    return {
        success: true,
        messageId: `MSG_${Date.now()}`,
        timestamp: new Date()
    };
};

// Simulation envoi email
const simulateEmailSend = async (contactData) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`📧 Email envoyé à l'équipe pour: ${contactData.email}`);
            resolve(true);
        }, 1000);
    });
};

// Statistiques de l'entreprise
export const getStatistiques = () => ({
    etudiants: 15420,
    formations: 127,
    entreprises: 850,
    satisfact
});

// Récupération des catégories
export const getCategories = () => [
    { id: 'social', name: 'Secteur social', icon: '🤝' },
    { id: 'securite', name: 'Sécurité', icon: '🛡️' },
    { id: 'management', name: 'Management', icon: '👔' },
    { id: 'digital', name: 'Digital', icon: '💻' },
    { id: 'sante', name: 'Santé', icon: '🏥' },
    { id: 'communication', name: 'Communication', icon: '💬' }
];

// Toutes les formations avec filtres
export const getFormations = (filters = {}) => {
    const allFormations = [
        {
            id: "communication-relationnel",
            title: "Communication & Relationnel",
            category: "communication",
            duration: "6h",
            level: "intermediaire",
            price: 299,
            rating: 4.8,
            studentsCount: 1247,
            image: "/images/communication.jpg",
            description: "Maîtrisez la communication professionnelle et le relationnel",
            modules: [
                { id: 1, title: "Introduction à la communication", description: "Les bases de la communication efficace", duration: "15min", videosCount: 2, exercicesCount: 3 },
                { id: 2, title: "Communication bienveillante", description: "Techniques de communication positive", duration: "20min", videosCount: 3, exercicesCount: 4 },
                { id: 3, title: "Gestion des émotions", description: "Maîtriser ses émotions en situation difficile", duration: "25min", videosCount: 2, exercicesCount: 5 },
                { id: 4, title: "Communication avec les familles", description: "Relation avec l'entourage des bénéficiaires", duration: "18min", videosCount: 1, exercicesCount: 2 },
                { id: 5, title: "Respect et dignité", description: "Préserver la dignité dans l'accompagnement", duration: "22min", videosCount: 2, exercicesCount: 3 }
            ],
            previewVideoUrl: "/videos/preview-communication.mp4"
        },
        {
            id: "hygiene-securite",
            title: "Hygiène & Sécurité",
            category: "securite",
            duration: "4h",
            level: "debutant",
            price: 199,
            rating: 4.9,
            studentsCount: 2156,
            image: "/images/hygiene.jpg",
            description: "Formation obligatoire aux règles d'hygiène et de sécurité",
            modules: [
                { id: 1, title: "Protocoles d'hygiène", description: "Règles de base et bonnes pratiques", duration: "45min", videosCount: 3, exercicesCount: 5 },
                { id: 2, title: "Prévention des risques", description: "Identifier et prévenir les dangers", duration: "50min", videosCount: 2, exercicesCount: 4 },
                { id: 3, title: "Équipements de protection", description: "Utilisation des EPI", duration: "35min", videosCount: 2, exercicesCount: 3 },
                { id: 4, title: "Situations d'urgence", description: "Procédures d'urgence et évacuation", duration: "40min", videosCount: 3, exercicesCount: 6 }
            ],
            previewVideoUrl: "/videos/preview-hygiene.mp4"
        }
    ];
    
    // Application des filtres
    let filteredFormations = allFormations;
    
    if (filters.category && filters.category !== 'all') {
        filteredFormations = filteredFormations.filter(f => f.category === filters.category);
    }
    
    if (filters.level && filters.level !== 'all') {
        filteredFormations = filteredFormations.filter(f => f.level === filters.level);
    }
    
    if (filters.duration && filters.duration !== 'all') {
        filteredFormations = filteredFormations.filter(f => {
            const hours = parseInt(f.duration);
            switch (filters.duration) {
                case 'court': return hours < 5;
                case 'moyen': return hours >= 5 && hours <= 10;
                case 'long': return hours > 10;
                default: return true;
            }
        });
    }
    
    return filteredFormations;
};

// Récupération formation par ID
export const getFormationById = (id) => {
    const formations = getFormations();
    return formations.find(f => f.id === id);
};

// Formations liées
export const getFormationsLiees = (formationId) => {
    const formations = getFormations();
    const currentFormation = formations.find(f => f.id === formationId);
    
    if (!currentFormation) return [];
    
    return formations
        .filter(f => f.id !== formationId && f.category === currentFormation.category)
        .slice(0, 3);
};

// Témoignages pour une formation
export const getTemoignagesFormation = (formationId) => [
    {
        nom: "Marie Dubois",
        initiales: "MD",
        poste: "Aide-soignante",
        texte: "Formation très complète et pratique. Les cas concrets m'ont beaucoup aidée dans mon quotidien professionnel.",
        note: 5,
        date: "2024-07-15"
    },
    {
        nom: "Jean Martin",
        initiales: "JM", 
        poste: "Infirmier coordinateur",
        texte: "Excellente pédagogie et contenu de qualité. Je recommande vivement cette formation à toute mon équipe.",
        note: 5,
        date: "2024-06-28"
    }
];

// Agences
export const getAgences = () => [
    {
        nom: "Agence Paris Centre",
        adresse: "123 Avenue de la Formation, 75001 Paris",
        telephone: "01 42 33 44 55",
        email: "paris@formapro-plus.org",
        coordonnees: "48.8566,2.3522"
    },
    {
        nom: "Agence Lyon",
        adresse: "45 Rue de la République, 69002 Lyon", 
        telephone: "04 78 90 12 34",
        email: "lyon@formapro-plus.org",
        coordonnees: "45.7640,4.8357"
    }
];
