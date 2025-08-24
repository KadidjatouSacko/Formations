// ===================================================
// 👥 ROUTES DES UTILISATEURS - MODULES ES6
// ===================================================

import express from 'express';
import { body, validationResult } from 'express-validator';
import { query, queryOne, queryMany, update } from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken, requireRole, requireOwnership } from '../middleware/auth.js';
import chalk from 'chalk';

const router = express.Router();

// Toutes les routes utilisateur nécessitent une authentification
router.use(authenticateToken);

// ===================================================
// 👤 PROFIL UTILISATEUR
// ===================================================

router.get('/profile', asyncHandler(async (req, res) => {
    const userId = req.user.id;
    console.log(chalk.blue('👤 Récupération profil:'), req.user.email);

    const profile = await queryOne(`
        SELECT 
            u.id,
            u.email,
            u.first_name,
            u.last_name,
            u.phone,
            u.date_of_birth,
            u.profile_image,
            u.role,
            u.created_at,
            u.last_login,
            sp.company,
            sp.job_title,
            sp.experience_level,
            sp.learning_goals,
            sp.preferred_learning_style,
            sp.timezone,
            sp.language,
            sp.accessibility_options
        FROM users u
        LEFT JOIN student_profiles sp ON u.id = sp.user_id
        WHERE u.id = $1
    `, [userId]);

    if (!profile) {
        return res.status(404).json({
            success: false,
            error: 'Profil utilisateur non trouvé',
            code: 'PROFILE_NOT_FOUND'
        });
    }

    console.log(chalk.green('✅ Profil récupéré'));

    res.json({
        success: true,
        data: profile
    });
}));

// ===================================================
// ✏️ MISE À JOUR DU PROFIL
// ===================================================

const updateProfileValidation = [
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .matches(/^[a-zA-ZÀ-ÿ\s\-']+$/)
        .withMessage('Prénom invalide'),
    
    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .matches(/^[a-zA-ZÀ-ÿ\s\-']+$/)
        .withMessage('Nom invalide'),
    
    body('phone')
        .optional()
        .isMobilePhone('fr-FR')
        .withMessage('Numéro de téléphone invalide'),
    
    body('dateOfBirth')
        .optional()
        .isDate()
        .withMessage('Date de naissance invalide'),
    
    body('company')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Nom d\'entreprise trop long'),
    
    body('jobTitle')
        .optional()
        .trim()
        .isLength({ max: 150 })
        .withMessage('Titre de poste trop long')
];

router.put('/profile', updateProfileValidation, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    console.log(chalk.blue('✏️ Mise à jour profil:'), req.user.email);

    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Données de profil invalides',
            details: errors.array(),
            code: 'VALIDATION_ERROR'
        });
    }

    const {
        firstName,
        lastName,
        phone,
        dateOfBirth,
        company,
        jobTitle,
        experienceLevel,
        learningGoals,
        preferredLearningStyle,
        timezone,
        language
    } = req.body;

    // Mise à jour des données utilisateur principales
    const userUpdates = {};
    if (firstName !== undefined) userUpdates.first_name = firstName;
    if (lastName !== undefined) userUpdates.last_name = lastName;
    if (phone !== undefined) userUpdates.phone = phone;
    if (dateOfBirth !== undefined) userUpdates.date_of_birth = dateOfBirth;

    let updatedUser = null;
    if (Object.keys(userUpdates).length > 0) {
        updatedUser = await update('users', userId, userUpdates);
    }

    // Mise à jour du profil étudiant (si applicable)
    if (req.user.role === 'student') {
        const profileUpdates = {};
        if (company !== undefined) profileUpdates.company = company;
        if (jobTitle !== undefined) profileUpdates.job_title = jobTitle;
        if (experienceLevel !== undefined) profileUpdates.experience_level = experienceLevel;
        if (learningGoals !== undefined) profileUpdates.learning_goals = learningGoals;
        if (preferredLearningStyle !== undefined) profileUpdates.preferred_learning_style = preferredLearningStyle;
        if (timezone !== undefined) profileUpdates.timezone = timezone;
        if (language !== undefined) profileUpdates.language = language;

        if (Object.keys(profileUpdates).length > 0) {
            await query(`
                INSERT INTO student_profiles (user_id, ${Object.keys(profileUpdates).join(', ')}, updated_at)
                VALUES ($1, ${Object.keys(profileUpdates).map((_, i) => `$${i + 2}`).join(', ')}, CURRENT_TIMESTAMP)
                ON CONFLICT (user_id) 
                DO UPDATE SET 
                    ${Object.keys(profileUpdates).map((key, i) => `${key} = $${i + 2}`).join(', ')},
                    updated_at = CURRENT_TIMESTAMP
            `, [userId, ...Object.values(profileUpdates)]);
        }
    }

    // Log de l'activité
    await query(`
        INSERT INTO user_activities (
            user_id, action, resource_type, metadata, 
            ip_address, user_agent, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
    `, [
        userId,
        'profile_updated',
        'user',
        JSON.stringify({ updated_fields: [...Object.keys(userUpdates), ...Object.keys(req.body)] }),
        req.ip,
        req.get('User-Agent')
    ]);

    console.log(chalk.green('✅ Profil mis à jour'));

    res.json({
        success: true,
        message: 'Profil mis à jour avec succès',
        data: updatedUser || { id: userId }
    });
}));

