// ===================================================
// 📚 ROUTES DES FORMATIONS - MODULES ES6
// ===================================================

import express from 'express';
import { query, queryOne, queryMany } from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken, optionalAuth, requireRole } from '../middleware/auth.js';
import chalk from 'chalk';

const router = express.Router();

// ===================================================
// 📋 LISTE DES FORMATIONS PUBLIQUES
// ===================================================

router.get('/', optionalAuth, asyncHandler(async (req, res) => {
    console.log(chalk.blue('📋 Récupération liste des formations'));

    const {
        category,
        level,
        search,
        featured,
        limit = 20,
        offset = 0,
        sort = 'created_at',
        order = 'DESC'
    } = req.query;

    // Construction de la requête avec filtres
    let whereConditions = ['f.status = $1'];
    let params = ['published'];
    let paramIndex = 2;

    // Filtre par catégorie
    if (category) {
        whereConditions.push(`c.slug = $${paramIndex}`);
        params.push(category);
        paramIndex++;
    }

    // Filtre par niveau
    if (level) {
        whereConditions.push(`f.level = $${paramIndex}`);
        params.push(level);
        paramIndex++;
    }

    // Recherche textuelle
    if (search) {
        whereConditions.push(`(f.title ILIKE $${paramIndex} OR f.description ILIKE $${paramIndex})`);
        params.push(`%${search}%`);
        paramIndex++;
    }

    // Formations mises en avant
    if (featured === 'true') {
        whereConditions.push('f.is_featured = true');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Validation du tri
    const allowedSortFields = ['created_at', 'title', 'rating', 'total_students', 'duration_hours'];
    const validSort = allowedSortFields.includes(sort) ? sort : 'created_at';
    const validOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const formations = await queryMany(`
        SELECT 
            f.id,
            f.title,
            f.slug,
            f.description,
            f.short_description,
            f.thumbnail,
            f.level,
            f.duration_hours,
            f.price,
            f.is_free,
            f.rating,
            f.total_students,
            f.total_ratings,
            f.is_featured,
            f.published_at,
            c.name as category_name,
            c.slug as category_slug,
            c.icon as category_icon,
            c.color as category_color,
            CONCAT(u.first_name, ' ', u.last_name) as instructor_name,
            u.profile_image as instructor_avatar,
            COUNT(DISTINCT m.id) as total_modules,
            COALESCE(AVG(m.estimated_duration), 0) as avg_module_duration
        FROM formations f
        LEFT JOIN categories c ON f.category_id = c.id
        LEFT JOIN users u ON f.instructor_id = u.id
        LEFT JOIN modules m ON f.id = m.formation_id
        ${whereClause}
        GROUP BY f.id, c.id, u.id
        ORDER BY f.${validSort} ${validOrder}
        LIMIT ${paramIndex} OFFSET ${paramIndex + 1}
    `, [...params, parseInt(limit), parseInt(offset)]);

    // Compter le total pour la pagination
    const totalResult = await queryOne(`
        SELECT COUNT(DISTINCT f.id) as total
        FROM formations f
        LEFT JOIN categories c ON f.category_id = c.id
        ${whereClause}
    `, params.slice(0, -2)); // Enlever limit et offset

    console.log(chalk.green(`✅ ${formations.length} formations récupérées`));

    res.json({
        success: true,
        data: {
            formations,
            pagination: {
                total: parseInt(totalResult.total),
                limit: parseInt(limit),
                offset: parseInt(offset),
                pages: Math.ceil(totalResult.total / limit)
            },
            filters: {
                category,
                level,
                search,
                featured
            }
        }
    });
}));

// ===================================================
// 🔍 DÉTAILS D'UNE FORMATION
// ===================================================

router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
    const { id } = req.params;
    console.log(chalk.blue('🔍 Récupération formation:'), id);

    // Formation principale avec statistiques
    const formation = await queryOne(`
        SELECT 
            f.*,
            c.name as category_name,
            c.slug as category_slug,
            c.icon as category_icon,
            c.color as category_color,
            CONCAT(u.first_name, ' ', u.last_name) as instructor_name,
            u.profile_image as instructor_avatar,
            u.email as instructor_email,
            COUNT(DISTINCT m.id) as total_modules,
            COUNT(DISTINCT e.id) as total_enrollments,
            COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.id END) as completed_enrollments,
            COALESCE(AVG(r.rating), 0) as avg_rating,
            COUNT(DISTINCT r.id) as review_count
        FROM formations f
        LEFT JOIN categories c ON f.category_id = c.id
        LEFT JOIN users u ON f.instructor_id = u.id
        LEFT JOIN modules m ON f.id = m.formation_id
        LEFT JOIN enrollments e ON f.id = e.formation_id
        LEFT JOIN reviews r ON f.id = r.formation_id AND r.is_published = true
        WHERE f.id = $1 AND f.status = 'published'
        GROUP BY f.id, c.id, u.id
    `, [id]);

    if (!formation) {
        return res.status(404).json({
            success: false,
            error: 'Formation non trouvée',
            code: 'FORMATION_NOT_FOUND'
        });
    }

    // Modules de la formation
    const modules = await queryMany(`
        SELECT 
            id, 
            title, 
            description, 
            module_type, 
            estimated_duration, 
            sort_order, 
            is_preview,
            is_mandatory,
            video_duration
        FROM modules
        WHERE formation_id = $1
        ORDER BY sort_order ASC
    `, [id]);

    // Avis récents (si l'utilisateur est connecté ou si publics)
    const reviews = await queryMany(`
        SELECT 
            r.id,
            r.rating,
            r.title,
            r.comment,
            r.created_at,
            CONCAT(u.first_name, ' ', LEFT(u.last_name, 1), '.') as reviewer_name,
            u.profile_image as reviewer_avatar
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.formation_id = $1 AND r.is_published = true
        ORDER BY r.created_at DESC
        LIMIT 5
    `, [id]);

    // Vérifier si l'utilisateur est inscrit (si connecté)
    let userEnrollment = null;
    if (req.user) {
        userEnrollment = await queryOne(`
            SELECT 
                id,
                status,
                progress_percentage,
                enrolled_at,
                started_at,
                completed_at,
                current_module_id,
                time_spent
            FROM enrollments
            WHERE user_id = $1 AND formation_id = $2
        `, [req.user.id, id]);
    }

    // Formations similaires
    const similarFormations = await queryMany(`
        SELECT 
            f.id,
            f.title,
            f.slug,
            f.thumbnail,
            f.level,
            f.rating,
            f.total_students,
            c.name as category_name
        FROM formations f
        LEFT JOIN categories c ON f.category_id = c.id
        WHERE f.category_id = $1 
        AND f.id != $2 
        AND f.status = 'published'
        ORDER BY f.rating DESC, f.total_students DESC
        LIMIT 4
    `, [formation.category_id, id]);

    console.log(chalk.green('✅ Formation récupérée:'), formation.title);

    res.json({
        success: true,
        data: {
            formation: {
                ...formation,
                avg_rating: parseFloat(formation.avg_rating),
                total_modules: parseInt(formation.total_modules),
                total_enrollments: parseInt(formation.total_enrollments),
                completed_enrollments: parseInt(formation.completed_enrollments),
                review_count: parseInt(formation.review_count)
            },
            modules,
            reviews,
            userEnrollment,
            similarFormations
        }
    });
}));

