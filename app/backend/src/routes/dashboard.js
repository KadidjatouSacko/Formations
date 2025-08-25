// app/backend/src/routes/dashboard.js
import express from 'express';
import { simulatedData, formatDate, timeAgo } from '../utils/helpers.js';

const router = express.Router();

// Middleware d'authentification
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
};

// Dashboard principal
router.get('/', requireAuth, (req, res) => {
    const user = req.session.user;
    const userData = simulatedData.users.find(u => u.id === user.id);
    
    // Récupérer les formations de l'utilisateur
    const userFormations = userData.formations.map(uf => {
        const formation = simulatedData.formations.find(f => f.id === uf.id);
        return {
            ...formation,
            progression: uf.progression,
            statut: uf.statut,
            dateDebut: uf.dateDebut,
            score: uf.score,
            certificat: uf.certificat,
            modulesCompletes: Math.floor((uf.progression / 100) * formation.modules.length),
            modules: formation.modules.length
        };
    });
    
    // Calculer les statistiques
    const stats = {
        formationsEnCours: userFormations.filter(f => f.statut === 'en_cours').length,
        formationsTerminees: userFormations.filter(f => f.statut === 'termine').length,
        tempsTotal: '15h32min',
        scoreMoyen: 95,
        progressionGlobale: Math.round(userFormations.reduce((acc, f) => acc + f.progression, 0) / userFormations.length)
    };
    
    // Récupérer l'activité récente
    const activiteRecente = simulatedData.activites
        .filter(a => a.userId === user.id)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
    
    res.render('dashboard-etudiant', {
        title: 'Mon espace - FormaPro+',
        user: user,
        stats: stats,
        formations: userFormations,
        activiteRecente: activiteRecente,
        formatDate: formatDate,
        timeAgo: timeAgo
    });
});

app.get('/dashboard', requireLogin, (req, res) => {
  console.log('✅ Utilisateur connecté:', req.session.user.prenom);
  
  const userData = {
    name: `${req.session.user.prenom} ${req.session.user.nom}`,
    role: req.session.user.metier || 'Professionnel',
    avatar: '👤'
  };

  // Si vous voulez utiliser votre dashboard EJS
  res.render('dashboard/index', {
    title: 'Dashboard Étudiant', 
    user: userData
  });
  
  // OU si vous préférez garder votre HTML existant
  // res.sendFile(path.join(__dirname, '../views/dashboard-etudiant.html'));
});

export default router;