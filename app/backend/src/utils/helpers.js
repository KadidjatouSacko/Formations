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

// Données simulées ENRICHIES
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
            description: 'Maîtrisez les techniques de communication professionnelle dans le secteur de l\'aide à domicile et développez des relations harmonieuses avec les bénéficiaires et leurs familles.',
            duree: '4h30',
            niveau: 'Débutant',
            prix: 0,
            modules: [
                { 
                    id: 1, 
                    titre: 'Introduction à la communication', 
                    duree: '15 min', 
                    completeDuration: 15,
                    description: 'Découvrez les bases de la communication professionnelle'
                },
                { 
                    id: 2, 
                    titre: 'Bases de la communication bienveillante', 
                    duree: '20 min', 
                    completeDuration: 20,
                    description: 'Apprenez à communiquer avec bienveillance et empathie'
                },
                { 
                    id: 3, 
                    titre: 'Gestion des émotions', 
                    duree: '25 min', 
                    completeDuration: 25,
                    description: 'Maîtrisez vos émotions et aidez les autres à gérer les leurs'
                },
                { 
                    id: 4, 
                    titre: 'Communication avec les familles et l\'équipe', 
                    duree: '18 min', 
                    completeDuration: 18, 
                    videoUrl: '/videos/module-4.mp4',
                    description: 'Apprenez à communiquer efficacement avec les familles des personnes accompagnées et à collaborer harmonieusement avec votre équipe professionnelle.'
                },
                { 
                    id: 5, 
                    titre: 'Respect de la dignité et autonomie', 
                    duree: '22 min', 
                    completeDuration: 22,
                    description: 'Préservez la dignité et l\'autonomie des personnes accompagnées'
                }
            ],
            objectifs: [
                'Communiquer efficacement avec les bénéficiaires et leurs familles',
                'Gérer les situations difficiles avec professionnalisme',
                'Travailler en équipe harmonieusement',
                'Respecter la dignité et l\'autonomie des personnes'
            ]
        },
        {
            id: 2,
            titre: 'Premiers Secours',
            description: 'Formation aux gestes de premiers secours et situations d\'urgence au domicile',
            duree: '6h00',
            niveau: 'Intermédiaire',
            prix: 49,
            certification: true,
            modules: [
                { id: 1, titre: 'Alerter les secours', duree: '45 min' },
                { id: 2, titre: 'Massage cardiaque', duree: '50 min' },
                { id: 3, titre: 'Position latérale de sécurité', duree: '40 min' },
                { id: 4, titre: 'Utilisation du défibrillateur', duree: '35 min' },
                { id: 5, titre: 'Gestion des hémorragies', duree: '45 min' },
                { id: 6, titre: 'Traitement des brûlures', duree: '30 min' },
                { id: 7, titre: 'Malaises et étouffements', duree: '40 min' },
                { id: 8, titre: 'Situations spécifiques domicile', duree: '35 min' }
            ],
            objectifs: [
                'Maîtriser les gestes qui sauvent',
                'Réagir efficacement en cas d\'urgence',
                'Utiliser un défibrillateur',
                'Obtenir une certification officielle'
            ]
        },
        {
            id: 3,
            titre: 'Hygiène & Sécurité',
            description: 'Règles d\'hygiène et de sécurité au domicile des personnes accompagnées',
            duree: '3h15',
            niveau: 'Débutant',
            prix: 0,
            modules: [
                { id: 1, titre: 'Règles d\'hygiène de base', duree: '35 min' },
                { id: 2, titre: 'Prévention des infections', duree: '40 min' },
                { id: 3, titre: 'Sécurité au domicile', duree: '45 min' },
                { id: 4, titre: 'Manipulation et ergonomie', duree: '35 min' },
                { id: 5, titre: 'Produits et matériels', duree: '30 min' }
            ],
            objectifs: [
                'Appliquer les règles d\'hygiène essentielles',
                'Prévenir les risques d\'infection',
                'Assurer la sécurité au domicile',
                'Préserver sa santé physique'
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
        },
        {
            userId: 1,
            type: 'quiz_reussi',
            titre: 'Quiz réussi',
            description: 'Communication bienveillante - 94%',
            formationId: 1,
            moduleId: 2,
            score: 94,
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
            userId: 1,
            type: 'formation_commencee',
            titre: 'Formation démarrée',
            description: 'Premiers Secours',
            formationId: 2,
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        }
    ]
};

// Fonction pour créer un dossier s'il n'existe pas
export const ensureDirectoryExists = (dirPath) => {
    const fs = require('fs');
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};