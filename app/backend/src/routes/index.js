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
  
  // Données par défaut si formations n'est pas défini
  const defaultFormations = [
    {
      id: 'comm-relationnel',
      slug: 'communication-relationnel',
      title: 'Communication & Relationnel',
      description: 'Maîtrisez l\'art de la communication bienveillante, la gestion des émotions et des situations difficiles.',
      icon: '🗣️',
      badge: 'Essentiel',
      level: 'Débutant',
      price: 'Gratuit',
      moduleCount: 5,
      features: ['Écoute active', 'Gestion conflits', 'Respect dignité', 'Vidéos pratiques']
    },
    {
      id: 'hygiene-securite',
      slug: 'hygiene-securite',
      title: 'Hygiène, Sécurité & Prévention',
      description: 'Protocoles d\'hygiène professionnelle, sécurité avec les produits ménagers, prévention des risques.',
      icon: '🛡️',
      badge: 'Avancé',
      level: 'Intermédiaire',
      price: '49€',
      moduleCount: 4,
      features: ['Protocoles hygiène', 'Sécurité produits', 'Prévention chutes', 'Anti-infections']
    },
    {
      id: 'ergonomie-gestes',
      slug: 'ergonomie-gestes',
      title: 'Ergonomie & Gestes Professionnels',
      description: 'Techniques de manutention, prévention des TMS, utilisation du matériel médical.',
      icon: '🏥',
      badge: 'Expert',
      level: 'Avancé',
      price: '79€',
      moduleCount: 3,
      features: ['Bonnes postures', 'Transferts sécurisés', 'Matériel médical', 'Prévention TMS']
    },
    {
      id: 'premiers-secours',
      slug: 'premiers-secours',
      title: 'Gestion des Urgences & Premiers Secours',
      description: 'Formation complète aux gestes qui sauvent : RCP, défibrillateur, position latérale de sécurité.',
      icon: '🚨',
      badge: 'Critique',
      level: 'Essentiel',
      price: '99€',
      moduleCount: 5,
      features: ['RCP & Défibrillateur', 'Position PLS', 'Gestion blessures', 'Situations critiques']
    },
    {
      id: 'nutrition-repas',
      slug: 'nutrition-repas',
      title: 'Préparation des Repas & Alimentation',
      description: 'Hygiène alimentaire, repas équilibrés adaptés, gestion des textures pour éviter les fausses routes.',
      icon: '🍽️',
      badge: 'Pratique',
      level: 'Intermédiaire',
      price: '59€',
      moduleCount: 4,
      features: ['Hygiène alimentaire', 'Repas équilibrés', 'Textures adaptées', 'Hydratation']
    },
    {
      id: 'pathologies-specifiques',
      slug: 'pathologies-specifiques',
      title: 'Pathologies & Situations Spécifiques',
      description: 'Accompagnement des troubles cognitifs, Alzheimer, maladies chroniques, perte de mobilité.',
      icon: '🧠',
      badge: 'Spécialisé',
      level: 'Expert',
      price: '89€',
      moduleCount: 4,
      features: ['Troubles cognitifs', 'Maladies chroniques', 'Perte mobilité', 'Fin de vie']
    }
  ];

  // Utiliser vos données existantes ou les données par défaut
  const formationsData = formations?.list || defaultFormations;

  const templateData = {
    title: 'FormaPro+ | Formation Excellence Aide à Domicile & EHPAD',
    featuredFormations: formationsData.slice(0, 6), // Fix: définir featuredFormations
    stats: {
      studentsCount: '2,500',
      totalModules: 36,
      totalBlocks: 10,
      satisfaction: 97
    },
    currentPage: 'home'
  };

  res.render('index', templateData);
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
  console.log('📚 Route /dashboard/formation/:slug appelée');
  
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

  // Vérifier si l'utilisateur est inscrit à cette formation
  const userEnrolled = user.enrolledCourses?.includes(formation.id) || false;

  // Données utilisateur
  const userData = {
    name: user.nom ? `${user.prenom} ${user.nom}` : (user.name || 'Utilisateur'),
    role: user.role || user.metier || 'Professionnel'
  };

  // Formations recommandées (exclure la formation actuelle)
  const relatedCourses = formations.list
    .filter(f => f.id !== formation.id)
    .slice(0, 3)
    .map(f => ({
      slug: f.slug,
      title: f.title,
      icon: f.icon,
      price: f.price
    }));

  // Structure des données pour le template
  const templateData = {
    title: `${formation.title} - FormaPro+`,
    formation: {
      id: formation.id,
      slug: formation.slug,
      title: formation.title,
      subtitle: formation.subtitle || "Formation professionnelle spécialisée",
      description: formation.description,
      icon: formation.icon,
      level: formation.level || 'intermédiaire',
      duration: formation.duration || '3-4 heures',
      rating: formation.rating || 4.8,
      reviewCount: formation.reviewCount || 127,
      price: formation.price,
      originalPrice: formation.originalPrice,
      
      // Modules avec statut basé sur l'inscription
      modules: formation.modules?.map((module, index) => ({
        id: module.id || `module-${index + 1}`,
        title: module.title,
        description: module.description,
        status: userEnrolled ? (index < 2 ? 'Available' : 'Available') : (index < 1 ? 'Available' : 'Locked'),
        resources: module.resources || [
          { icon: '🎥', label: 'Vidéo 15 min' },
          { icon: '📄', label: 'PDF téléchargeable' },
          { icon: '❓', label: 'Quiz 5 questions' }
        ]
      })) || [
        {
          id: 'module-1',
          title: 'Introduction à la formation',
          description: 'Découvrez les objectifs et la méthodologie de cette formation.',
          status: 'Available',
          resources: [
            { icon: '🎥', label: 'Vidéo 15 min' },
            { icon: '📄', label: 'PDF téléchargeable' },
            { icon: '❓', label: 'Quiz 5 questions' }
          ]
        }
      ],

      // Fonctionnalités incluses
      features: [
        'Accès immédiat à vie',
        `${formation.modules?.length || 5} modules interactifs`,
        'Vidéos HD professionnelles',
        'PDF téléchargeables',
        'Quiz d\'évaluation',
        'Certificat de réussite',
        'Support 7j/7',
        'Accès mobile & desktop'
      ],

      // Instructeur
      instructor: formation.instructor || {
        name: 'Dr. Claire Rousseau',
        title: 'Experte en Formation Professionnelle',
        bio: '15 ans d\'expérience dans la formation des professionnels de santé. Spécialiste de l\'accompagnement et des bonnes pratiques.',
        avatar: '👩‍⚕️'
      },

      // Statistiques
      stats: {
        enrolled: formation.stats?.enrolled || 2847,
        successRate: formation.stats?.successRate || 94,
        averageTime: formation.stats?.averageTime || '2h45',
        certified: formation.stats?.certified || 2675
      },

      // Avis
      reviews: formation.reviews || [
        {
          authorInitials: 'SM',
          authorName: 'Sophie Martin',
          role: 'Aide à domicile - Paris',
          rating: 5,
          text: 'Cette formation m\'a vraiment aidée dans mon quotidien. Les techniques sont directement applicables et les vidéos très réalistes.'
        },
        {
          authorInitials: 'MD',
          authorName: 'Marie Dubois',
          role: 'Auxiliaire de vie - Lyon',
          rating: 5,
          text: 'Excellente formation ! Les situations pratiques m\'ont permis de mieux comprendre comment réagir face aux moments difficiles.'
        },
        {
          authorInitials: 'JL',
          authorName: 'Jean Legrand',
          role: 'Aide-soignant EHPAD - Marseille',
          rating: 4,
          text: 'Formation très complète et bien structurée. Les PDF téléchargeables sont parfaits pour réviser.'
        }
      ]
    },
    relatedCourses,
    userEnrolled,
    currentPage: 'formations',
    user: userData
  };

  res.render('formations/detail', templateData);
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

