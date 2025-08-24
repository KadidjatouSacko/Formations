// ===================================================
// ⚙️ ROUTES ADMINISTRATEUR - MODULES ES6
// ===================================================

import express from 'express';
import { query, queryOne, queryMany } from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import chalk from 'chalk';

const router = express.Router();

// Toutes les routes admin nécessitent une authentification et le rôle admin
router.use(authenticateToken);
router.use(requireRole(['admin', 'super_admin']));

// ===================================================
// 📊 DASHBOARD ADMINISTRATEUR
// ===================================================

router.get('/dashboard', asyncHandler(async (req, res) => {
    console.log(chalk.blue('📊 Dashboard admin par:'), req.user.email);

    // Statistiques générales
    const generalStats = await queryOne(`
        SELECT 
            (SELECT COUNT(*) FROM users WHERE status = 'active') as total_users,
            (SELECT COUNT(*) FROM users WHERE role = 'student' AND status = 'active') as total_students,
            (SELECT COUNT(*) FROM users WHERE role = 'instructor' AND status = 'active') as total_instructors,
            (SELECT COUNT(*) FROM formations WHERE status = 'published') as total_formations,
            (SELECT COUNT(*) FROM enrollments) as total_enrollments,
            (SELECT COUNT(*) FROM enrollments WHERE status = 'completed') as completed_enrollments,
            (SELECT COUNT(*) FROM certificates WHERE status = 'issued') as total_certificates,
            (SELECT COALESCE(AVG(rating), 0) FROM formations WHERE status = 'published') as avg_formation_rating
    `);

    // Inscriptions par mois (6 derniers mois)
    const monthlyEnrollments = await queryMany(`
        SELECT 
            DATE_TRUNC('month', enrolled_at) as month,
            COUNT(*) as enrollments
        FROM enrollments
        WHERE enrolled_at >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', enrolled_at)
        ORDER BY month
    `);

    // Formations les plus populaires
    const popularFormations = await queryMany(`
        SELECT 
            f.id,
            f.title,
            f.rating,
            COUNT(e.id) as total_enrollments,
            COUNT(CASE WHEN e.status = 'completed' THEN 1 END) as completed_enrollments
        FROM formations f
        LEFT JOIN enrollments e ON f.id = e.formation_id
        WHERE f.status = 'published'
        GROUP BY f.id, f.title, f.rating
        ORDER BY total_enrollments DESC
        LIMIT 5
    `);

    // Activité récente
    const recentActivity = await queryMany(`
        SELECT 
            ua.action,
            ua.created_at,
            ua.resource_type,
            CONCAT(u.first_name, ' ', u.last_name) as user_name,
            u.email
        FROM user_activities ua
        JOIN users u ON ua.user_id = u.id
        ORDER BY ua.created_at DESC
        LIMIT 10
    `);

    // Catégories avec statistiques
    const categoryStats = await queryMany(`
        SELECT 
            c.name,
            c.icon,
            COUNT(f.id) as formation_count,
            COUNT(e.id) as total_enrollments,
            COALESCE(AVG(f.rating), 0) as avg_rating
        FROM categories c
        LEFT JOIN formations f ON c.id = f.category_id AND f.status = 'published'
        LEFT JOIN enrollments e ON f.id = e.formation_id
        WHERE c.is_active = true
        GROUP BY c.id, c.name, c.icon
        ORDER BY formation_count DESC
    `);

    console.log(chalk.green('✅ Dashboard admin récupéré'));

    res.json({
        success: true,
        data: {
            generalStats: {
                totalUsers: parseInt(generalStats.total_users),
                totalStudents: parseInt(generalStats.total_students),
                totalInstructors: parseInt(generalStats.total_instructors),
                totalFormations: parseInt(generalStats.total_formations),
                totalEnrollments: parseInt(generalStats.total_enrollments),
                completedEnrollments: parseInt(generalStats.completed_enrollments),
                totalCertificates: parseInt(generalStats.total_certificates),
                avgFormationRating: parseFloat(generalStats.avg_formation_rating).toFixed(2),
                completionRate: generalStats.total_enrollments > 0 
                    ? Math.round((generalStats.completed_enrollments / generalStats.total_enrollments) * 100)
                    : 0
            },
            monthlyEnrollments: monthlyEnrollments.map(m => ({
                month: m.month,
                enrollments: parseInt(m.enrollments)
            })),
            popularFormations: popularFormations.map(f => ({
                ...f,
                total_enrollments: parseInt(f.total_enrollments),
                completed_enrollments: parseInt(f.completed_enrollments),
                completion_rate: f.total_enrollments > 0 
                    ? Math.round((f.completed_enrollments / f.total_enrollments) * 100)
                    : 0
            })),
            recentActivity,
            categoryStats: categoryStats.map(c => ({
                ...c,
                formation_count: parseInt(c.formation_count),
                total_enrollments: parseInt(c.total_enrollments),
                avg_rating: parseFloat(c.avg_rating).toFixed(2)
            }))
        }
    });
}));

