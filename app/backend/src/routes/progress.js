// ===================================================
// 🎯 ROUTES DE PROGRESSION - MODULES ES6
// ===================================================

import express from 'express';
import { body, validationResult } from 'express-validator';
import { query, queryOne, queryMany, transaction } from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken, logUserAction } from '../middleware/auth.js';
import chalk from 'chalk';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// ===================================================
// ▶️ DÉMARRER UN MODULE
// ===================================================

router.post('/module/:moduleId/start', asyncHandler(async (req, res) => {
    const { moduleId } = req.params;
    const userId = req.user.id;

    console.log(chalk.blue('▶️ Démarrage module:'), moduleId, 'par', req.user.email);

    // Vérifier que l'utilisateur a accès au module
    const moduleInfo = await queryOne(`
        SELECT 
            m.id,
            m.title,
            m.formation_id,
            m.sort_order,
            m.is_mandatory,
            e.id as enrollment_id,
            e.status as enrollment_status
        FROM modules m
        JOIN formations f ON m.formation_id = f.id
        JOIN enrollments e ON f.id = e.formation_id
        WHERE m.id = $1 
        AND e.user_id = $2 
        AND e.status IN ('active', 'paused')
    `, [moduleId, userId]);

    if (!moduleInfo) {
        return res.status(404).json({
            success: false,
            error: 'Module non trouvé ou non accessible',
            code: 'MODULE_NOT_ACCESSIBLE'
        });
    }

    // Vérifier les prérequis (modules précédents terminés)
    const prerequisiteCheck = await queryOne(`
        SELECT COUNT(*) as missing_prerequisites
        FROM modules m
        LEFT JOIN module_progress mp ON m.id = mp.module_id AND mp.enrollment_id = $1
        WHERE m.formation_id = $2 
        AND m.sort_order < $3 
        AND m.is_mandatory = true
        AND (mp.status IS NULL OR mp.status != 'completed')
    `, [moduleInfo.enrollment_id, moduleInfo.formation_id, moduleInfo.sort_order]);

    if (parseInt(prerequisiteCheck.missing_prerequisites) > 0) {
        return res.status(403).json({
            success: false,
            error: 'Vous devez terminer les modules précédents avant d\'accéder à celui-ci',
            code: 'PREREQUISITES_NOT_MET'
        });
    }

    // Créer ou mettre à jour la progression du module
    const moduleProgress = await queryOne(`
        INSERT INTO module_progress (
            enrollment_id, 
            module_id, 
            status, 
            started_at, 
            progress_percentage,
            created_at
        ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP)
        ON CONFLICT (enrollment_id, module_id) 
        DO UPDATE SET 
            status = CASE 
                WHEN module_progress.status = 'not_started' THEN 'in_progress'
                ELSE module_progress.status
            END,
            started_at = CASE 
                WHEN module_progress.started_at IS NULL THEN CURRENT_TIMESTAMP
                ELSE module_progress.started_at
            END,
            updated_at = CURRENT_TIMESTAMP
        RETURNING *
    `, [moduleInfo.enrollment_id, moduleId, 'in_progress']);

    // Mettre à jour le module actuel dans l'inscription
    await query(`
        UPDATE enrollments 
        SET 
            current_module_id = $1,
            last_accessed = CURRENT_TIMESTAMP
        WHERE id = $2
    `, [moduleId, moduleInfo.enrollment_id]);

    console.log(chalk.green('✅ Module démarré:'), moduleInfo.title);

    res.json({
        success: true,
        message: `Module "${moduleInfo.title}" démarré`,
        data: {
            moduleProgress,
            moduleInfo: {
                id: moduleInfo.id,
                title: moduleInfo.title,
                sortOrder: moduleInfo.sort_order
            }
        }
    });
}));

// ===================================================
// 📊 METTRE À JOUR LA PROGRESSION D'UN MODULE
// ===================================================

const updateProgressValidation = [
    body('progressPercentage')
        .isInt({ min: 0, max: 100 })
        .withMessage('Progression doit être entre 0 et 100'),
    
    body('timeSpent')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Temps passé doit être positif'),
    
    body('videoWatchedDuration')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Durée vidéo regardée doit être positive')
];

