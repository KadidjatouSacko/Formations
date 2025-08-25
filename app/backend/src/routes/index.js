import express from 'express';

const router = express.Router();



// Configuration globale
const config = {
  phone: '06 50 84 81 75',
  email: 'contact@formapro-plus.org',
  phoneIcon: '📞',
  emailIcon: '✉️',
  socialLinks: [
    { url: '#', title: 'Facebook', icon: '📘' },
    { url: '#', title: 'Instagram', icon: '📷' },
    { url: '#', title: 'LinkedIn', icon: '💼' }
  ]
};

// Navigation principale
const navLinks = [
  { url: '#formations', text: 'Formations' },
  { url: '#financements', text: 'Financements' },
  { url: '#evenements', text: 'Événements' },
  { url: '#blog', text: 'Blog' },
  { url: '/contact', text: 'Contact' }
];

// Données des formations
const formations = {
  title: 'NOS FORMATIONS',
  intro: 'Découvrez notre catalogue de formations spécialisées pour les professionnels de l\'aide à domicile et des EHPAD. Chaque module combine théorie, pratique et mise en situation réelle.',
  list: [
    {
      id: 1,
      slug: 'communication-relationnel',
      icon: '🗣️',
      badge: 'Essentiel',
      modules: 5,
      level: 'Débutant',
      title: 'Communication & Relationnel',
      description: 'Maîtrisez l\'art de la communication bienveillante, la gestion des émotions et des situations difficiles. Apprenez à communiquer efficacement avec les familles et l\'équipe.',
      features: ['Écoute active', 'Gestion conflits', 'Respect dignité', 'Vidéos pratiques'],
      price: 'Gratuit',
      duration: '2h30',
      level_detail: 'Débutant'
    },
    {
      id: 2,
      slug: 'hygiene-securite-prevention',
      icon: '🛡️',
      badge: 'Avancé',
      modules: 4,
      level: 'Intermédiaire',
      title: 'Hygiène, Sécurité & Prévention',
      description: 'Protocoles d\'hygiène professionnelle, sécurité avec les produits ménagers, prévention des risques domestiques et des infections.',
      features: ['Protocoles hygiène', 'Sécurité produits', 'Prévention chutes', 'Anti-infections'],
      price: '49€',
      duration: '3h15',
      level_detail: 'Intermédiaire'
    },
    {
      id: 3,
      slug: 'ergonomie-gestes-professionnels',
      icon: '🏥',
      badge: 'Expert',
      modules: 3,
      level: 'Avancé',
      title: 'Ergonomie & Gestes Professionnels',
      description: 'Techniques de manutention, prévention des TMS, utilisation du matériel médical et accompagnement sécurisé des transferts.',
      features: ['Bonnes postures', 'Transferts sécurisés', 'Matériel médical', 'Prévention TMS'],
      price: '79€',
      duration: '4h00',
      level_detail: 'Avancé'
    },
    {
      id: 4,
      slug: 'gestion-urgences-premiers-secours',
      icon: '🚨',
      badge: 'Critique',
      modules: 5,
      level: 'Essentiel',
      title: 'Gestion des Urgences & Premiers Secours',
      description: 'Formation complète aux gestes qui sauvent : RCP, défibrillateur, position latérale de sécurité, gestion des blessures et étouffements.',
      features: ['RCP & Défibrillateur', 'Position PLS', 'Gestion blessures', 'Situations critiques'],
      price: '99€',
      duration: '5h30',
      level_detail: 'Essentiel'
    },
    {
      id: 5,
      slug: 'preparation-repas-alimentation',
      icon: '🍽️',
      badge: 'Pratique',
      modules: 4,
      level: 'Intermédiaire',
      title: 'Préparation des Repas & Alimentation',
      description: 'Hygiène alimentaire, repas équilibrés adaptés, gestion des textures pour éviter les fausses routes, techniques d\'hydratation.',
      features: ['Hygiène alimentaire', 'Repas équilibrés', 'Textures adaptées', 'Hydratation'],
      price: '59€',
      duration: '3h45',
      level_detail: 'Intermédiaire'
    },
    {
      id: 6,
      slug: 'pathologies-situations-specifiques',
      icon: '🧠',
      badge: 'Spécialisé',
      modules: 4,
      level: 'Expert',
      title: 'Pathologies & Situations Spécifiques',
      description: 'Accompagnement des troubles cognitifs, Alzheimer, maladies chroniques, perte de mobilité et accompagnement en fin de vie.',
      features: ['Troubles cognitifs', 'Maladies chroniques', 'Perte mobilité', 'Fin de vie'],
      price: '89€',
      duration: '4h20',
      level_detail: 'Expert'
    }
  ]
};

