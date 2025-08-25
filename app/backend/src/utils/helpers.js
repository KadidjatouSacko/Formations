// app/backend/src/utils/helpers.js
import moment from 'moment';

moment.locale('fr');

// Formatage des dates
export const formatDate = (date) => {
    return moment(date).format('DD/MM/YYYY');
};

export const formatDateTime = (date) => {
    return moment(date).format('DD/MM/YYYY HH:mm');
};

export const timeAgo = (date) => {
    return moment(date).fromNow();
};

// Calcul de la progression
export const calculateProgress = (completedModules, totalModules) => {
    if (totalModules === 0) return 0;
    return Math.round((completedModules / totalModules) * 100);
};

// Génération d'ID unique
export const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
};

// Données simulées
export const simulatedData = {
    users: [
        {
            id: 1,
            nom: 'Martin',
            prenom: 'Sophie',
            email: 'sophie.martin@email.com',
            password: '$2a$10$example',
            role: 'etudiant',
            avatar: 'SM',
            dateInscription: new Date('2024-06-15'),
            formations: [
                { id: 1, progression: 75, statut: 'en_cours', dateDebut: new Date('2024-06-20') },
                { id: 2, progression: 45, statut: 'en_cours', dateDebut: new Date('2024-07-01') },
                { id: 3, progression: 100, statut: 'termine', score: 96, certificat: true }
            ]
        }
    ],
    formations: [
        {
            id: 1,
            titre: 'Communication & Relationnel',
            description: 'Maîtrisez les techniques de communication professionnelle',
            duree: '4h30',
            niveau: 'Débutant',
            prix: 0,
            modules: [
                { id: 1, titre: 'Introduction à la communication', duree: '15 min', completeDuration: 15 },
                { id: 2, titre: 'Bases de la communication bienveillante', duree: '20 min', completeDuration: 20 },
                { id: 3, titre: 'Gestion des émotions', duree: '25 min', completeDuration: 25 },
                { id: 4, titre: 'Communication avec les familles et l\'équipe', duree: '18 min', completeDuration: 18, videoUrl: '/videos/module-4.mp4' },
                { id: 5, titre: 'Respect de la dignité et autonomie', duree: '22 min', completeDuration: 22 }
            ]
        },
        {
            id: 2,
            titre: 'Premiers Secours',
            description: 'Formation aux gestes de premiers secours',
            duree: '6h00',
            niveau: 'Intermédiaire',
            prix: 49,
            modules: [
                { id: 1, titre: 'Module 1', duree: '45 min' },
                { id: 2, titre: 'Module 2', duree: '50 min' }
            ]
        }
    ],
    activites: [
        {
            userId: 1,
            type: 'module_complete',
            titre: 'Module terminé',
            description: 'Gestion des émotions',
            formationId: 1,
            moduleId: 3,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
    ]
};