router.put('/module/:moduleId/progress', updateProgressValidation, asyncHandler(async (req, res) => {
    const { moduleId } = req.params;
    const userId = req.user.id;
    const { 
        progressPercentage, 
        timeSpent, 
        videoWatchedDuration,
        metadata 
    } = req.body;

    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Données de progression invalides',
            details: errors.array()
        });
    }

    console.log(chalk.blue('📊 Mise à jour progression:'), moduleId, `${progressPercentage}%`);

    await transaction(async (client) => {
        // Vérifier l'accès au module
        const moduleAccess = await client.query(`
            SELECT 
                mp.id as progress_id,
                mp.enrollment_id,
                m.title,
                e.user_id
            FROM module_progress mp
            JOIN modules m ON mp.module_id = m.id
            JOIN enrollments e ON mp.enrollment_id = e.id
            WHERE mp.module_id = $1 AND e.user_id = $2
        `, [moduleId, userId]);

        if (moduleAccess.rows.length === 0) {
            throw new Error('Module non trouvé ou non accessible');
        }

        const { progress_id, enrollment_id, title } = moduleAccess.rows[0];

        // Mettre à jour la progression
        const updatedProgress = await client.query(`
            UPDATE module_progress 
            SET 
                progress_percentage = $1,
                time_spent = COALESCE(time_spent, 0) + COALESCE($2, 0),
                video_watched_duration = GREATEST(COALESCE(video_watched_duration, 0), COALESCE($3, 0)),
                status = CASE 
                    WHEN $1 = 100 THEN 'completed'
                    WHEN $1 > 0 THEN 'in_progress'
                    ELSE status
                END,
                completed_at = CASE 
                    WHEN $1 = 100 AND completed_at IS NULL THEN CURRENT_TIMESTAMP
                    ELSE completed_at
                END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING *
        `, [progressPercentage, timeSpent, videoWatchedDuration, progress_id]);

        // Mettre à jour la progression globale de l'inscription
        const enrollmentProgress = await client.query(`
            SELECT 
                COUNT(*) as total_modules,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_modules,
                AVG(progress_percentage) as avg_progress
            FROM module_progress
            WHERE enrollment_id = $1
        `, [enrollment_id]);

        const { total_modules, completed_modules, avg_progress } = enrollmentProgress.rows[0];
        const globalProgress = Math.round(parseFloat(avg_progress) || 0);
        const isCompleted = parseInt(completed_modules) === parseInt(total_modules);

        await client.query(`
            UPDATE enrollments 
            SET 
                progress_percentage = $1,
                time_spent = (
                    SELECT COALESCE(SUM(time_spent), 0) 
                    FROM module_progress 
                    WHERE enrollment_id = $2
                ),
                status = CASE 
                    WHEN $3 THEN 'completed'
                    ELSE status
                END,
                completed_at = CASE 
                    WHEN $3 AND completed_at IS NULL THEN CURRENT_TIMESTAMP
                    ELSE completed_at
                END,
                last_accessed = CURRENT_TIMESTAMP
            WHERE id = $2
        `, [globalProgress, enrollment_id, isCompleted]);

        // Log de l'activité si module terminé
        if (progressPercentage === 100) {
            await client.query(`
                INSERT INTO user_activities (
                    user_id, action, resource_type, resource_id,
                    metadata, ip_address, user_agent, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
            `, [
                userId,
                'module_completed',
                'module',
                moduleId,
                JSON.stringify({ 
                    module_title: title,
                    time_spent: timeSpent,
                    ...metadata
                }),
                req.ip,
                req.get('User-Agent')
            ]);

            console.log(chalk.green('🎉 Module terminé:'), title);
        }

        return {
            updatedProgress: updatedProgress.rows[0],
            globalProgress,
            isCompleted
        };
    });

    res.json({
        success: true,
        message: progressPercentage === 100 ? 'Module terminé avec succès !' : 'Progression mise à jour',
        data: {
            progressPercentage,
            timeSpent,
            videoWatchedDuration
        }
    });
}));

// ===================================================
// ✅ MARQUER UN MODULE COMME TERMINÉ
// ===================================================