// ===================================================
// 📊 STATISTIQUES UTILISATEUR
// ===================================================

router.get('/stats', asyncHandler(async (req, res) => {
    const userId = req.user.id;
    console.log(chalk.blue('📊 Récupération statistiques:'), req.user.email);

    // Statistiques des inscriptions
    const enrollmentStats = await queryOne(`
        SELECT 
            COUNT(*) as total_enrollments,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_formations,
            COUNT(CASE WHEN status = 'active' THEN 1 END) as active_formations,
            COUNT(CASE WHEN status = 'paused' THEN 1 END) as paused_formations,
            COALESCE(AVG(progress_percentage), 0) as avg_progress,
            COALESCE(SUM(time_spent), 0) as total_time_spent,
            COALESCE(AVG(final_score), 0) as avg_final_score
        FROM enrollments
        WHERE user_id = $1
    `, [userId]);

    // Badges obtenus
    const badgeStats = await queryOne(`
        SELECT 
            COUNT(*) as total_badges,
            SUM(b.points) as total_points
        FROM user_badges ub
        JOIN badges b ON ub.badge_id = b.id
        WHERE ub.user_id = $1
    `, [userId]);

    // Certificats
    const certificateCount = await queryOne(`
        SELECT COUNT(*) as total_certificates
        FROM certificates c
        JOIN enrollments e ON c.enrollment_id = e.id
        WHERE e.user_id = $1 AND c.status = 'issued'
    `, [userId]);

    // Activités récentes
    const recentActivities = await queryMany(`
        SELECT 
            action,
            resource_type,
            created_at,
            metadata
        FROM user_activities
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 5
    `, [userId]);

    // Progression par catégorie
    const categoryProgress = await queryMany(`
        SELECT 
            c.name as category_name,
            c.icon as category_icon,
            COUNT(e.id) as formations_enrolled,
            COUNT(CASE WHEN e.status = 'completed' THEN 1 END) as formations_completed,
            COALESCE(AVG(e.progress_percentage), 0) as avg_progress
        FROM enrollments e
        JOIN formations f ON e.formation_id = f.id
        JOIN categories c ON f.category_id = c.id
        WHERE e.user_id = $1
        GROUP BY c.id, c.name, c.icon
        ORDER BY formations_enrolled DESC
    `, [userId]);

    const stats = {
        enrollments: {
            total: parseInt(enrollmentStats.total_enrollments) || 0,
            completed: parseInt(enrollmentStats.completed_formations) || 0,
            active: parseInt(enrollmentStats.active_formations) || 0,
            paused: parseInt(enrollmentStats.paused_formations) || 0,
            avgProgress: Math.round(parseFloat(enrollmentStats.avg_progress)) || 0,
            totalTimeSpent: parseInt(enrollmentStats.total_time_spent) || 0,
            avgFinalScore: Math.round(parseFloat(enrollmentStats.avg_final_score)) || 0
        },
        badges: {
            total: parseInt(badgeStats.total_badges) || 0,
            totalPoints: parseInt(badgeStats.total_points) || 0
        },
        certificates: {
            total: parseInt(certificateCount.total_certificates) || 0
        },
        recentActivities,
        categoryProgress: categoryProgress.map(cat => ({
            ...cat,
            formations_enrolled: parseInt(cat.formations_enrolled),
            formations_completed: parseInt(cat.formations_completed),
            avg_progress: Math.round(parseFloat(cat.avg_progress))
        }))
    };

    console.log(chalk.green('✅ Statistiques récupérées'));

    res.json({
        success: true,
        data: stats
    });
}));

// ===================================================
// 📚 FORMATIONS DE L'UTILISATEUR
// ===================================================

