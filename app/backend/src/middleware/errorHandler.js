// ===================================================
// 🚨 GESTIONNAIRE D'ERREURS - MODULES ES6
// ===================================================

import chalk from 'chalk';

// ===================================================
// 🔍 TYPES D'ERREURS POSTGRESQL
// ===================================================

const pgErrorCodes = {
    '23505': 'DUPLICATE_KEY',        // Violation contrainte unique
    '23503': 'FOREIGN_KEY',          // Violation clé étrangère
    '23502': 'NOT_NULL',             // Violation contrainte not null
    '23514': 'CHECK_VIOLATION',      // Violation contrainte check
    '42P01': 'UNDEFINED_TABLE',      // Table n'existe pas
    '42703': 'UNDEFINED_COLUMN',     // Colonne n'existe pas
    '28000': 'INVALID_AUTH',         // Authentification invalide
    '3D000': 'INVALID_CATALOG'       // Base de données n'existe pas
};

// ===================================================
// 🎨 FORMATAGE DES LOGS D'ERREUR
// ===================================================

const formatError = (error, req = null) => {
    const timestamp = new Date().toISOString();
    const method = req?.method || 'UNKNOWN';
    const url = req?.url || 'UNKNOWN';
    const userAgent = req?.get('User-Agent') || 'UNKNOWN';
    const ip = req?.ip || req?.connection?.remoteAddress || 'UNKNOWN';

    return {
        timestamp,
        method,
        url,
        ip,
        userAgent,
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code,
            detail: error.detail,
            constraint: error.constraint
        }
    };
};

// ===================================================
// 🚨 GESTIONNAIRE D'ERREURS PRINCIPAL
// ===================================================

export const errorHandler = (err, req, res, next) => {
    const errorInfo = formatError(err, req);
    
    // Log de l'erreur avec couleurs
    console.log('\n' + chalk.red('💥 ERREUR DÉTECTÉE'));
    console.log(chalk.gray('='.repeat(50)));
    console.log(chalk.yellow(`🕐 ${errorInfo.timestamp}`));
    console.log(chalk.blue(`📍 ${errorInfo.method} ${errorInfo.url}`));
    console.log(chalk.cyan(`🌐 IP: ${errorInfo.ip}`));
    
    if (req.user) {
        console.log(chalk.green(`👤 Utilisateur: ${req.user.email} (${req.user.role})`));
    }
    
    console.log(chalk.red(`❌ ${err.name}: ${err.message}`));
    
    if (err.code) {
        console.log(chalk.magenta(`🔢 Code: ${err.code}`));
    }
    
    if (process.env.NODE_ENV === 'development') {
        console.log(chalk.gray('📚 Stack:'));
        console.log(chalk.gray(err.stack));
    }
    
    console.log(chalk.gray('='.repeat(50)) + '\n');

    let error = { ...err };
    error.message = err.message;
    let statusCode = 500;

    // ===================================================
    // 🗄️ ERREURS POSTGRESQL
    // ===================================================

    if (err.code && pgErrorCodes[err.code]) {
        switch (err.code) {
            case '23505': // Duplicate key
                statusCode = 409;
                if (err.constraint?.includes('email')) {
                    error.message = 'Cette adresse email est déjà utilisée';
                } else if (err.constraint?.includes('username')) {
                    error.message = 'Ce nom d\'utilisateur est déjà pris';
                } else {
                    error.message = 'Cette ressource existe déjà';
                }
                break;

            case '23503': // Foreign key violation
                statusCode = 400;
                error.message = 'Référence invalide - la ressource liée n\'existe pas';
                break;

            case '23502': // Not null violation
                statusCode = 400;
                const field = err.column || 'champ requis';
                error.message = `Le champ '${field}' est obligatoire`;
                break;

            case '23514': // Check violation
                statusCode = 400;
                error.message = 'Valeur non autorisée pour ce champ';
                break;

            case '42P01': // Table undefined
                statusCode = 500;
                error.message = 'Erreur de configuration de la base de données';
                break;

            case '42703': // Column undefined
                statusCode = 500;
                error.message = 'Erreur de structure de la base de données';
                break;

            case '28000': // Invalid authorization
                statusCode = 500;
                error.message = 'Erreur de connexion à la base de données';
                break;

            default:
                statusCode = 500;
                error.message = 'Erreur de base de données';
        }
    }

    // ===================================================
    // 🔐 ERREURS JWT
    // ===================================================

    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        error.message = 'Token d\'authentification invalide';
    }

    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        error.message = 'Token d\'authentification expiré';
    }

    else if (err.name === 'NotBeforeError') {
        statusCode = 401;
        error.message = 'Token pas encore valide';
    }

    // ===================================================
    // ✅ ERREURS DE VALIDATION
    // ===================================================

    else if (err.name === 'ValidationError') {
        statusCode = 400;
        if (err.details && Array.isArray(err.details)) {
            // Joi validation
            error.message = err.details.map(detail => detail.message).join(', ');
        } else if (err.errors) {
            // Express-validator ou autres
            const messages = Object.values(err.errors).map(e => e.message || e.msg);
            error.message = messages.join(', ');
        } else {
            error.message = 'Données de validation invalides';
        }
    }

    // ===================================================
    // 📁 ERREURS DE FICHIERS
    // ===================================================

    else if (err.code === 'ENOENT') {
        statusCode = 404;
        error.message = 'Fichier non trouvé';
    }

    else if (err.code === 'EACCES') {
        statusCode = 403;
        error.message = 'Accès au fichier refusé';
    }

    else if (err.code === 'EMFILE' || err.code === 'ENFILE') {
        statusCode = 503;
        error.message = 'Trop de fichiers ouverts, réessayez plus tard';
    }

    // ===================================================
    // 🌐 ERREURS HTTP SPÉCIFIQUES
    // ===================================================

    else if (err.statusCode || err.status) {
        statusCode = err.statusCode || err.status;
    }

    else if (err.name === 'CastError') {
        statusCode = 400;
        error.message = 'Format d\'identifiant invalide';
    }

    else if (err.type === 'entity.parse.failed') {
        statusCode = 400;
        error.message = 'Format JSON invalide';
    }

    else if (err.type === 'entity.too.large') {
        statusCode = 413;
        error.message = 'Fichier trop volumineux';
    }

    // ===================================================
    // 📤 RÉPONSE D'ERREUR
    // ===================================================

    const response = {
        success: false,
        error: error.message || 'Erreur serveur interne',
        code: pgErrorCodes[err.code] || err.name || 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
    };

    // Ajouter des détails en mode développement
    if (process.env.NODE_ENV === 'development') {
        response.debug = {
            originalError: err.message,
            stack: err.stack,
            code: err.code,
            constraint: err.constraint,
            detail: err.detail,
            requestInfo: {
                method: req?.method,
                url: req?.url,
                body: req?.body,
                params: req?.params,
                query: req?.query
            }
        };
    }

    res.status(statusCode).json(response);
};