router.get('/dashboard/formations', (req, res) => {
  const user = req.session?.user || req.user;
  if (!user) {
    return res.redirect('/auth/login');
  }

  const templateData = {
    title: 'Catalogue des formations - FormaPro+',
    formations: formations.list.map(f => ({
      ...f,
      levelLabel: f.level.charAt(0).toUpperCase() + f.level.slice(1),
      durationCategory: f.modules?.length <= 3 ? 'courte' : f.modules?.length <= 6 ? 'moyenne' : 'longue',
      priceCategory: f.price === 'Gratuit' ? 'gratuit' : 'payant',
      moduleCount: f.modules?.length || 5,
      features: f.features || ['Accès immédiat', 'Certificat inclus', 'Support 24/7', 'PDF téléchargeables']
    })),
    domains: [
      { value: 'communication', label: 'Communication' },
      { value: 'hygiene', label: 'Hygiène & Sécurité' },
      { value: 'ergonomie', label: 'Ergonomie' },
      { value: 'urgences', label: 'Urgences' },
      { value: 'nutrition', label: 'Nutrition' },
      { value: 'pathologies', label: 'Pathologies' }
    ],
    pagination: {
      currentPage: parseInt(req.query.page) || 1,
      totalPages: Math.ceil(formations.list.length / 9)
    },
    totalFormations: formations.list.length,
    totalBlocks: 10,
    currentPage: 'formations',
    user: {
      name: user.nom ? `${user.prenom} ${user.nom}` : 'Utilisateur',
      role: user.role || 'Professionnel'
    }
  };

  res.render('formations/catalog', templateData);
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

router.get('/formation/:id', (req, res) => {
    console.log(`📖 Route dashboard formation: ${req.params.id}`);
    const formationPath = path.join(__dirname, '../../dashboard-video.html');
    res.sendFile(formationPath);
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