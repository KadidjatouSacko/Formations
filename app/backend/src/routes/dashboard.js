// routes/dashboard.js - Routes pour le dashboard
import express from 'express';
import { User, Formation, Enrollment, ModuleProgress, Module, Certificate, UserBadge, Badge } from '../models/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Dashboard étudiant
router.get('/student/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Données utilisateur avec profil
    const user = await User.findByPk(userId, {
      include: [
        { model: StudentProfile, as: 'studentProfile' },
        { 
          model: Enrollment, 
          as: 'enrollments',
          include: [
            {
              model: Formation,
              as: 'formation',
              include: [{ model: Module, as: 'modules' }]
            },
            { model: ModuleProgress, as: 'moduleProgress' }
          ]
        },
        { 
          model: UserBadge, 
          as: 'badges',
          include: [{ model: Badge, as: 'badge' }]
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Calculer les statistiques
    const stats = {
      totalEnrollments: user.enrollments.length,
      completedFormations: user.enrollments.filter(e => e.status === 'completed').length,
      totalTimeSpent: user.enrollments.reduce((total, e) => total + (e.time_spent || 0), 0),
      avgProgress: Math.round(
        user.enrollments.reduce((total, e) => total + e.progress_percentage, 0) / 
        (user.enrollments.length || 1)
      ),
      totalBadges: user.badges.length,
      totalCertificates: user.enrollments.filter(e => e.certificate_issued).length
    };
    
    // Formations actives
    const activeFormations = user.enrollments
      .filter(e => e.status === 'active')
      .map(enrollment => ({
        id: enrollment.id,
        formation: enrollment.formation,
        progress_percentage: enrollment.progress_percentage,
        current_module_id: enrollment.current_module_id,
        last_accessed: enrollment.last_accessed,
        time_spent: enrollment.time_spent,
        modules_completed: enrollment.moduleProgress.filter(mp => mp.status === 'completed').length,
        total_modules: enrollment.formation.modules.length
      }));
    
    // Formations terminées
    const completedFormations = user.enrollments
      .filter(e => e.status === 'completed')
      .map(enrollment => ({
        id: enrollment.id,
        formation: enrollment.formation,
        completed_at: enrollment.completed_at,
        final_score: enrollment.final_score,
        certificate_issued: enrollment.certificate_issued
      }));
    
    // Badges obtenus
    const earnedBadges = user.badges.map(userBadge => ({
      ...userBadge.badge.toJSON(),
      earned_at: userBadge.earned_at,
      formation_id: userBadge.formation_id
    }));
    
    res.json({
      user: user.toSafeJSON(),
      stats,
      activeFormations,
      completedFormations,
      earnedBadges
    });
    
  } catch (error) {
    console.error('Erreur dashboard:', error);
    res.status(500).json({ error: 'Erreur lors du chargement du dashboard' });
  }
});

// Activité récente
router.get('/activity/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const activities = await UserActivity.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 10,
      include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }]
    });
    
    res.json(activities);
    
  } catch (error) {
    console.error('Erreur activités:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des activités' });
  }
});

export default router;