// Données Hero
const hero = {
  title: 'FORMATION COMPLÈTE',
  highlight: 'AIDE À DOMICILE & EHPAD',
  subtitle: 'Communication, sécurité, pratiques professionnelles',
  description: 'Développez vos compétences avec notre formation complète en 10 blocs thématiques et 36 modules interactifs. De la communication bienveillante aux gestes techniques, maîtrisez tous les aspects de votre métier.',
  stats: [
    { number: '36', label: 'Modules' },
    { number: '10', label: 'Blocs' },
    { number: '24/7', label: 'Accès' }
  ],
  button: {
    text: '🚀 DÉCOUVRIR NOS FORMATIONS',
    url: '#formations'
  },
  imageIcon: '🎓'
};

// Statistiques globales
const globalStats = [
  { number: '2,500+', label: 'Professionnels formés' },
  { number: '36', label: 'Modules interactifs' },
  { number: '97%', label: 'Taux de satisfaction' },
  { number: '24/7', label: 'Support disponible' }
];

// CTA Section
const cta = {
  title: 'Prêt à',
  highlight: 'développer vos compétences',
  description: 'Rejoignez plus de 2500 professionnels qui ont déjà fait confiance à FormaPro+ pour leur développement professionnel. Accédez à nos formations dès aujourd\'hui.',
  buttons: [
    { text: '🚀 Commencer maintenant', url: '#formations' },
    { text: '▶️ Voir la démonstration', url: '#demo', style: 'secondary' }
  ]
};

// Footer
const footer = {
  description: 'FormaPro+ est la plateforme de formation de référence pour les professionnels de l\'aide à domicile et des EHPAD. Nous proposons des formations complètes, interactives et adaptées aux réalités du terrain.',
  copyright: '© 2024 FormaPro+. Tous droits réservés. | Formation professionnelle pour aide à domicile et EHPAD',
  sections: [
    {
      title: 'Nos Formations',
      links: [
        { text: 'Communication & Relationnel', url: '/formation/communication-relationnel' },
        { text: 'Hygiène & Sécurité', url: '/formation/hygiene-securite-prevention' },
        { text: 'Ergonomie & Gestes', url: '/formation/ergonomie-gestes-professionnels' },
        { text: 'Premiers Secours', url: '/formation/gestion-urgences-premiers-secours' },
        { text: 'Nutrition & Repas', url: '/formation/preparation-repas-alimentation' },
        { text: 'Pathologies Spécifiques', url: '/formation/pathologies-situations-specifiques' }
      ]
    },
    {
      title: 'Services',
      links: [
        { text: 'Formations en ligne', url: '/formations' },
        { text: 'Certifications', url: '/certifications' },
        { text: 'Support 24/7', url: '/support' },
        { text: 'Suivi personnalisé', url: '/suivi' },
        { text: 'Communauté', url: '/communaute' },
        { text: 'Ressources PDF', url: '/ressources' }
      ]
    },
    {
      title: 'Support',
      links: [
        { text: 'Centre d\'aide', url: '/aide' },
        { text: 'Contact', url: '/contact' },
        { text: 'FAQ', url: '/faq' },
        { text: 'Tutoriels', url: '/tutoriels' },
        { text: 'Mentions légales', url: '/mentions-legales' },
        { text: 'Politique confidentialité', url: '/politique-confidentialite' }
      ]
    }
  ]
};

// Chat widget
const chat = {
  tooltip: 'Besoin d\'aide ? Chattez avec nous !',
  icon: '💬',
  notificationCount: 1
};