router.get('/enrollments', asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { status, limit = 20, offset = 0 } = req.query;

    console.log(chalk.blue('📚 Récupération inscriptions:'), req.user.email);

    let whereClause = 'WHERE e.user_id = $1';
    let params = [userId];

    if (status && ['active', 'completed', 'paused'].includes(status)) {
        whereClause += ' AND e.status = $2';
        params.push(status);
    }

    const enrollments = await queryMany(`
        SELECT 
            e.id as enrollment_id,
            e.status,
            e.progress_percentage,
            e.time_spent,
            e.enrolled_at,
            e.started_at,
            e.completed_at,
            e.last_accessed,
            e.final_score,
            f.id as formation_id,
            f.title as formation_title,
            f.slug as formation_slug,
            f.thumbnail,
            f.level,
            f.duration_hours,
            f.rating,
            c.name as category_name,
            c.icon as category_icon,
            c.color as category_color,
            CONCAT(u.first_name, ' ', u.last_name) as instructor_name,
            COUNT(DISTINCT m.id) as total_modules,
            COUNT(DISTINCT mp.id) as completed_modules,
            -- Prochaine étape suggérée
            (
                SELECT m2.title 
                FROM modules m2 
                LEFT JOIN module_progress mp2 ON m2.id = mp2.module_id AND mp2.enrollment_id = e.id
                WHERE m2.formation_id = f.id 
                AND (mp2.status IS NULL OR mp2.status != 'completed')
                ORDER BY m2.sort_order 
                LIMIT 1
            ) as next_module_title
        FROM enrollments e
        JOIN formations f ON e.formation_id = f.id
        LEFT JOIN categories c ON f.category_id = c.id
        LEFT JOIN users u ON f.instructor_id = u.id
        LEFT JOIN modules m ON f.id = m.formation_id
        LEFT JOIN module_progress mp ON m.id = mp.module_id AND mp.enrollment_id = e.id AND mp.status = 'completed'
        ${whereClause}
        GROUP BY e.id, f.id, c.id, u.id
        ORDER BY 
            CASE 
                WHEN e.status = 'active' THEN 1
                WHEN e.status = 'paused' THEN 2
                WHEN e.status = 'completed' THEN 3
                ELSE 4
            END,
            e.last_accessed DESC NULLS LAST,
            e.enrolled_at DESC
        LIMIT ${params.length + 1} OFFSET ${params.length + 2}
    `, [...params, parseInt(limit), parseInt(offset)]);

    console.log(chalk.green(`✅ ${enrollments.length} inscriptions récupérées`));

    res.json({
        success: true,
        data: {
            enrollments: enrollments.map(e => ({
                ...e,
                total_modules: parseInt(e.total_modules),
                completed_modules: parseInt(e.completed_modules),
                completion_rate: e.total_modules > 0 ? 
                    Math.round((e.completed_modules / e.total_modules) * 100) : 0
            })),
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        }
    });
}));

// ===================================================
// 📜 CERTIFICATS DE L'UTILISATEUR
// ===================================================

router.get('/certificates', asyncHandler(async (req, res) => {
    const userId = req.user.id;
    console.log(chalk.blue('📜 Récupération certificats:'), req.user.email);

    const certificates = await queryMany(`
        SELECT 
            c.id,
            c.certificate_number,
            c.issued_at,
            c.pdf_url,
            c.verification_url,
            c.expires_at,
            c.status,
            f.title as formation_title,
            f.slug as formation_slug,
            f.thumbnail as formation_thumbnail,
            cat.name as category_name,
            cat.icon as category_icon,
            e.final_score,
            e.completed_at
        FROM certificates c
        JOIN enrollments e ON c.enrollment_id = e.id
        JOIN formations f ON e.formation_id = f.id
        LEFT JOIN categories cat ON f.category_id = cat.id
        WHERE e.user_id = $1 AND c.status = 'issued'
        ORDER BY c.issued_at DESC
    `, [userId]);

    console.log(chalk.green(`✅ ${certificates.length} certificats récupérés`));

    res.json({
        success: true,
        data: certificates
    });
}));

// ===================================================
// 🏆 BADGES DE L'UTILISATEUR
// ===================================================

