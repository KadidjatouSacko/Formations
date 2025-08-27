// routes/formations.js - Routes pour les formations
import express from 'express';
import { Formation, Category, User, Module, Enrollment, Review } from '../models/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Liste des formations
router.get('/', async (req, res) => {
  try {
    const { category, level, status = 'published', search, page = 1, limit = 12 } = req.query;
    
    const where = { status };
    
    if (category) where.category_id = category;
    if (level) where.level = level;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    const formations = await Formation.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category' },
        { model: User, as: 'instructor', attributes: ['first_name', 'last_name'] },
        { model: Module, as: 'modules', attributes: ['id'] }
      ],
      order: [['created_at', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit)
    });
    
    res.json({
      formations: formations.rows,
      pagination: {
        total: formations.count,
        page: parseInt(page),
        pages: Math.ceil(formations.count / limit),
        limit: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Erreur formations:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des formations' });
  }
});

// Détail d'une formation
router.get('/:id', async (req, res) => {
  try {
    const formation = await Formation.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: User, as: 'instructor' },
        { 
          model: Module, 
          as: 'modules',
          order: [['sort_order', 'ASC']],
          include: [{ model: Resource, as: 'resources' }]
        },
        { 
          model: Review, 
          as: 'reviews',
          include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }]
        }
      ]
    });
    
    if (!formation) {
      return res.status(404).json({ error: 'Formation non trouvée' });
    }
    
    res.json(formation);
    
  } catch (error) {
    console.error('Erreur détail formation:', error);
    res.status(500).json({ error: 'Erreur lors du chargement de la formation' });
  }
});

export default router;