router.post('/module/:moduleId/complete', asyncHandler(async (req, res) => {
    const { moduleId } = req.params;
    const userId = req.user.id;
    const { timeSpent = 0, finalScore, metadata } = req.body;

    console.log(chalk.blue('✅ Finalisation module:'), moduleId);

    await transaction(async (client) => {
        // Vérifier l'accès et récupérer les infos du module
        const moduleInfo = await client.query(`
            SELECT 
                m.id,
                m.title,
                m.formation_id,
                mp.enrollment_id,
                mp.status,
                e.user_id
            FROM modules m
            JOIN module_progress mp ON m.id = mp.module_id
            JOIN enrollments e ON mp.enrollment_id = e.id
            WHERE m.id = $1 AND e.user_id = $2
        `, [moduleId, userId]);

        if (moduleInfo.rows.length === 0) {
            throw new Error('Module non trouvé ou non accessible');
        }

        const { title, enrollment_id, status } = moduleInfo.rows[0];

        if (status === 'completed') {
            throw new Error('Module déjà terminé');
        }

        // Marquer comme terminé
        await client.query(`
            UPDATE module_progress 
            SET 
                status = 'completed',
                progress_percentage = 100,
                completed_at = CURRENT_TIMESTAMP,
                time_spent = COALESCE(time_spent, 0) + $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE module_id = $2 AND enrollment_id = $3
        `, [timeSpent, moduleId, enrollment_id]);

        // Vérifier si la formation est terminée
        const formationProgress = await client.query(`
            SELECT 
                COUNT(*) as total_modules,
                COUNT(CASE WHEN mp.status = 'completed' THEN 1 END) as completed_modules,
                f.pass_percentage
            FROM modules m
            LEFT JOIN module_progress mp ON m.id = mp.module_id AND mp.enrollment_id = $1
            JOIN formations f ON m.formation_id = f.id
            WHERE m.formation_id = (
                SELECT formation_id FROM modules WHERE id = $2
            )
            GROUP BY f.id, f.pass_percentage
        `, [enrollment_id, moduleId]);

        const { total_modules, completed_modules, pass_percentage } = formationProgress.rows[0];
        const completionRate = (parseInt(completed_modules) / parseInt(total_modules)) * 100;
        const formationCompleted = completionRate >= (pass_percentage || 80);

        // Mettre à jour l'inscription
        await client.query(`
            UPDATE enrollments 
            SET 
                progress_percentage = $1,
                status = CASE WHEN $2 THEN 'completed' ELSE 'active' END,
                completed_at = CASE WHEN $2 AND completed_at IS NULL THEN CURRENT_TIMESTAMP ELSE completed_at END,
                final_score = COALESCE($3, final_score),
                last_accessed = CURRENT_TIMESTAMP
            WHERE id = $4
        `, [Math.round(completionRate), formationCompleted, finalScore, enrollment_id]);

        // Log de l'activité
        await client.query(`
            INSERT INTO user_activities (
                user_id, action, resource_type, resource_id,
                metadata, ip_address, user_agent, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        `, [
            userId,
            formationCompleted ? 'formation_completed' : 'module_completed',
            formationCompleted ? 'formation' : 'module',
            formationCompleted ? moduleInfo.rows[0].formation_id : moduleId,
            JSON.stringify({ 
                module_title: title,
                time_spent: timeSpent,
                completion_rate: completionRate,
                ...metadata
            }),
            req.ip,
            req.get('User-Agent')
        ]);

        return { formationCompleted, completionRate, title };
    });

    console.log(chalk.green('✅ Module terminé avec succès'));

    res.json({
        success: true,
        message: 'Module terminé avec succès !',
        data: {
            moduleId,
            timeSpent,
            finalScore
        }
    });
}));

// ===================================================
// 🎯 PROGRESSION PAR FORMATION
// ===================================================