router.get('/badges', asyncHandler(async (req, res) => {
    const userId = req.user.id;
    console.log(chalk.blue('🏆 Récupération badges:'), req.user.email);

    const badges = await queryMany(`
        SELECT 
            b.id,
            b.name,
            b.description,
            b.icon,
            b.badge_type,
            b.points,
            ub.earned_at,
            ub.metadata as earn_metadata,
            f.title as formation_title
        FROM user_badges ub
        JOIN badges b ON ub.badge_id = b.id
        LEFT JOIN formations f ON ub.formation_id = f.id
        WHERE ub.user_id = $1
        ORDER BY ub.earned_at DESC
    `, [userId]);

    // Badges disponibles à débloquer
    const availableBadges = await queryMany(`
        SELECT 
            b.id,
            b.name,
            b.description,
            b.icon,
            b.badge_type,
            b.points,
            b.criteria
        FROM badges b
        WHERE b.is_active = true
        AND b.id NOT IN (
            SELECT badge_id FROM user_badges WHERE user_id = $1
        )
        ORDER BY b.points ASC
        LIMIT 5
    `, [userId]);

    console.log(chalk.green(`✅ ${badges.length} badges obtenus, ${availableBadges.length} disponibles`));

    res.json({
        success: true,
        data: {
            earned: badges,
            available: availableBadges,
            totalPoints: badges.reduce((sum, badge) => sum + (badge.points || 0), 0)
        }
    });
}));

// ===================================================
// 🎯 PROGRESSION DÉTAILLÉE D'UNE FORMATION
// ===================================================

router.get('/enrollments/:enrollmentId/progress', asyncHandler(async (req, res) => {
    const { enrollmentId } = req.params;
    const userId = req.user.id;

    console.log(chalk.blue('🎯 Récupération progression détaillée:'), enrollmentId);

    // Vérifier que l'inscription appartient à l'utilisateur
    const enrollment = await queryOne(`
        SELECT e.*, f.title as formation_title, f.pass_percentage
        FROM enrollments e
        JOIN formations f ON e.formation_id = f.id
        WHERE e.id = $1 AND e.user_id = $2
    `, [enrollmentId, userId]);

    if (!enrollment) {
        return res.status(404).json({
            success: false,
            error: 'Inscription non trouvée',
            code: 'ENROLLMENT_NOT_FOUND'
        });
    }

    // Progression par module
    const moduleProgress = await queryMany(`
        SELECT 
            m.id,
            m.title,
            m.description,
            m.module_type,
            m.estimated_duration,
            m.sort_order,
            m.is_mandatory,
            mp.status,
            mp.started_at,
            mp.completed_at,
            mp.time_spent,
            mp.progress_percentage,
            mp.video_watched_duration,
            mp.notes,
            mp.bookmarked,
            -- Résultats de quiz si applicable
            qa.score as quiz_score,
            qa.passed as quiz_passed,
            qa.attempt_number as quiz_attempts
        FROM modules m
        LEFT JOIN module_progress mp ON m.id = mp.module_id AND mp.enrollment_id = $1
        LEFT JOIN quizzes q ON m.id = q.module_id
        LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id AND qa.enrollment_id = $1 
            AND qa.id = (
                SELECT id FROM quiz_attempts qa2 
                WHERE qa2.quiz_id = q.id AND qa2.enrollment_id = $1 
                ORDER BY qa2.attempt_number DESC LIMIT 1
            )
        WHERE m.formation_id = $2
        ORDER BY m.sort_order
    `, [enrollmentId, enrollment.formation_id]);

    // Calcul des statistiques
    const totalModules = moduleProgress.length;
    const completedModules = moduleProgress.filter(m => m.status === 'completed').length;
    const inProgressModules = moduleProgress.filter(m => m.status === 'in_progress').length;
    const totalTimeSpent = moduleProgress.reduce((sum, m) => sum + (m.time_spent || 0), 0);

    console.log(chalk.green('✅ Progression détaillée récupérée'));

    res.json({
        success: true,
        data: {
            enrollment: {
                ...enrollment,
                totalModules,
                completedModules,
                inProgressModules,
                totalTimeSpent,
                completionRate: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0
            },
            moduleProgress: moduleProgress.map(m => ({
                ...m,
                canAccess: m.sort_order === 1 || // Premier module toujours accessible
                    moduleProgress
                        .filter(prev => prev.sort_order < m.sort_order)
                        .every(prev => prev.status === 'completed' || !prev.is_mandatory)
            }))
        }
    });
}));

// ===================================================
// 🔖 MARQUER/DÉMARQUER UN MODULE COMME FAVORI
// ===================================================