// ===================================================
// 📊 CATÉGORIES
// ===================================================

router.get('/categories/list', asyncHandler(async (req, res) => {
    console.log(chalk.blue('📊 Récupération des catégories'));

    const categories = await queryMany(`
        SELECT 
            c.id,
            c.name,
            c.slug,
            c.description,
            c.icon,
            c.color,
            COUNT(f.id) as formation_count
        FROM categories c
        LEFT JOIN formations f ON c.id = f.category_id AND f.status = 'published'
        WHERE c.is_active = true
        GROUP BY c.id
        ORDER BY c.sort_order ASC, c.name ASC
    `);

    console.log(chalk.green(`✅ ${categories.length} catégories récupérées`));

    res.json({
        success: true,
        data: categories.map(cat => ({
            ...cat,
            formation_count: parseInt(cat.formation_count)
        }))
    });
}));

// ===================================================
// 🎓 INSCRIPTION À UNE FORMATION
// ===================================================

router.post('/:id/enroll', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    console.log(chalk.blue('🎓 Inscription formation:'), id, 'par', req.user.email);

    // Vérifier que la formation existe et est disponible
    const formation = await queryOne(`
        SELECT id, title, max_students, is_free, price, status
        FROM formations
        WHERE id = $1 AND status = 'published'
    `, [id]);

    if (!formation) {
        return res.status(404).json({
            success: false,
            error: 'Formation non trouvée ou non disponible',
            code: 'FORMATION_NOT_FOUND'
        });
    }

    // Vérifier si déjà inscrit
    const existingEnrollment = await queryOne(
        'SELECT id, status FROM enrollments WHERE user_id = $1 AND formation_id = $2',
        [userId, id]
    );

    if (existingEnrollment) {
        return res.status(409).json({
            success: false,
            error: 'Vous êtes déjà inscrit à cette formation',
            code: 'ALREADY_ENROLLED',
            enrollment: existingEnrollment
        });
    }

    // Vérifier la limite d'étudiants
    if (formation.max_students) {
        const currentEnrollments = await queryOne(
            'SELECT COUNT(*) as count FROM enrollments WHERE formation_id = $1 AND status IN ($2, $3)',
            [id, 'active', 'completed']
        );

        if (parseInt(currentEnrollments.count) >= formation.max_students) {
            return res.status(409).json({
                success: false,
                error: 'Formation complète - nombre maximum d\'étudiants atteint',
                code: 'FORMATION_FULL'
            });
        }
    }

    // Créer l'inscription
    const enrollment = await queryOne(`
        INSERT INTO enrollments (
            user_id, 
            formation_id, 
            status, 
            enrolled_at, 
            started_at
        ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
    `, [userId, id, 'active']);

    // Mettre à jour le compteur d'étudiants de la formation
    await query(
        'UPDATE formations SET total_students = total_students + 1 WHERE id = $1',
        [id]
    );

    // Log de l'inscription
    await query(`
        INSERT INTO user_activities (
            user_id, action, resource_type, resource_id, 
            metadata, ip_address, user_agent, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
    `, [
        userId,
        'formation_enrolled',
        'formation',
        id,
        JSON.stringify({ 
            formation_title: formation.title,
            is_free: formation.is_free 
        }),
        req.ip,
        req.get('User-Agent')
    ]);

    console.log(chalk.green('✅ Inscription réussie:'), formation.title);

    res.status(201).json({
        success: true,
        message: `Inscription réussie à la formation "${formation.title}"`,
        data: {
            enrollment,
            formation: {
                id: formation.id,
                title: formation.title
            }
        }
    });
}));

