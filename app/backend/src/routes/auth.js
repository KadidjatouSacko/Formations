// ===================================================
// 🔐 ROUTES D'AUTHENTIFICATION - MODULES ES6
// ===================================================

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { query, queryOne, insert, transaction } from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken } from '../middleware/auth.js';
import chalk from 'chalk';

const router = express.Router();

// ===================================================
// 🛡️ LIMITATION DE TAUX POUR L'AUTHENTIFICATION
// ===================================================

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives max par IP
    message: {
        success: false,
        error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
        code: 'TOO_MANY_AUTH_ATTEMPTS'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Ne pas limiter les requêtes de vérification de token
        return req.path === '/verify';
    }
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 3, // 3 inscriptions max par IP par heure
    message: {
        success: false,
        error: 'Trop d\'inscriptions depuis cette IP. Réessayez plus tard.',
        code: 'TOO_MANY_REGISTRATIONS'
    }
});

// ===================================================
// 🔑 FONCTIONS UTILITAIRES
// ===================================================

const generateToken = (userId, email, role = 'student') => {
    return jwt.sign(
        { 
            userId, 
            email, 
            role,
            iat: Math.floor(Date.now() / 1000)
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

const generateRefreshToken = () => {
    return jwt.sign(
        { type: 'refresh', iat: Math.floor(Date.now() / 1000) },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

const hashPassword = async (password) => {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    return await bcrypt.hash(password, saltRounds);
};

// ===================================================
// 📝 VALIDATION RULES
// ===================================================

const registerValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Adresse email valide requise'),
    
    body('password')
        .isLength({ min: 8 })
        .withMessage('Le mot de passe doit contenir au moins 8 caractères')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Le mot de passe doit contenir au moins: 1 minuscule, 1 majuscule, 1 chiffre et 1 caractère spécial'),
    
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Le prénom doit contenir entre 2 et 50 caractères')
        .matches(/^[a-zA-ZÀ-ÿ\s\-']+$/)
        .withMessage('Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes'),
    
    body('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Le nom doit contenir entre 2 et 50 caractères')
        .matches(/^[a-zA-ZÀ-ÿ\s\-']+$/)
        .withMessage('Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'),
    
    body('phone')
        .optional()
        .isMobilePhone('fr-FR')
        .withMessage('Numéro de téléphone français valide requis')
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Adresse email valide requise'),
    
    body('password')
        .notEmpty()
        .withMessage('Mot de passe requis')
];

// ===================================================
// 📝 INSCRIPTION
// ===================================================

router.post('/register', registerLimiter, registerValidation, asyncHandler(async (req, res) => {
    console.log(chalk.blue('📝 Tentative d\'inscription:'), req.body.email);
    
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Données d\'inscription invalides',
            details: errors.array(),
            code: 'VALIDATION_ERROR'
        });
    }

    const { email, password, firstName, lastName, phone } = req.body;

    await transaction(async (client) => {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await client.query(
            'SELECT id, email FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            throw new Error('Un compte avec cette adresse email existe déjà');
        }

        // Hasher le mot de passe
        const passwordHash = await hashPassword(password);

        // Créer l'utilisateur
        const userResult = await client.query(
            `INSERT INTO users (email, password_hash, first_name, last_name, phone, email_verified, role, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
             RETURNING id, email, first_name, last_name, role, created_at`,
            [email, passwordHash, firstName, lastName, phone, true, 'student', 'active']
        );

        const user = userResult.rows[0];

        // Créer un profil étudiant par défaut
        await client.query(
            `INSERT INTO student_profiles (user_id, timezone, language, created_at)
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
            [user.id, 'Europe/Paris', 'fr']
        );

        // Log de l'inscription
        await client.query(
            `INSERT INTO user_activities (user_id, action, resource_type, metadata, ip_address, user_agent, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
            [
                user.id,
                'user_registered',
                'user',
                JSON.stringify({ registration_method: 'email' }),
                req.ip,
                req.get('User-Agent')
            ]
        );

        // Générer le token
        const token = generateToken(user.id, user.email, user.role);

        console.log(chalk.green('✅ Inscription réussie:'), user.email);

        res.status(201).json({
            success: true,
            message: 'Inscription réussie ! Bienvenue sur FormaPro+',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role,
                    createdAt: user.created_at
                },
                token
            }
        });
    });
}));

// ===================================================
// 🔑 CONNEXION
// ===================================================

router.post('/login', authLimiter, loginValidation, asyncHandler(async (req, res) => {
    console.log(chalk.blue('🔑 Tentative de connexion:'), req.body.email);
    
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Données de connexion invalides',
            details: errors.array(),
            code: 'VALIDATION_ERROR'
        });
    }

    const { email, password } = req.body;

    // Rechercher l'utilisateur
    const user = await queryOne(
        `SELECT id, email, password_hash, first_name, last_name, role, status, 
                login_attempts, locked_until, last_login
         FROM users 
         WHERE email = $1`,
        [email]
    );

    if (!user) {
        console.log(chalk.yellow('⚠️  Tentative de connexion - utilisateur inexistant:'), email);
        return res.status(401).json({
            success: false,
            error: 'Email ou mot de passe incorrect',
            code: 'INVALID_CREDENTIALS'
        });
    }

    // Vérifier si le compte est actif
    if (user.status !== 'active') {
        return res.status(403).json({
            success: false,
            error: 'Compte désactivé. Contactez le support.',
            code: 'ACCOUNT_DISABLED'
        });
    }

    // Vérifier si le compte est verrouillé
    if (user.locked_until && new Date() < new Date(user.locked_until)) {
        const lockExpiry = new Date(user.locked_until);
        return res.status(423).json({
            success: false,
            error: 'Compte temporairement verrouillé suite à de nombreuses tentatives incorrectes',
            code: 'ACCOUNT_LOCKED',
            unlockAt: lockExpiry.toISOString()
        });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
        console.log(chalk.yellow('⚠️  Tentative de connexion - mot de passe incorrect:'), email);
        
        // Incrémenter les tentatives de connexion
        const newAttempts = (user.login_attempts || 0) + 1;
        let lockUntil = null;
        
        // Verrouiller le compte après 5 tentatives
        if (newAttempts >= 5) {
            lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
            console.log(chalk.red('🔒 Compte verrouillé:'), email);
        }

        await query(
            `UPDATE users 
             SET login_attempts = $1, locked_until = $2 
             WHERE id = $3`,
            [newAttempts, lockUntil, user.id]
        );

        return res.status(401).json({
            success: false,
            error: 'Email ou mot de passe incorrect',
            code: 'INVALID_CREDENTIALS',
            attemptsRemaining: Math.max(0, 5 - newAttempts)
        });
    }

    await transaction(async (client) => {
        // Réinitialiser les tentatives de connexion
        await client.query(
            `UPDATE users 
             SET login_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP 
             WHERE id = $1`,
            [user.id]
        );

        // Log de la connexion
        await client.query(
            `INSERT INTO user_activities (user_id, action, resource_type, metadata, ip_address, user_agent, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
            [
                user.id,
                'user_login',
                'user',
                JSON.stringify({ login_method: 'email' }),
                req.ip,
                req.get('User-Agent')
            ]
        );
    });

    // Générer le token
    const token = generateToken(user.id, user.email, user.role);

    console.log(chalk.green('✅ Connexion réussie:'), user.email, `(${user.role})`);

    res.json({
        success: true,
        message: 'Connexion réussie',
        data: {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                lastLogin: user.last_login
            },
            token
        }
    });
}));

// ===================================================
// ✅ VÉRIFICATION DU TOKEN
// ===================================================

router.get('/verify', asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Token manquant',
            code: 'NO_TOKEN'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await queryOne(
            'SELECT id, email, first_name, last_name, role, status FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (!user || user.status !== 'active') {
            return res.status(401).json({
                success: false,
                error: 'Utilisateur non trouvé ou inactif',
                code: 'USER_NOT_FOUND'
            });
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role
                },
                tokenValid: true
            }
        });

    } catch (error) {
        let errorCode = 'INVALID_TOKEN';
        let errorMessage = 'Token invalide';

        if (error.name === 'TokenExpiredError') {
            errorCode = 'TOKEN_EXPIRED';
            errorMessage = 'Token expiré';
        }

        res.status(401).json({
            success: false,
            error: errorMessage,
            code: errorCode
        });
    }
}));

// ===================================================
// 🚪 DÉCONNEXION
// ===================================================

router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
    console.log(chalk.blue('🚪 Déconnexion:'), req.user.email);
    
    // Log de la déconnexion
    await query(
        `INSERT INTO user_activities (user_id, action, resource_type, metadata, ip_address, user_agent, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
        [
            req.user.id,
            'user_logout',
            'user',
            JSON.stringify({ logout_method: 'api' }),
            req.ip,
            req.get('User-Agent')
        ]
    );

    // Supprimer le cookie si présent
    res.clearCookie('token');

    res.json({
        success: true,
        message: 'Déconnexion réussie'
    });
}));

// ===================================================
// 🔄 RAFRAÎCHIR LE TOKEN
// ===================================================

router.post('/refresh', asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({
            success: false,
            error: 'Token de rafraîchissement requis',
            code: 'NO_REFRESH_TOKEN'
        });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        
        if (decoded.type !== 'refresh') {
            throw new Error('Token de rafraîchissement invalide');
        }

        // Ici, vous pourriez vérifier si le refresh token est encore valide en base
        
        const user = await queryOne(
            'SELECT id, email, role FROM users WHERE id = $1 AND status = $2',
            [decoded.userId, 'active']
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Utilisateur non trouvé',
                code: 'USER_NOT_FOUND'
            });
        }

        const newToken = generateToken(user.id, user.email, user.role);
        const newRefreshToken = generateRefreshToken();

        res.json({
            success: true,
            data: {
                token: newToken,
                refreshToken: newRefreshToken
            }
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            error: 'Token de rafraîchissement invalide',
            code: 'INVALID_REFRESH_TOKEN'
        });
    }
}));