router.post('/modules/:moduleId/bookmark', asyncHandler(async (req, res) => {
    const { moduleId } = req.params;
    const userId = req.user.id;
    const { bookmarked = true } = req.body;

    console.log(chalk.blue('🔖 Marquer module favori:'), moduleId, bookmarked);

    // Vérifier que l'utilisateur a accès à ce module
    const moduleAccess = await queryOne(`
        SELECT mp.id, m.title
        FROM module_progress mp
        JOIN modules m ON mp.module_id = m.id
        JOIN enrollments e ON mp.enrollment_id = e.id
        WHERE mp.module_id = $1 AND e.user_id = $2
    `, [moduleId, userId]);

    if (!moduleAccess) {
        return res.status(404).json({
            success: false,
            error: 'Module non trouvé ou non accessible',
            code: 'MODULE_NOT_ACCESSIBLE'
        });
    }

    await query(`
        UPDATE module_progress 
        SET bookmarked = $1, updated_at = CURRENT_TIMESTAMP
        WHERE module_id = $2 
        AND enrollment_id IN (
            SELECT id FROM enrollments WHERE user_id = $3
        )
    `, [bookmarked, moduleId, userId]);

    console.log(chalk.green('✅ Favori mis à jour'));

    res.json({
        success: true,
        message: `Module ${bookmarked ? 'ajouté aux' : 'retiré des'} favoris`,
        data: {
            moduleId,
            bookmarked,
            moduleTitle: moduleAccess.title
        }
    });
}));

// ===================================================
// 📝 AJOUTER/MODIFIER DES NOTES SUR UN MODULE
// ===================================================

router.put('/modules/:moduleId/notes', [
    body('notes').trim().isLength({ max: 2000 }).withMessage('Notes trop longues (max 2000 caractères)')
], asyncHandler(async (req, res) => {
    const { moduleId } = req.params;
    const userId = req.user.id;
    const { notes } = req.body;

    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Données invalides',
            details: errors.array()
        });
    }

    console.log(chalk.blue('📝 Mise à jour notes module:'), moduleId);

    const result = await query(`
        UPDATE module_progress 
        SET notes = $1, updated_at = CURRENT_TIMESTAMP
        WHERE module_id = $2 
        AND enrollment_id IN (
            SELECT id FROM enrollments WHERE user_id = $3
        )
        RETURNING id
    `, [notes, moduleId, userId]);

    if (result.rowCount === 0) {
        return res.status(404).json({
            success: false,
            error: 'Module non trouvé ou non accessible',
            code: 'MODULE_NOT_ACCESSIBLE'
        });
    }

    console.log(chalk.green('✅ Notes mises à jour'));

    res.json({
        success: true,
        message: 'Notes sauvegardées avec succès',
        data: {
            moduleId,
            notes
        }
    });
}));

// ===================================================
// 🗑️ SUPPRIMER LE COMPTE UTILISATEUR
// ===================================================

router.delete('/account', [
    body('confirmation').equals('DELETE').withMessage('Confirmation requise')
], asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { confirmation } = req.body;

    console.log(chalk.yellow('🗑️ Demande suppression compte:'), req.user.email);

    if (confirmation !== 'DELETE') {
        return res.status(400).json({
            success: false,
            error: 'Confirmation de suppression invalide',
            code: 'INVALID_CONFIRMATION'
        });
    }

    // Marquer le compte comme supprimé au lieu de le supprimer définitivement
    await query(`
        UPDATE users 
        SET 
            status = 'inactive',
            email = CONCAT('deleted_', id, '@formapro.local'),
            first_name = 'Utilisateur',
            last_name = 'Supprimé',
            phone = NULL,
            profile_image = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
    `, [userId]);

    // Log de la suppression
    await query(`
        INSERT INTO user_activities (
            user_id, action, resource_type, metadata, 
            ip_address, user_agent, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
    `, [
        userId,
        'account_deleted',
        'user',
        JSON.stringify({ deletion_method: 'self_service' }),
        req.ip,
        req.get('User-Agent')
    ]);

    console.log(chalk.red('❌ Compte supprimé:'), req.user.email);

    res.json({
        success: true,
        message: 'Votre compte a été supprimé avec succès'
    });
}));

// ===================================================
// 📱 PRÉFÉRENCES DE NOTIFICATION
// ===================================================

router.get('/preferences/notifications', asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const preferences = await queryOne(`
        SELECT preferences
        FROM users
        WHERE id = $1
    `, [userId]);

    res.json({
        success: true,
        data: preferences?.preferences?.notifications || {
            email_formations: true,
            email_reminders: true,
            email_achievements: true,
            push_formations: true,
            push_reminders: true,
            push_achievements: true
        }
    });
}));

router.put('/preferences/notifications', asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const notifications = req.body;

    await query(`
        UPDATE users 
        SET preferences = COALESCE(preferences, '{}'::jsonb) || jsonb_build_object('notifications', $1),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
    `, [JSON.stringify(notifications), userId]);

    res.json({
        success: true,
        message: 'Préférences de notification mises à jour'
    });
}));

export default router;