// ===================================================
// 👥 GESTION DES UTILISATEURS
// ===================================================

router.get('/users', asyncHandler(async (req, res) => {
    const { 
        role, 
        status, 
        search, 
        limit = 50, 
        offset = 0,
        sort = 'created_at',
        order = 'DESC' 
    } = req.query;

    console.log(chalk.blue('👥 Liste des utilisateurs - Admin'));

    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    // Filtres
    if (role && ['student', 'instructor', 'admin'].includes(role)) {
        whereConditions.push(`u.role = $${paramIndex}`);
        params.push(role);
        paramIndex++;
    }

    if (status && ['active', 'inactive', 'suspended'].includes(status)) {
        whereConditions.push(`u.status = $${paramIndex}`);
        params.push(status);
        paramIndex++;
    }

    if (search) {
        whereConditions.push(`(
            u.first_name ILIKE $${paramIndex} OR 
            u.last_name ILIKE $${paramIndex} OR 
            u.email ILIKE $${paramIndex}
        )`);
        params.push(`%${search}%`);
        paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

    const users = await queryMany(`
        SELECT 
            u.id,
            u.email,
            u.first_name,
            u.last_name,
            u.role,
            u.status,
            u.created_at,
            u.last_login,
            u.login_attempts,
            COUNT(DISTINCT e.id) as total_enrollments,
            COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.id END) as completed_enrollments,
            COUNT(DISTINCT c.id) as total_certificates
        FROM users u
        LEFT JOIN enrollments e ON u.id = e.user_id
        LEFT JOIN certificates c ON e.id = c.enrollment_id AND c.status = 'issued'
        ${whereClause}
        GROUP BY u.id
        ORDER BY u.${['created_at', 'last_login', 'first_name', 'last_name'].includes(sort) ? sort : 'created_at'} ${order === 'ASC' ? 'ASC' : 'DESC'}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, parseInt(limit), parseInt(offset)]);

    // Compter le total pour la pagination
    const totalResult = await queryOne(`
        SELECT COUNT(*) as total
        FROM users u
        ${whereClause}
    `, params);

    console.log(chalk.green(`✅ ${users.length} utilisateurs récupérés`));

    res.json({
        success: true,
        data: {
            users: users.map(u => ({
                ...u,
                total_enrollments: parseInt(u.total_enrollments),
                completed_enrollments: parseInt(u.completed_enrollments),
                total_certificates: parseInt(u.total_certificates)
            })),
            pagination: {
                total: parseInt(totalResult.total),
                limit: parseInt(limit),
                offset: parseInt(offset),
                pages: Math.ceil(totalResult.total / limit)
            }
        }
    });
}));

// ===================================================
// 📚 GESTION DES FORMATIONS
// ===================================================

router.get('/formations', asyncHandler(async (req, res) => {
    const { 
        status, 
        category, 
        instructor,
        search,
        limit = 50, 
        offset = 0 
    } = req.query;

    console.log(chalk.blue('📚 Liste des formations - Admin'));

    let whereConditions = ['1=1']; // Base condition
    let params = [];
    let paramIndex = 1;

    if (status && ['draft', 'published', 'archived'].includes(status)) {
        whereConditions.push(`f.status = $${paramIndex}`);
        params.push(status);
        paramIndex++;
    }

    if (category) {
        whereConditions.push(`c.slug = $${paramIndex}`);
        params.push(category);
        paramIndex++;
    }

    if (instructor) {
        whereConditions.push(`u.id = $${paramIndex}`);
        params.push(instructor);
        paramIndex++;
    }

    if (search) {
        whereConditions.push(`(
            f.title ILIKE $${paramIndex} OR 
            f.description ILIKE $${paramIndex}
        )`);
        params.push(`%${search}%`);
        paramIndex++;
    }

    const formations = await queryMany(`
        SELECT 
            f.id,
            f.title,
            f.status,
            f.level,
            f.price,
            f.is_free,
            f.rating,
            f.total_students,
            f.total_ratings,
            f.created_at,
            f.updated_at,
            f.published_at,
            c.name as category_name,
            c.icon as category_icon,
            CONCAT(u.first_name, ' ', u.last_name) as instructor_name,
            COUNT(DISTINCT m.id) as total_modules,
            COUNT(DISTINCT e.id) as total_enrollments,
            COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.id END) as completed_enrollments,
            COUNT(DISTINCT r.id) as total_reviews
        FROM formations f
        LEFT JOIN categories c ON f.category_id = c.id
        LEFT JOIN users u ON f.instructor_id = u.id
        LEFT JOIN modules m ON f.id = m.formation_id
        LEFT JOIN enrollments e ON f.id = e.formation_id
        LEFT JOIN reviews r ON f.id = r.formation_id AND r.is_published = true
        WHERE ${whereConditions.join(' AND ')}
        GROUP BY f.id, c.id, u.id
        ORDER BY f.updated_at DESC
        LIMIT ${paramIndex} OFFSET ${paramIndex + 1}
    `, [...params, parseInt(limit), parseInt(offset)]);

    console.log(chalk.green(`✅ ${formations.length} formations récupérées`));

    res.json({
        success: true,
        data: formations.map(f => ({
            ...f,
            total_modules: parseInt(f.total_modules),
            total_enrollments: parseInt(f.total_enrollments),
            completed_enrollments: parseInt(f.completed_enrollments),
            total_reviews: parseInt(f.total_reviews),
            completion_rate: f.total_enrollments > 0 
                ? Math.round((f.completed_enrollments / f.total_enrollments) * 100)
                : 0
        }))
    });
}));

// ===================================================
// 📋 DÉTAILS D'UNE FORMATION (ADMIN)
// ===================================================

router.get('/formations/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    console.log(chalk.blue('📋 Détails formation admin:'), id);

    // Formation avec toutes les infos
    const formation = await queryOne(`
        SELECT 
            f.*,
            c.name as category_name,
            CONCAT(u.first_name, ' ', u.last_name) as instructor_name,
            u.email as instructor_email
        FROM formations f
        LEFT JOIN categories c ON f.category_id = c.id
        LEFT JOIN users u ON f.instructor_id = u.id
        WHERE f.id = $1
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
            m.*,
            COUNT(DISTINCT mp.id) as total_progress,
            COUNT(DISTINCT CASE WHEN mp.status = 'completed' THEN mp.id END) as completed_progress
        FROM modules m
        LEFT JOIN module_progress mp ON m.id = mp.module_id
        WHERE m.formation_id = $1
        GROUP BY m.id
        ORDER BY m.sort_order
    `, [id]);

    // Statistiques d'inscription
    const enrollmentStats = await queryMany(`
        SELECT 
            DATE_TRUNC('month', enrolled_at) as month,
            COUNT(*) as enrollments,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
        FROM enrollments
        WHERE formation_id = $1
        AND enrolled_at >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', enrolled_at)
        ORDER BY month
    `, [id]);

    // Avis récents
    const recentReviews = await queryMany(`
        SELECT 
            r.*,
            CONCAT(u.first_name, ' ', LEFT(u.last_name, 1), '.') as reviewer_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.formation_id = $1
        ORDER BY r.created_at DESC
        LIMIT 5
    `, [id]);

    console.log(chalk.green('✅ Détails formation récupérés'));

    res.json({
        success: true,
        data: {
            formation,
            modules: modules.map(m => ({
                ...m,
                total_progress: parseInt(m.total_progress),
                completed_progress: parseInt(m.completed_progress),
                completion_rate: m.total_progress > 0 
                    ? Math.round((m.completed_progress / m.total_progress) * 100)
                    : 0
            })),
            enrollmentStats: enrollmentStats.map(es => ({
                month: es.month,
                enrollments: parseInt(es.enrollments),
                completed: parseInt(es.completed)
            })),
            recentReviews
        }
    });
}));

// ===================================================
// 🔄 MODIFIER LE STATUT D'UNE FORMATION
// ===================================================

router.patch('/formations/:id/status', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['draft', 'published', 'archived', 'suspended'].includes(status)) {
        return res.status(400).json({
            success: false,
            error: 'Statut invalide',
            code: 'INVALID_STATUS'
        });
    }

    console.log(chalk.blue('🔄 Modification statut formation:'), id, 'vers', status);

    const result = await query(`
        UPDATE formations 
        SET 
            status = $1,
            published_at = CASE 
                WHEN $1 = 'published' AND published_at IS NULL THEN CURRENT_TIMESTAMP
                ELSE published_at
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING title
    `, [status, id]);

    if (result.rowCount === 0) {
        return res.status(404).json({
            success: false,
            error: 'Formation non trouvée',
            code: 'FORMATION_NOT_FOUND'
        });
    }

    // Log de l'activité admin
    await query(`
        INSERT INTO user_activities (
            user_id, action, resource_type, resource_id,
            metadata, ip_address, user_agent, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
    `, [
        req.user.id,
        'formation_status_changed',
        'formation',
        id,
        JSON.stringify({ 
            new_status: status,
            formation_title: result.rows[0].title,
            admin_action: true
        }),
        req.ip,
        req.get('User-Agent')
    ]);

    console.log(chalk.green('✅ Statut formation modifié'));

    res.json({
        success: true,
        message: `Statut de la formation modifié vers "${status}"`,
        data: {
            formationId: id,
            newStatus: status,
            formationTitle: result.rows[0].title
        }
    });
}));

// ===================================================
// 📊 STATISTIQUES DÉTAILLÉES
// ===================================================

router.get('/stats/detailed', asyncHandler(async (req, res) => {
    const { period = '30d' } = req.query;
    
    console.log(chalk.blue('📊 Statistiques détaillées - période:'), period);

    // Calculer la période
    let dateFilter = '';
    switch (period) {
        case '7d':
            dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '7 days'";
            break;
        case '30d':
            dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '30 days'";
            break;
        case '90d':
            dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '90 days'";
            break;
        case '1y':
            dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '1 year'";
            break;
        default:
            dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '30 days'";
    }

    // Nouveaux utilisateurs
    const newUsers = await queryOne(`
        SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN role = 'student' THEN 1 END) as students,
            COUNT(CASE WHEN role = 'instructor' THEN 1 END) as instructors
        FROM users
        WHERE status = 'active' ${dateFilter}
    `);

    // Nouvelles inscriptions
    const newEnrollments = await queryOne(`
        SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
            COALESCE(AVG(progress_percentage), 0) as avg_progress
        FROM enrollments
        WHERE 1=1 ${dateFilter.replace('created_at', 'enrolled_at')}
    `);

    // Top formations par inscription
    const topFormationsByEnrollment = await queryMany(`
        SELECT 
            f.title,
            f.rating,
            COUNT(e.id) as enrollments,
            COUNT(CASE WHEN e.status = 'completed' THEN 1 END) as completions
        FROM formations f
        JOIN enrollments e ON f.id = e.formation_id
        WHERE f.status = 'published' ${dateFilter.replace('created_at', 'e.enrolled_at')}
        GROUP BY f.id, f.title, f.rating
        ORDER BY enrollments DESC
        LIMIT 10
    `);

    // Activité par jour
    const dailyActivity = await queryMany(`
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as activities
        FROM user_activities
        WHERE 1=1 ${dateFilter}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
    `);

    // Statistiques de completion par catégorie
    const categoryCompletion = await queryMany(`
        SELECT 
            c.name,
            COUNT(e.id) as total_enrollments,
            COUNT(CASE WHEN e.status = 'completed' THEN 1 END) as completions,
            COALESCE(AVG(e.progress_percentage), 0) as avg_progress
        FROM categories c
        JOIN formations f ON c.id = f.category_id
        JOIN enrollments e ON f.id = e.formation_id
        WHERE c.is_active = true ${dateFilter.replace('created_at', 'e.enrolled_at')}
        GROUP BY c.id, c.name
        ORDER BY total_enrollments DESC
    `);

    console.log(chalk.green('✅ Statistiques détaillées récupérées'));

    res.json({
        success: true,
        data: {
            period,
            newUsers: {
                total: parseInt(newUsers.total),
                students: parseInt(newUsers.students),
                instructors: parseInt(newUsers.instructors)
            },
            newEnrollments: {
                total: parseInt(newEnrollments.total),
                completed: parseInt(newEnrollments.completed),
                avgProgress: Math.round(parseFloat(newEnrollments.avg_progress)),
                completionRate: newEnrollments.total > 0 
                    ? Math.round((newEnrollments.completed / newEnrollments.total) * 100)
                    : 0
            },
            topFormationsByEnrollment: topFormationsByEnrollment.map(f => ({
                ...f,
                enrollments: parseInt(f.enrollments),
                completions: parseInt(f.completions),
                completionRate: f.enrollments > 0 
                    ? Math.round((f.completions / f.enrollments) * 100)
                    : 0
            })),
            dailyActivity: dailyActivity.map(d => ({
                date: d.date,
                activities: parseInt(d.activities)
            })),
            categoryCompletion: categoryCompletion.map(c => ({
                ...c,
                total_enrollments: parseInt(c.total_enrollments),
                completions: parseInt(c.completions),
                avg_progress: Math.round(parseFloat(c.avg_progress)),
                completion_rate: c.total_enrollments > 0 
                    ? Math.round((c.completions / c.total_enrollments) * 100)
                    : 0
            }))
        }
    });
}));

// ===================================================
// 🔧 ACTIONS DE MODÉRATION
// ===================================================

// Suspendre/réactiver un utilisateur
router.patch('/users/:userId/status', requireRole(['super_admin']), asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { status, reason } = req.body;

    if (!['active', 'suspended', 'inactive'].includes(status)) {
        return res.status(400).json({
            success: false,
            error: 'Statut invalide',
            code: 'INVALID_STATUS'
        });
    }

    console.log(chalk.blue('🔧 Modification statut utilisateur:'), userId, 'vers', status);

    const result = await query(`
        UPDATE users 
        SET 
            status = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING email, first_name, last_name
    `, [status, userId]);

    if (result.rowCount === 0) {
        return res.status(404).json({
            success: false,
            error: 'Utilisateur non trouvé',
            code: 'USER_NOT_FOUND'
        });
    }

    const user = result.rows[0];

    // Log de l'action de modération
    await query(`
        INSERT INTO user_activities (
            user_id, action, resource_type, resource_id,
            metadata, ip_address, user_agent, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
    `, [
        req.user.id,
        'user_status_changed',
        'user',
        userId,
        JSON.stringify({ 
            new_status: status,
            reason: reason || 'Non spécifié',
            target_user: `${user.first_name} ${user.last_name}`,
            admin_action: true
        }),
        req.ip,
        req.get('User-Agent')
    ]);

    console.log(chalk.green('✅ Statut utilisateur modifié'));

    res.json({
        success: true,
        message: `Statut de l'utilisateur ${user.first_name} ${user.last_name} modifié vers "${status}"`,
        data: {
            userId,
            newStatus: status,
            userEmail: user.email
        }
    });
}));