// ===================================================
// 🔐 RÉINITIALISATION DE MOT DE PASSE
// ===================================================

router.post('/forgot-password', authLimiter, [
    body('email').isEmail().normalizeEmail()
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Email valide requis',
            code: 'VALIDATION_ERROR'
        });
    }

    const { email } = req.body;
    
    const user = await queryOne(
        'SELECT id, email FROM users WHERE email = $1 AND status = $2',
        [email, 'active']
    );

    // Répondre toujours positivement pour éviter l'énumération d'emails
    res.json({
        success: true,
        message: 'Si cette adresse email existe, vous recevrez un lien de réinitialisation.'
    });

    if (!user) {
        console.log(chalk.yellow('⚠️  Réinitialisation demandée pour email inexistant:'), email);
        return;
    }

    // Générer un token de réinitialisation
    const resetToken = jwt.sign(
        { userId: user.id, type: 'password_reset' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    // Sauvegarder le token en base
    await query(
        `UPDATE users 
         SET password_reset_token = $1, password_reset_expires = $2 
         WHERE id = $3`,
        [resetToken, new Date(Date.now() + 60 * 60 * 1000), user.id]
    );

    console.log(chalk.blue('📧 Token de réinitialisation généré pour:'), email);
    
    // Ici, vous enverriez l'email avec le lien de réinitialisation
    // await sendPasswordResetEmail(user.email, resetToken);
}));

export default router;