router.get('/formation/:formationId', asyncHandler(async (req, res) => {
    const { formationId } = req.params;
    const userId = req.user.id;

    console.log(chalk.blue('🎯 Récupération progression formation:'), formationId);

    // Vérifier l'inscription à la formation
    const enrollment = await queryOne(`
        SELECT 
            e.*,
            f.title as formation_title,
            f.pass_percentage,
            COUNT(DISTINCT m.id) as total_modules
        FROM enrollments e
        JOIN formations f ON e.formation_id = f.id
        LEFT JOIN modules m ON f.id = m.formation_id
        WHERE e.formation_id = $1 AND e.user_id = $2
        GROUP BY e.id, f.id
    `, [formationId, userId]);

    if (!enrollment) {
        return res.status(404).json({
            success: false,
            error: 'Inscription à cette formation non trouvée',
            code: 'ENROLLMENT_NOT_FOUND'
        });
    }

    // Progression détaillée par module
    const moduleProgress = await queryMany(`
        SELECT 
            m.id,
            m.title,
            m.description,
            m.module_type,
            m.estimated_duration,
            m.sort_order,
            m.is_mandatory,
            m.is_preview,
            mp.status,
            mp.progress_percentage,
            mp.time_spent,
            mp.video_watched_duration,
            mp.started_at,
            mp.completed_at,
            mp.bookmarked,
            mp.notes,
            -- Quiz associé s'il y en a un
            q.id as quiz_id,
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
    `, [enrollment.id, formationId]);

    // Statistiques de progression
    const stats = {
        totalModules: moduleProgress.length,
        completedModules: moduleProgress.filter(m => m.status === 'completed').length,
        inProgressModules: moduleProgress.filter(m => m.status === 'in_progress').length,
        notStartedModules: moduleProgress.filter(m => !m.status || m.status === 'not_started').length,
        totalTimeSpent: moduleProgress.reduce((sum, m) => sum + (m.time_spent || 0), 0),
        totalEstimatedDuration: moduleProgress.reduce((sum, m) => sum + (m.estimated_duration || 0), 0),
        quizzesCompleted: moduleProgress.filter(m => m.quiz_passed === true).length,
        totalQuizzes: moduleProgress.filter(m => m.quiz_id).length
    };

    // Prochaine étape recommandée
    const nextModule = moduleProgress.find(m => 
        (!m.status || m.status === 'not_started' || m.status === 'in_progress') &&
        (m.sort_order === 1 || moduleProgress
            .filter(prev => prev.sort_order < m.sort_order && prev.is_mandatory)
            .every(prev => prev.status === 'completed'))
    );

    console.log(chalk.green('✅ Progression formation récupérée'));

    res.json({
        success: true,
        data: {
            enrollment,
            moduleProgress,
            stats,
            nextModule: nextModule ? {
                id: nextModule.id,
                title: nextModule.title,
                sortOrder: nextModule.sort_order,
                moduleType: nextModule.module_type,
                estimatedDuration: nextModule.estimated_duration
            } : null
        }
    });
}));

// ===================================================
// 🎮 ROUTES QUIZ
// ===================================================