// ===================================================
// ⭐ AJOUTER UN AVIS
// ===================================================

router.post('/:id/review', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, title, comment } = req.body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
            success: false,
            error: 'Note requise entre 1 et 5',
            code: 'INVALID_RATING'
        });
    }

    // Vérifier que l'utilisateur a terminé la formation
    const enrollment = await queryOne(`
        SELECT id, status 
        FROM enrollments 
        WHERE user_id = $1 AND formation_id = $2 AND status = 'completed'
    `, [userId, id]);

    if (!enrollment) {
        return res.status(403).json({
            success: false,
            error: 'Vous devez terminer la formation pour laisser un avis',
            code: 'FORMATION_NOT_COMPLETED'
        });
    }

    // Vérifier si l'utilisateur a déjà donné un avis
    const existingReview = await queryOne(
        'SELECT id FROM reviews WHERE user_id = $1 AND formation_id = $2',
        [userId, id]
    );

    if (existingReview) {
        return res.status(409).json({
            success: false,
            error: 'Vous avez déjà donné un avis pour cette formation',
            code: 'REVIEW_ALREADY_EXISTS'
        });
    }

    // Créer l'avis
    const review = await queryOne(`
        INSERT INTO reviews (
            user_id, formation_id, rating, title, comment, 
            is_verified, is_published, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        RETURNING *
    `, [userId, id, rating, title, comment, true, true]);

    // Mettre à jour les statistiques de la formation
    await query(`
        UPDATE formations 
        SET 
            rating = (
                SELECT AVG(rating) 
                FROM reviews 
                WHERE formation_id = $1 AND is_published = true
            ),
            total_ratings = total_ratings + 1
        WHERE id = $1
    `, [id]);

    console.log(chalk.green('✅ Avis ajouté:'), `${rating}/5 pour formation ${id}`);

    res.status(201).json({
        success: true,
        message: 'Avis ajouté avec succès',
        data: review
    });
}));

// ===================================================
// 🔍 RECHERCHE AVANCÉE
// ===================================================