// ===================================================
// 🔍 MIDDLEWARE ROUTE NON TROUVÉE
// ===================================================

export const notFound = (req, res) => {
    const message = `Route ${req.originalUrl} non trouvée avec la méthode ${req.method}`;
    
    console.log(chalk.yellow('⚠️  ' + message));
    
    res.status(404).json({
        success: false,
        error: message,
        code: 'ROUTE_NOT_FOUND',
        timestamp: new Date().toISOString(),
        availableRoutes: [
            'GET /api/health',
            'POST /api//connexion',
            'POST /api/auth/register',
            'GET /api/formations',
            'GET /dashboard',
            'GET /video'
        ]
    });
};

// ===================================================
// 🎯 WRAPPER POUR FONCTIONS ASYNC
// ===================================================

export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// ===================================================
// 🚨 GESTIONNAIRE D'ERREURS CRITIQUE
// ===================================================

export const handleCriticalError = (error, context = 'UNKNOWN') => {
    console.log('\n' + chalk.bgRed.white(' ERREUR CRITIQUE '));
    console.log(chalk.red('Context:'), chalk.yellow(context));
    console.log(chalk.red('Error:'), error.message);
    console.log(chalk.red('Stack:'), error.stack);
    console.log('');
    
    // En production, vous pourriez envoyer une notification
    if (process.env.NODE_ENV === 'production') {
        // sendCriticalErrorNotification(error, context);
    }
};

// ===================================================
// 📊 MIDDLEWARE DE MONITORING
// ===================================================

export const requestMonitor = (req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const statusColor = res.statusCode >= 400 ? 'red' : 'green';
        
        console.log(
            chalk.gray(`[${new Date().toISOString()}]`),
            chalk.blue(req.method),
            chalk.cyan(req.url),
            chalk[statusColor](res.statusCode),
            chalk.yellow(`${duration}ms`)
        );
        
        // Log des requêtes lentes
        if (duration > 1000) {
            console.log(chalk.yellow(`⚠️  Requête lente détectée: ${duration}ms`));
        }
    });
    
    next();
};

export default {
    errorHandler,
    notFound,
    asyncHandler,
    handleCriticalError,
    requestMonitor
};