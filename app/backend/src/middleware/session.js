// Middleware simple pour gérer les sessions
const sessionMiddleware = (req, res, next) => {
  // Initialiser la session si elle n'existe pas
  if (!req.session) {
    req.session = {};
  }
  
  // Variables locales pour les templates
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = !!req.session.user;
  
  next();
};

// Middleware de protection des routes
const requireAuth = (req, res, next) => {
  if (!req.session?.user && !req.user) {
    return res.redirect('/auth/login');
  }
  next();
};

// Middleware pour les données globales des templates
const templateGlobals = (req, res, next) => {
  // Configuration globale
  res.locals.config = {
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
  res.locals.navLinks = [
    { url: '#formations', text: 'Formations' },
    { url: '#financements', text: 'Financements' },
    { url: '#evenements', text: 'Événements' },
    { url: '#blog', text: 'Blog' },
    { url: '/contact', text: 'Contact' }
  ];

  next();
};

module.exports = {
  sessionMiddleware,
  requireAuth,
  templateGlobals
};