router.get('/search/advanced', asyncHandler(async (req, res) => {
    const {
        q, // terme de recherche
        category,
        level,
        duration_min,
        duration_max,
        price_min,
        price_max,
        rating_min,
        instructor,
        tags,
        limit = 20,
        offset = 0
    } = req.query;

    console.log(chalk.blue('🔍 Recherche avancée:'), q);

    let whereConditions = ['f.status = $1'];
    let params = ['published'];
    let paramIndex = 2;

    // Recherche textuelle avancée
    if (q && q.trim()) {
        whereConditions.push(`(
            f.title ILIKE ${paramIndex} OR 
            f.description ILIKE ${paramIndex} OR 
            f.short_description ILIKE ${paramIndex} OR
            EXISTS (
                SELECT 1 FROM modules m 
                WHERE m.formation_id = f.id 
                AND m.title ILIKE ${paramIndex}
            )
        )`);
        params.push(`%${q.trim()}%`);
        paramIndex++;
    }

    // Autres filtres...
    if (category) {
        whereConditions.push(`c.slug = ${paramIndex}`);
        params.push(category);
        paramIndex++;
    }

    if (level) {
        whereConditions.push(`f.level = ${paramIndex}`);
        params.push(level);
        paramIndex++;
    }

    if (duration_min) {
        whereConditions.push(`f.duration_hours >= ${paramIndex}`);
        params.push(parseFloat(duration_min));
        paramIndex++;
    }

    if (duration_max) {
        whereConditions.push(`f.duration_hours <= ${paramIndex}`);
        params.push(parseFloat(duration_max));
        paramIndex++;
    }

    if (rating_min) {
        whereConditions.push(`f.rating >= ${paramIndex}`);
        params.push(parseFloat(rating_min));
        paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const results = await queryMany(`
        SELECT 
            f.id,
            f.title,
            f.slug,
            f.short_description,
            f.thumbnail,
            f.level,
            f.duration_hours,
            f.price,
            f.rating,
            f.total_students,
            c.name as category_name,
            c.icon as category_icon,
            CONCAT(u.first_name, ' ', u.last_name) as instructor_name,
            COUNT(DISTINCT m.id) as module_count,
            -- Score de pertinence pour la recherche textuelle
            ${q ? `
                CASE 
                    WHEN f.title ILIKE $2 THEN 3
                    WHEN f.short_description ILIKE $2 THEN 2  
                    WHEN f.description ILIKE $2 THEN 1
                    ELSE 0
                END as relevance_score,
            ` : '0 as relevance_score,'}
            ts_rank_cd(
                to_tsvector('french', f.title || ' ' || COALESCE(f.description, '')), 
                plainto_tsquery('french', COALESCE(${q ? '2' : '1'}, ''))
            ) as text_rank
        FROM formations f
        LEFT JOIN categories c ON f.category_id = c.id
        LEFT JOIN users u ON f.instructor_id = u.id
        LEFT JOIN modules m ON f.id = m.formation_id
        WHERE ${whereClause}
        GROUP BY f.id, c.id, u.id
        ORDER BY 
            ${q ? 'relevance_score DESC, text_rank DESC,' : ''}
            f.rating DESC, 
            f.total_students DESC
        LIMIT ${paramIndex} OFFSET ${paramIndex + 1}
    `, [...params, parseInt(limit), parseInt(offset)]);

    console.log(chalk.green(`✅ ${results.length} résultats de recherche`));

    res.json({
        success: true,
        data: {
            results,
            query: q,
            filters: { category, level, duration_min, duration_max, rating_min },
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        }
    });
}));

// ===================================================
// 📈 FORMATIONS POPULAIRES/TENDANCES
// ===================================================

router.get('/trending/popular', asyncHandler(async (req, res) => {
    console.log(chalk.blue('📈 Récupération formations populaires'));

    const trending = await queryMany(`
        SELECT 
            f.id,
            f.title,
            f.slug,
            f.thumbnail,
            f.rating,
            f.total_students,
            c.name as category_name,
            c.icon as category_icon,
            -- Calcul du score de tendance (inscriptions récentes + note)
            (
                (SELECT COUNT(*) FROM enrollments e WHERE e.formation_id = f.id AND e.created_at > CURRENT_DATE - INTERVAL '7 days') * 2 +
                f.rating * 10 +
                (f.total_students / 10)
            ) as trending_score
        FROM formations f
        LEFT JOIN categories c ON f.category_id = c.id
        WHERE f.status = 'published'
        ORDER BY trending_score DESC
        LIMIT 10
    `);

    res.json({
        success: true,
        data: trending.map(f => ({
            ...f,
            trending_score: parseFloat(f.trending_score)
        }))
    });
}));

export default router;