// ===================================================
// 📈 EXPORT DE DONNÉES
// ===================================================

router.get('/export/users', requireRole(['super_admin']), asyncHandler(async (req, res) => {
    const { format = 'json' } = req.query;
    
    console.log(chalk.blue('📈 Export utilisateurs - format:'), format);

    const users = await queryMany(`
        SELECT 
            u.id,
            u.email,
            u.first_name,
            u.last_name,
            u.role,
            u.status,
            u.created_at,
            u.last_login,
            COUNT(DISTINCT e.id) as total_enrollments,
            COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.id END) as completed_formations
        FROM users u
        LEFT JOIN enrollments e ON u.id = e.user_id
        WHERE u.status != 'deleted'
        GROUP BY u.id
        ORDER BY u.created_at DESC
    `);

    // Log de l'export
    await query(`
        INSERT INTO user_activities (
            user_id, action, resource_type, metadata,
            ip_address, user_agent, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
    `, [
        req.user.id,
        'data_exported',
        'user',
        JSON.stringify({ 
            export_type: 'users',
            format,
            record_count: users.length,
            admin_action: true
        }),
        req.ip,
        req.get('User-Agent')
    ]);

    if (format === 'csv') {
        // Générer du CSV
        const csvHeader = 'ID,Email,Prénom,Nom,Rôle,Statut,Date d\'inscription,Dernière connexion,Inscriptions,Formations terminées\n';
        const csvData = users.map(u => 
            `${u.id},${u.email},"${u.first_name}","${u.last_name}",${u.role},${u.status},${u.created_at},${u.last_login || ''},${u.total_enrollments},${u.completed_formations}`
        ).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="formapro_users_export.csv"');
        res.send(csvHeader + csvData);
    } else {
        res.json({
            success: true,
            data: {
                exportDate: new Date().toISOString(),
                recordCount: users.length,
                users: users.map(u => ({
                    ...u,
                    total_enrollments: parseInt(u.total_enrollments),
                    completed_formations: parseInt(u.completed_formations)
                }))
            }
        });
    }
}));