// Démarrer un quiz
router.post('/quiz/:quizId/start', asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    const userId = req.user.id;

    console.log(chalk.blue('🎮 Démarrage quiz:'), quizId);

    // Vérifier l'accès au quiz
    const quizInfo = await queryOne(`
        SELECT 
            q.*,
            m.title as module_title,
            e.id as enrollment_id,
            COUNT(qa.id) as previous_attempts
        FROM quizzes q
        JOIN modules m ON q.module_id = m.id
        JOIN formations f ON m.formation_id = f.id
        JOIN enrollments e ON f.id = e.formation_id
        LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id AND qa.enrollment_id = e.id
        WHERE q.id = $1 AND e.user_id = $2
        GROUP BY q.id, m.id, e.id
    `, [quizId, userId]);

    if (!quizInfo) {
        return res.status(404).json({
            success: false,
            error: 'Quiz non trouvé ou non accessible',
            code: 'QUIZ_NOT_ACCESSIBLE'
        });
    }

    // Vérifier le nombre maximum de tentatives
    if (quizInfo.max_attempts && parseInt(quizInfo.previous_attempts) >= quizInfo.max_attempts) {
        return res.status(403).json({
            success: false,
            error: `Nombre maximum de tentatives atteint (${quizInfo.max_attempts})`,
            code: 'MAX_ATTEMPTS_REACHED'
        });
    }

    // Créer une nouvelle tentative de quiz
    const attempt = await queryOne(`
        INSERT INTO quiz_attempts (
            enrollment_id, 
            quiz_id, 
            attempt_number, 
            started_at
        ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        RETURNING *
    `, [
        quizInfo.enrollment_id,
        quizId,
        parseInt(quizInfo.previous_attempts) + 1
    ]);

    // Récupérer les questions (mélangées si configuré)
    const questions = await queryMany(`
        SELECT 
            id, 
            question, 
            question_type, 
            points,
            media_url,
            sort_order
        FROM quiz_questions
        WHERE quiz_id = $1
        ORDER BY ${quizInfo.shuffle_questions ? 'RANDOM()' : 'sort_order'}
    `, [quizId]);

    // Récupérer les options de réponse pour chaque question
    const questionsWithAnswers = await Promise.all(
        questions.map(async (question) => {
            const answers = await queryMany(`
                SELECT id, answer_text, sort_order
                FROM quiz_answers
                WHERE question_id = $1
                ORDER BY ${quizInfo.shuffle_questions ? 'RANDOM()' : 'sort_order'}
            `, [question.id]);

            return {
                ...question,
                answers: answers.map(ans => ({
                    id: ans.id,
                    text: ans.answer_text
                }))
            };
        })
    );

    console.log(chalk.green('✅ Quiz démarré:'), quizInfo.title);

    res.json({
        success: true,
        message: `Quiz "${quizInfo.title}" démarré`,
        data: {
            attempt,
            quiz: {
                id: quizInfo.id,
                title: quizInfo.title,
                description: quizInfo.description,
                instructions: quizInfo.instructions,
                timeLimit: quizInfo.time_limit,
                totalQuestions: questions.length,
                passPercentage: quizInfo.pass_percentage,
                attemptNumber: attempt.attempt_number,
                maxAttempts: quizInfo.max_attempts
            },
            questions: questionsWithAnswers
        }
    });
}));

// Soumettre un quiz
router.post('/quiz/:quizId/submit', [
    body('attemptId').isUUID().withMessage('ID de tentative invalide'),
    body('answers').isObject().withMessage('Réponses requises')
], asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    const { attemptId, answers } = req.body;
    const userId = req.user.id;

    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Données de soumission invalides',
            details: errors.array()
        });
    }

    console.log(chalk.blue('📝 Soumission quiz:'), quizId);

    const result = await transaction(async (client) => {
        // Vérifier que la tentative appartient à l'utilisateur
        const attempt = await client.query(`
            SELECT 
                qa.*,
                q.title as quiz_title,
                q.pass_percentage,
                e.user_id
            FROM quiz_attempts qa
            JOIN quizzes q ON qa.quiz_id = q.id
            JOIN enrollments e ON qa.enrollment_id = e.id
            WHERE qa.id = $1 AND qa.quiz_id = $2 AND e.user_id = $3
        `, [attemptId, quizId, userId]);

        if (attempt.rows.length === 0) {
            throw new Error('Tentative de quiz non trouvée');
        }

        if (attempt.rows[0].completed_at) {
            throw new Error('Quiz déjà soumis');
        }

        const attemptData = attempt.rows[0];

        // Calculer le score
        let totalPoints = 0;
        let obtainedPoints = 0;

        const questions = await client.query(`
            SELECT id, points FROM quiz_questions WHERE quiz_id = $1
        `, [quizId]);

        for (const question of questions.rows) {
            totalPoints += question.points;

            const userAnswer = answers[question.id];
            if (userAnswer) {
                const correctAnswer = await client.query(`
                    SELECT id FROM quiz_answers 
                    WHERE question_id = $1 AND is_correct = true
                `, [question.id]);

                if (correctAnswer.rows.some(ans => ans.id === userAnswer)) {
                    obtainedPoints += question.points;
                }
            }
        }

        const score = totalPoints > 0 ? (obtainedPoints / totalPoints) * 100 : 0;
        const passed = score >= (attemptData.pass_percentage || 80);

        // Mettre à jour la tentative
        await client.query(`
            UPDATE quiz_attempts 
            SET 
                completed_at = CURRENT_TIMESTAMP,
                time_taken = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at)),
                score = $1,
                total_points = $2,
                obtained_points = $3,
                passed = $4,
                answers = $5
            WHERE id = $6
        `, [score, totalPoints, obtainedPoints, passed, JSON.stringify(answers), attemptId]);

        return {
            score,
            totalPoints,
            obtainedPoints,
            passed,
            quizTitle: attemptData.quiz_title,
            passPercentage: attemptData.pass_percentage
        };
    });

    console.log(chalk.green(`✅ Quiz soumis: ${result.score.toFixed(1)}% (${result.passed ? 'RÉUSSI' : 'ÉCHOUÉ'})`));

    res.json({
        success: true,
        message: `Quiz "${result.quizTitle}" soumis avec succès`,
        data: {
            score: Math.round(result.score * 100) / 100,
            totalPoints: result.totalPoints,
            obtainedPoints: result.obtainedPoints,
            passed: result.passed,
            passPercentage: result.passPercentage
        }
    });
}));

