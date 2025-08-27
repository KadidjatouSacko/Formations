// routes/enrollments.js - Routes pour les inscriptions
import express from 'express';
import { Enrollment, Formation, ModuleProgress, Module } from '../models/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// S'inscrire à une formation
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { formation_id } = req.body;
    const user_id = req.user.userId;
    
    // Vérifier si l'utilisateur est déjà inscrit
    const existingEnrollment = await Enrollment.findOne({
      where: { user_id, formation_id }
    });
    
    if (existingEnrollment) {
      return res.status(400).json({ error: 'Vous êtes déjà inscrit à cette formation' });
    }
    
    // Vérifier que la formation existe
    const formation = await Formation.findByPk(formation_id, {
      include: [{ model: Module, as: 'modules', order: [['sort_order', 'ASC']] }]
    });
    
    if (!formation) {
      return res.status(404).json({ error: 'Formation non trouvée' });
    }
    
    // Créer l'inscription
    const enrollment = await Enrollment.create({
      user_id,
      formation_id,
      started_at: new Date(),
      current_module_id: formation.modules[0]?.id || null
    });
    
    // Créer les entrées de progression pour chaque module
    const moduleProgressPromises = formation.modules.map(module => 
      ModuleProgress.create({
        enrollment_id: enrollment.id,
        module_id: module.id,
        status: 'not_started'
      })
    );
    
    await Promise.all(moduleProgressPromises);
    
    res.status(201).json({
      message: 'Inscription réussie',
      enrollment
    });
    
  } catch (error) {
    console.error('Erreur inscription formation:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

// Mettre à jour la progression d'un module
router.put('/:enrollmentId/progress/:moduleId', authMiddleware, async (req, res) => {
  try {
    const { enrollmentId, moduleId } = req.params;
    const { status, progress_percentage, time_spent, notes } = req.body;
    
    const moduleProgress = await ModuleProgress.findOne({
      where: { enrollment_id: enrollmentId, module_id: moduleId }
    });
    
    if (!moduleProgress) {
      return res.status(404).json({ error: 'Progression non trouvée' });
    }
    
    const updateData = {};
    if (status) updateData.status = status;
    if (progress_percentage !== undefined) updateData.progress_percentage = progress_percentage;
    if (time_spent) updateData.time_spent = (moduleProgress.time_spent || 0) + time_spent;
    if (notes) updateData.notes = notes;
    
    // Marquer les timestamps
    if (status === 'in_progress' && !moduleProgress.started_at) {
      updateData.started_at = new Date();
    }
    if (status === 'completed') {
      updateData.completed_at = new Date();
      updateData.progress_percentage = 100;
    }
    
    await moduleProgress.update(updateData);
    
    res.json({
      message: 'Progression mise à jour',
      moduleProgress
    });
    
  } catch (error) {
    console.error('Erreur mise à jour progression:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

export default router;