// ===================================================
// 🧹 MAINTENANCE ET NETTOYAGE
// ===================================================

router.post('/maintenance/cleanup', requireRole(['super_admin']), asyncHandler(async (req, res) => {
    console.log(chalk.blue('🧹 Nettoyage système par:'), req.user.email);

    const results = {};

    // Nettoyer les sessions expirées
    const expiredSessions = await query(`
        DELETE FROM user_sessions 
        WHERE expires_at < CURRENT_TIMESTAMP
    `);
    results.expiredSessions = expiredSessions.rowCount;

    // Nettoyer les anciens tokens de reset
    const expiredResetTokens = await query(`
        UPDATE users 
        SET password_reset_token = NULL, password_reset_expires = NULL
        WHERE password_reset_expires < CURRENT_TIMESTAMP
    `);
    results.expiredResetTokens = expiredResetTokens.rowCount;

    // Nettoyer les anciennes activités (garder 6 mois)
    const oldActivities = await query(`
        DELETE FROM user_activities 
        WHERE created_at < CURRENT_DATE - INTERVAL '6 months'
        AND action NOT IN ('user_registered', 'formation_completed', 'certificate_issued')
    `);
    results.oldActivities = oldActivities.rowCount;

    // Log de la maintenance
    await query(`
        INSERT INTO user_activities (
            user_id, action, resource_type, metadata,
            ip_address, user_agent, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
    `, [
        req.user.id,
        'system_maintenance',
        'system',
        JSON.stringify({ 
            cleanup_results: results,
            admin_action: true
        }),
        req.ip,
        req.get('User-Agent')
    ]);

    console.log(chalk.green('✅ Nettoyage système terminé'));

    res.json({
        success: true,
        message: 'Nettoyage système effectué avec succès',
        data: {
            cleanupResults: results,
            totalItemsCleaned: Object.values(results).reduce((sum, count) => sum + count, 0)
        }
    });
}));

export default router;