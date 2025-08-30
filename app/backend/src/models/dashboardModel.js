// ==================== MODELS/DASHBOARDMODEL.JS ====================

// Informations utilisateur
export const getUserInfo = async (userId) => {
    // Simulation récupération BDD
    return {
        id: userId,
        nom: "Sophie",
        prenom: "Martin",
        email: "sophie.martin@email.com",
        avatar: "SM",
        role: "Aide à domicile",
        inscriptionDate: "2024-06-15",
        derniereConnexion: new Date()
    };
};

// Formations en cours
export const getFormationsEnCours = async (userId) => [
    {
        id: "communication-relationnel",
        title: "Communication & Relationnel",
        progression: 75,
        tempsEcoule: "2h30",
        tempsRestant: "1h30",
        status: "active",
        prochainModule: "Communication avec les familles",
        icon: "💬"
    },
    {
        id: "premiers-secours", 
        title: "Premiers Secours",
        progression: 45,
        tempsEcoule: "1h15",
        tempsRestant: "2h45",
        status: "pause",
        prochainModule: "Situations d'urgence",
        icon: "🚑"
    }
];

// Progression globale
export const getProgressionGlobale = async (userId) => ({
    pourcentage: 73,
    modulesTermines: 8,
    modulesTotal: 11,
    tempsTotal: "15h32min",
    scoreeMoyen: 94,
    certificatsObtenus: 2
});

// Activités récentes
export const getActivitesRecentes = async (userId) => [
    {
        type: "module_completed",
        title: "Module terminé",
        description: "Gestion des émotions - Communication & Relationnel",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // Il y a 2h
        icon: "✅"
    },
    {
        type: "quiz_passed",
        title: "Quiz réussi",
        description: "Score: 18/20 - Protocoles d'hygiène",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hier
        icon: "📝"
    },
    {
        type: "certificate_earned",
        title: "Certificat obtenu",
        description: "Formation Hygiène & Sécurité validée",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Il y a 3 jours
        icon: "🏆"
    }
];

// Mise à jour progression
export const updateUserProgress = async (userId, courseId, moduleId, progress) => {
    // Simulation mise à jour BDD
    console.log(`📊 Mise à jour progression: User ${userId}, Course ${courseId}, Module ${moduleId}, Progress ${progress}%`);
    
    return {
        success: true,
        newProgress: progress,
        timestamp: new Date()
    };
};

// ==================== MODELS/FORMATIONMODEL.JS ====================

// Récupération d'un cours
export const getCourseById = async (courseId) => {
    const courses = {
        "communication-relationnel": {
            id: "communication-relationnel",
            title: "Communication & Relationnel",
            description: "Formation essentielle pour les professionnels",
            totalModules: 5,
            duration: "6h",
            modules: [
                { id: 1, title: "Introduction à la communication", duration: "15min", status: "completed" },
                { id: 2, title: "Bases de la communication bienveillante", duration: "20min", status: "completed" },
                { id: 3, title: "Gestion des émotions", duration: "25min", status: "completed" },
                { id: 4, title: "Communication avec les familles", duration: "18min", status: "active" },
                { id: 5, title: "Respect de la dignité et autonomie", duration: "22min", status: "locked" }
            ]
        }
    };
    
    return courses[courseId] || null;
};

