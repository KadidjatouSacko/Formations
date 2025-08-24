// ===================================================
// 🔐 MIDDLEWARE D'AUTHENTIFICATION - MODULES ES6
// ===================================================

import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

// ===================================================
// 🛡️ VÉRIFICATION DU TOKEN JWT
// ===================================================

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token d\'accès requis',
                code: 'NO_TOKEN'
            });
        }

        // Vérifier et décoder le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Récupérer les informations de l'utilisateur
        const result = await pool.query(
            `SELECT id, email, first_name, last_name, role, status 
             FROM users 
             WHERE id = $1 AND status = 'active'`,
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Utilisateur non trouvé ou inactif',
                code: 'USER_NOT_FOUND'
            });
        }

        // Ajouter les informations utilisateur à la requête
        req.user = {
            id: result.rows[0].id,
            email: result.rows[0].email,
            firstName: result.rows[0].first_name,
            lastName: result.rows[0].last_name,
            role: result.rows[0].role,
            status: result.rows[0].status
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Token invalide',
                code: 'INVALID_TOKEN'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expiré',
                code: 'TOKEN_EXPIRED'
            });
        }

        console.error('Erreur authentification:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'authentification',
            code: 'AUTH_ERROR'
        });
    }
};

// ===================================================
// 👑 VÉRIFICATION DES RÔLES
// ===================================================

export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentification requise',
                code: 'NOT_AUTHENTICATED'
            });
        }

        const userRole = req.user.role;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                error: 'Permissions insuffisantes',
                code: 'INSUFFICIENT_PERMISSIONS',
                required: allowedRoles,
                current: userRole
            });
        }

        next();
    };
};

// ===================================================
// 🔍 MIDDLEWARE OPTIONNEL (utilisateur connecté ou non)
// ===================================================

export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : req.cookies?.token;

        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const result = await pool.query(
            `SELECT id, email, first_name, last_name, role, status 
             FROM users 
             WHERE id = $1 AND status = 'active'`,
            [decoded.userId]
        );

        if (result.rows.length > 0) {
            req.user = {
                id: result.rows[0].id,
                email: result.rows[0].email,
                firstName: result.rows[0].first_name,
                lastName: result.rows[0].last_name,
                role: result.rows[0].role,
                status: result.rows[0].status
            };
        } else {
            req.user = null;
        }

        next();
    } catch (error) {
        // En cas d'erreur, continuer sans utilisateur
        req.user = null;
        next();
    }
};

// ===================================================
// 🔒 VÉRIFICATION DE PROPRIÉTÉ
// ===================================================

export const requireOwnership = (resourceIdParam = 'id', userIdField = 'user_id') => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params[resourceIdParam];
            const userId = req.user.id;

            // Les admins peuvent tout faire
            if (req.user.role === 'admin' || req.user.role === 'super_admin') {
                return next();
            }

            // Vérifier que la ressource appartient à l'utilisateur
            // Cette logique dépend de votre structure de base de données
            // Exemple générique :
            const tableName = req.route.path.includes('formations') ? 'formations' : 'users';
            
            const result = await pool.query(
                `SELECT ${userIdField} FROM ${tableName} WHERE id = $1`,
                [resourceId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Ressource non trouvée',
                    code: 'RESOURCE_NOT_FOUND'
                });
            }

            if (result.rows[0][userIdField] !== userId) {
                return res.status(403).json({
                    success: false,
                    error: 'Accès non autorisé à cette ressource',
                    code: 'ACCESS_DENIED'
                });
            }

            next();
        } catch (error) {
            console.error('Erreur vérification propriété:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la vérification des permissions',
                code: 'PERMISSION_CHECK_ERROR'
            });
        }
    };
};

// ===================================================
// 🕐 MIDDLEWARE DE LIMITATION PAR UTILISATEUR
// ===================================================

export const userRateLimit = (maxRequests = 50, windowMs = 15 * 60 * 1000) => {
    const userRequests = new Map();

    return (req, res, next) => {
        if (!req.user) {
            return next(); // Pas de limitation pour les utilisateurs non connectés
        }

        const userId = req.user.id;
        const now = Date.now();
        const windowStart = now - windowMs;

        // Nettoyer les anciennes requêtes
        if (userRequests.has(userId)) {
            const requests = userRequests.get(userId).filter(time => time > windowStart);
            userRequests.set(userId, requests);
        } else {
            userRequests.set(userId, []);
        }

        const userRequestList = userRequests.get(userId);

        if (userRequestList.length >= maxRequests) {
            return res.status(429).json({
                success: false,
                error: 'Trop de requêtes pour cet utilisateur',
                code: 'USER_RATE_LIMIT_EXCEEDED',
                resetTime: new Date(now + windowMs).toISOString()
            });
        }

        // Ajouter la requête actuelle
        userRequestList.push(now);
        userRequests.set(userId, userRequestList);

        next();
    };
};

// ===================================================
// 📊 MIDDLEWARE DE LOGGING DES ACTIONS UTILISATEUR
// ===================================================

export const logUserAction = (action, resourceType = null) => {
    return async (req, res, next) => {
        if (!req.user) {
            return next();
        }

        try {
            await pool.query(
                `INSERT INTO user_activities (user_id, action, resource_type, resource_id, metadata, ip_address, user_agent, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
                [
                    req.user.id,
                    action,
                    resourceType,
                    req.params.id || null,
                    JSON.stringify({
                        method: req.method,
                        path: req.path,
                        query: req.query,
                        body: req.body ? Object.keys(req.body) : []
                    }),
                    req.ip || req.connection.remoteAddress,
                    req.get('User-Agent') || null
                ]
            );
        } catch (error) {
            console.error('Erreur logging action utilisateur:', error);
            // Ne pas bloquer la requête si le logging échoue
        }

        next();
    };
};

export default {
    authenticateToken,
    requireRole,
    optionalAuth,
    requireOwnership,
    userRateLimit,
    logUserAction
};