// ===================================================
// 📈 STATISTIQUES GLOBALES DE PROGRESSION
// ===================================================

router.get('/dashboard', asyncHandler(async (req, res) => {
    const userId = req.user.id;

    console.log(chalk.blue('📈 Récupération dashboard progression:'), req.user.email);

    // Statistiques générales
    const generalStats = await queryOne(`
        SELECT 
            COUNT(*) as total_enrollments,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_formations,
            COUNT(CASE WHEN status = 'active' THEN 1 END) as active_formations,
            COALESCE(AVG(progress_percentage), 0) as avg_progress,
            COALESCE(SUM(time_spent), 0) as total_time_spent
        FROM enrollments
        WHERE user_id = $1
    `, [userId]);

    // Formations récemment actives
    const recentFormations = await queryMany(`
        SELECT 
            f.id,
            f.title,
            f.thumbnail,
            e.progress_percentage,
            e.last_accessed,
            c.name as category_name,
            c.icon as category_icon
        FROM enrollments e
        JOIN formations f ON e.formation_id = f.id
        LEFT JOIN categories c ON f.category_id = c.id
        WHERE e.user_id = $1 AND e.status IN ('active', 'paused')
        ORDER BY e.last_accessed DESC NULLS LAST
        LIMIT 5
    `, [userId]);

    // Modules terminés récemment
    const recentCompletions = await queryMany(`
        SELECT 
            m.title as module_title,
            f.title as formation_title,
            mp.completed_at,
            mp.time_spent
        FROM module_progress mp
        JOIN modules m ON mp.module_id = m.id
        JOIN formations f ON m.formation_id = f.id
        JOIN enrollments e ON mp.enrollment_id = e.id
        WHERE e.user_id = $1 AND mp.status = 'completed'
        ORDER BY mp.completed_at DESC
        LIMIT 5
    `, [userId]);

    // Progression par catégorie
    const categoryProgress = await queryMany(`
        SELECT 
            c.name,
            c.icon,
            COUNT(e.id) as total_enrollments,
            COUNT(CASE WHEN e.status = 'completed' THEN 1 END) as completed,
            COALESCE(AVG(e.progress_percentage), 0) as avg_progress
        FROM categories c
        JOIN formations f ON c.id = f.category_id
        JOIN enrollments e ON f.id = e.formation_id
        WHERE e.user_id = $1
        GROUP BY c.id, c.name, c.icon
        ORDER BY total_enrollments DESC
    `, [userId]);

    console.log(chalk.green('✅ Dashboard progression récupéré'));

    res.json({
        success: true,
        data: {
            generalStats: {
                totalEnrollments: parseInt(generalStats.total_enrollments),
                completedFormations: parseInt(generalStats.completed_formations),
                activeFormations: parseInt(generalStats.active_formations),
                avgProgress: Math.round(parseFloat(generalStats.avg_progress)),
                totalTimeSpent: parseInt(generalStats.total_time_spent),
                timeSpentFormatted: formatDuration(parseInt(generalStats.total_time_spent))
            },
            recentFormations,
            recentCompletions,
            categoryProgress: categoryProgress.map(cat => ({
                ...cat,
                total_enrollments: parseInt(cat.total_enrollments),
                completed: parseInt(cat.completed),
                avg_progress: Math.round(parseFloat(cat.avg_progress))
            }))
        }
    });
}));

// ===================================================
// 🛠️ FONCTIONS UTILITAIRES
// ===================================================

function formatDuration(minutes) {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h${mins}min` : `${hours}h`;
}

export default router;