// Contenu d'un module
export const getModuleContent = async (courseId, moduleId) => {
    const moduleContents = {
        "communication-relationnel": {
            4: {
                id: 4,
                title: "Communication avec les familles et l'équipe",
                subtitle: "Module 4 sur 5",
                description: "Apprenez à communiquer efficacement avec les familles des personnes accompagnées et à collaborer harmonieusement avec votre équipe professionnelle.",
                videoUrl: "/videos/module-4-communication.mp4",
                videoDuration: "18:24",
                content: {
                    sections: [
                        {
                            title: "🏠 Communication avec les familles",
                            content: "La famille joue un rôle central dans la vie de la personne accompagnée. Une communication respectueuse et transparente contribue à instaurer un climat de confiance essentiel au bien-être de tous."
                        },
                        {
                            title: "👥 Travail en équipe",
                            content: "Le travail en équipe est fondamental dans l'accompagnement. Il permet de garantir la continuité des soins, partager les expériences et maintenir une approche cohérente."
                        }
                    ]
                },
                resources: [
                    { title: "Guide de communication famille", type: "PDF", size: "2.3 Mo", pages: "12 pages" },
                    { title: "Modèles de transmissions", type: "PDF", size: "1.8 Mo", pages: "8 pages" },
                    { title: "Exercices pratiques", type: "PDF", size: "1.2 Mo", pages: "6 pages" }
                ],
                quiz: {
                    questions: 15,
                    duration: 10,
                    passScore: 80
                }
            }
        }
    };
    
    return moduleContents[courseId]?.[moduleId] || null;
};

// Progression utilisateur pour un cours
export const getUserCourseProgress = async (userId, courseId) => ({
    userId: userId,
    courseId: courseId,
    currentModule: 4,
    completedModules: [1, 2, 3],
    totalProgress: 75,
    timeSpent: "2h30min",
    lastActivity: new Date()
});

// Préférences utilisateur
export const getUserPreferences = async (userId) => ({
    theme: 'light',
    notifications: {
        email: true,
        sms: false,
        push: true
    },
    langue: 'fr',
    timezone: 'Europe/Paris'
});

// Progression détaillée
export const getProgressionDetaillee = async (userId) => ({
    formations: [
        {
            id: "communication-relationnel",
            title: "Communication & Relationnel",
            progression: 75,
            modules: [
                { id: 1, title: "Introduction", progression: 100, temps: "15min", score: 95 },
                { id: 2, title: "Communication bienveillante", progression: 100, temps: "20min", score: 88 },
                { id: 3, title: "Gestion des émotions", progression: 100, temps: "25min", score: 92 },
                { id: 4, title: "Communication familles", progression: 60, temps: "11min", score: null },
                { id: 5, title: "Respect et dignité", progression: 0, temps: "0min", score: null }
            ]
        }
    ],
    graphiques: {
        progressionHebdomadaire: [
            { semaine: 'S1', progression: 20 },
            { semaine: 'S2', progression: 45 },
            { semaine: 'S3', progression: 60 },
            { semaine: 'S4', progression: 75 }
        ],
        tempsParJour: [
            { jour: 'Lun', temps: 45 },
            { jour: 'Mar', temps: 30 },
            { jour: 'Mer', temps: 60 },
            { jour: 'Jeu', temps: 20 },
            { jour: 'Ven', temps: 40 },
            { jour: 'Sam', temps: 15 },
            { jour: 'Dim', temps: 10 }
        ]
    }
});

// Certificats utilisateur
export const getCertificats = async (userId) => [
    {
        id: "CERT_001",
        formationTitle: "Hygiène & Sécurité",
        dateObtention: "2024-07-20",
        score: 96,
        validite: "2026-07-20",
        fichierPDF: "/certificates/hygiene-securite-sophie-martin.pdf",
        status: "valide"
    },
    {
        id: "CERT_002", 
        formationTitle: "Communication Niveau 1",
        dateObtention: "2024-06-15",
        score: 89,
        validite: "2026-06-15", 
        fichierPDF: "/certificates/communication-1-sophie-martin.pdf",
        status: "valide"
    }
];

// Statistiques complètes
export const getStatistiquesCompletes = async (userId) => ({
    global: {
        tempsTotal: "15h32min",
        connexions: 34,
        streakActuel: 7, // jours consécutifs
        meilleurStreak: 12
    },
    performance: {
        scoreMoyenQuiz: 94,
        tauxCompletion: 73,
        rapiditeProgression: "Excellent"
    },
    activite: {
        derniereConnexion: new Date(),
        tempsMoyenSession: "28min",
        jourPreference: "Mercredi",
        heurePreference: "14h-16h"
    }
});