// Route principale - Page d'accueil (compatible avec votre système existant)
router.get('/', (req, res) => {
  console.log('🏠 Route / appelée');
  try {
    res.render('index', {
      title: 'FormaPro+',
      config,
      navLinks,
      hero,
      formations,
      globalStats,
      cta,
      footer,
      chat
    });
  } catch (error) {
    console.log('💥 Erreur serveur:', error.message);
    res.status(500).send('Erreur serveur');
  }
});

// Route Dashboard - Compatible avec votre système d'auth existant
router.get('/dashboard', (req, res) => {
  console.log('📊 Route /dashboard appelée');
  
  // Vérifier la session utilisateur (votre logique existante)
  const user = req.session?.user || req.user;
  
  if (!user) {
    console.log('❌ Pas de session, redirection login');
    return res.redirect('/auth/login');
  }
  
  console.log('✅ Utilisateur connecté:', user.nom || user.name || user.prenom);
  
  try {
    // Utiliser les données de votre utilisateur connecté
    const userData = {
      name: user.nom ? `${user.prenom} ${user.nom}` : (user.name || 'Utilisateur'),
      role: user.role || user.metier || 'Professionnel',
      avatar: user.avatar || '👤'
    };

    res.render('dashboard/index', {
      title: 'Dashboard Étudiant',
      user: userData
    });
  } catch (error) {
    console.log('💥 Erreur dashboard:', error.message);
    res.status(500).render('error', { 
      title: 'Erreur',
      error: { 
        status: 500, 
        message: 'Erreur lors du chargement du dashboard',
        stack: error.stack 
      }
    });
  }
});

// Route Dashboard - Lecteur vidéo (avec auth)
router.get('/dashboard/formation/:slug', (req, res) => {
  console.log('🎥 Route /dashboard/formation/:slug appelée');
  
  const user = req.session?.user || req.user;
  if (!user) {
    return res.redirect('/auth/login');
  }

  const formationSlug = req.params.slug;
  const formation = formations.list.find(f => f.slug === formationSlug);
  
  if (!formation) {
    return res.status(404).render('error', { 
      title: 'Formation non trouvée',
      error: {
        status: 404,
        message: 'La formation demandée n\'existe pas.',
        stack: ''
      }
    });
  }

  const userData = {
    name: user.nom ? `${user.prenom} ${user.nom}` : (user.name || 'Utilisateur'),
    role: user.role || user.metier || 'Professionnel'
  };

  res.render('dashboard/video', {
    title: `${formation.title} - Lecteur`,
    formation,
    user: userData
  });
});

// Route Formation détail
router.get('/formation/:slug', (req, res) => {
  const formationSlug = req.params.slug;
  const formation = formations.list.find(f => f.slug === formationSlug);
  
  if (!formation) {
    return res.status(404).render('error', { 
      title: 'Formation non trouvée',
      message: 'La formation demandée n\'existe pas.' 
    });
  }

  res.render('formation/detail', {
    title: formation.title,
    formation,
    config,
    navLinks
  });
});

// Route Inscription
router.get('/inscription/:slug', (req, res) => {
  const formationSlug = req.params.slug;
  const formation = formations.list.find(f => f.slug === formationSlug);
  
  if (!formation) {
    return res.status(404).render('error', { 
      title: 'Formation non trouvée',
      message: 'La formation demandée n\'existe pas.' 
    });
  }

  res.render('inscription/form', {
    title: `Inscription - ${formation.title}`,
    formation,
    config,
    navLinks
  });
});

// Route Contact
router.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Contact',
    config,
    navLinks,
    footer
  });
});

// API Route - Formations
router.get('/api/formations', (req, res) => {
  res.json({
    success: true,
    data: formations.list
  });
});

// API Route - Formation par slug
router.get('/api/formation/:slug', (req, res) => {
  const formation = formations.list.find(f => f.slug === req.params.slug);
  
  if (!formation) {
    return res.status(404).json({
      success: false,
      message: 'Formation non trouvée'
    });
  }

  res.json({
    success: true,
    data: formation
  });
});

export default router;