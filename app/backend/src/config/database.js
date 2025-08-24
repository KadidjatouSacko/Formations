// ===================================================
// 🗄️ CONFIGURATION BASE DE DONNÉES POSTGRESQL - ES6
// ===================================================

import pkg from 'pg';
import chalk from 'chalk';
import 'dotenv/config';

const { Pool } = pkg;

// ===================================================
// ⚙️ CONFIGURATION DE LA CONNEXION
// ===================================================

const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'formapro',
    user: process.env.DB_USER || 'formapro_user',
    password: process.env.DB_PASSWORD || 'formapro_secure_2024',
    
    // Configuration du pool de connexions
    max: 20,                      // Nombre maximum de connexions
    min: 2,                       // Nombre minimum de connexions
    idleTimeoutMillis: 30000,     // Fermer les connexions inactives après 30s
    connectionTimeoutMillis: 2000, // Timeout de connexion
    acquireTimeoutMillis: 60000,   // Timeout d'acquisition d'une connexion
    
    // Configuration SSL (désactivé en développement)
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false,
    
    // Configuration des requêtes
    statement_timeout: 30000,      // Timeout des requêtes (30s)
    query_timeout: 30000,
    
    // Configuration des types de données
    types: {
        // Parser pour les types BIGINT (évite les chaînes)
        20: parseInt
    }
};

// ===================================================
// 🏊 CRÉATION DU POOL DE CONNEXIONS
// ===================================================

const pool = new Pool(config);

// ===================================================
// 📊 MONITORING DES CONNEXIONS
// ===================================================

let connectionCount = 0;
let queryCount = 0;
let errorCount = 0;

// Événements du pool
pool.on('connect', (client) => {
    connectionCount++;
    console.log(chalk.green(`✅ Nouvelle connexion PostgreSQL #${connectionCount}`));
    console.log(chalk.gray(`   Database: ${config.database} | Host: ${config.host}:${config.port}`));
});

pool.on('acquire', (client) => {
    console.log(chalk.blue('🔄 Connexion acquise du pool'));
});

pool.on('release', (client) => {
    console.log(chalk.cyan('🔓 Connexion relâchée dans le pool'));
});

pool.on('remove', (client) => {
    console.log(chalk.yellow('🗑️  Connexion supprimée du pool'));
});

pool.on('error', (err, client) => {
    errorCount++;
    console.log(chalk.red('💥 Erreur PostgreSQL dans le pool:'));
    console.log(chalk.red(`   ${err.message}`));
    console.log(chalk.gray(`   Total erreurs: ${errorCount}`));
});

// ===================================================
// 🔍 FONCTION DE TEST DE CONNEXION
// ===================================================

export const testConnection = async () => {
    try {
        console.log(chalk.yellow('🔍 Test de connexion à PostgreSQL...'));
        
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as current_time, version() as version');
        client.release();
        
        const { current_time, version } = result.rows[0];
        
        console.log(chalk.green('✅ Connexion PostgreSQL réussie !'));
        console.log(chalk.gray(`   Heure serveur: ${current_time}`));
        console.log(chalk.gray(`   Version: ${version.split(' ').slice(0, 2).join(' ')}`));
        
        return true;
    } catch (error) {
        console.log(chalk.red('❌ Échec de connexion PostgreSQL:'));
        console.log(chalk.red(`   ${error.message}`));
        
        // Suggestions de dépannage
        console.log(chalk.yellow('\n🔧 Vérifications à effectuer:'));
        console.log(chalk.gray('   1. PostgreSQL est-il démarré ?'));
        console.log(chalk.gray('   2. La base "' + config.database + '" existe-t-elle ?'));
        console.log(chalk.gray('   3. L\'utilisateur "' + config.user + '" existe-t-il ?'));
        console.log(chalk.gray('   4. Les paramètres de connexion sont-ils corrects ?'));
        console.log(chalk.gray('   5. Le pare-feu bloque-t-il le port ' + config.port + ' ?'));
        
        return false;
    }
};

// ===================================================
// 🎯 WRAPPER POUR REQUÊTES AVEC LOGGING
// ===================================================

export const query = async (text, params = []) => {
    const start = Date.now();
    queryCount++;
    
    try {
        console.log(chalk.blue(`🔍 Requête #${queryCount}:`), chalk.gray(text.substring(0, 100) + '...'));
        if (params.length > 0) {
            console.log(chalk.gray('   Paramètres:'), params);
        }
        
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        
        console.log(chalk.green(`✅ Requête terminée:`), chalk.yellow(`${duration}ms`), chalk.gray(`(${result.rowCount} lignes)`));
        
        // Alerter pour les requêtes lentes
        if (duration > 1000) {
            console.log(chalk.yellow(`⚠️  Requête lente détectée: ${duration}ms`));
        }
        
        return result;
    } catch (error) {
        const duration = Date.now() - start;
        console.log(chalk.red(`❌ Erreur requête:`), chalk.yellow(`${duration}ms`));
        console.log(chalk.red(`   ${error.message}`));
        throw error;
    }
};

// ===================================================
// 🔄 TRANSACTION WRAPPER
// ===================================================

export const transaction = async (callback) => {
    const client = await pool.connect();
    
    try {
        console.log(chalk.magenta('🔄 Début de transaction'));
        await client.query('BEGIN');
        
        const result = await callback(client);
        
        await client.query('COMMIT');
        console.log(chalk.green('✅ Transaction validée'));
        
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        console.log(chalk.red('❌ Transaction annulée'));
        console.log(chalk.red(`   Erreur: ${error.message}`));
        throw error;
    } finally {
        client.release();
    }
};

// ===================================================
// 📊 STATISTIQUES DU POOL
// ===================================================

export const getPoolStats = () => {
    return {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount,
        connectionCount,
        queryCount,
        errorCount,
        config: {
            max: config.max,
            min: config.min,
            host: config.host,
            port: config.port,
            database: config.database,
            user: config.user
        }
    };
};

// ===================================================
// 🎨 AFFICHAGE DES STATISTIQUES
// ===================================================

export const displayPoolStats = () => {
    const stats = getPoolStats();
    
    console.log(chalk.cyan('\n📊 STATISTIQUES POOL POSTGRESQL'));
    console.log(chalk.cyan('================================'));
    console.log(chalk.yellow(`Total connexions:     ${stats.totalCount}`));
    console.log(chalk.green(`Connexions libres:    ${stats.idleCount}`));
    console.log(chalk.red(`Connexions en attente: ${stats.waitingCount}`));
    console.log(chalk.blue(`Requêtes exécutées:   ${stats.queryCount}`));
    console.log(chalk.red(`Erreurs rencontrées:  ${stats.errorCount}`));
    console.log(chalk.gray(`Configuration:        ${stats.config.max} max, ${stats.config.min} min`));
    console.log('');
};

// ===================================================
// 🧹 NETTOYAGE DES CONNEXIONS
// ===================================================

export const closePool = async () => {
    try {
        console.log(chalk.yellow('🛑 Fermeture du pool PostgreSQL...'));
        await pool.end();
        console.log(chalk.green('✅ Pool PostgreSQL fermé proprement'));
    } catch (error) {
        console.log(chalk.red('❌ Erreur lors de la fermeture du pool:'));
        console.log(chalk.red(`   ${error.message}`));
    }
};

// ===================================================
// 🔄 FONCTIONS UTILITAIRES DE REQUÊTE
// ===================================================

// Requête simple avec gestion d'erreur
export const queryOne = async (text, params = []) => {
    const result = await query(text, params);
    return result.rows[0] || null;
};

// Requête pour récupérer plusieurs lignes
export const queryMany = async (text, params = []) => {
    const result = await query(text, params);
    return result.rows;
};

// Requête d'insertion qui retourne l'ID
export const insert = async (table, data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `${index + 1}`).join(', ');
    
    const text = `
        INSERT INTO ${table} (${keys.join(', ')}) 
        VALUES (${placeholders}) 
        RETURNING id
    `;
    
    const result = await query(text, values);
    return result.rows[0]?.id;
};

// Requête de mise à jour
export const update = async (table, id, data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, index) => `${key} = ${index + 1}`).join(', ');
    
    const text = `
        UPDATE ${table} 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${keys.length + 1}
        RETURNING *
    `;
    
    const result = await query(text, [...values, id]);
    return result.rows[0] || null;
};

// Requête de suppression
export const deleteById = async (table, id) => {
    const text = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
    const result = await query(text, [id]);
    return result.rows[0] || null;
};

// Vérifier si un enregistrement existe
export const exists = async (table, field, value) => {
    const text = `SELECT EXISTS(SELECT 1 FROM ${table} WHERE ${field} = $1)`;
    const result = await query(text, [value]);
    return result.rows[0].exists;
};

// Compter les enregistrements
export const count = async (table, whereClause = '', params = []) => {
    const text = `SELECT COUNT(*) FROM ${table} ${whereClause}`;
    const result = await query(text, params);
    return parseInt(result.rows[0].count);
};

// ===================================================
// 🔧 FONCTIONS DE MAINTENANCE
// ===================================================

// Vérifier la santé de la base de données
export const healthCheck = async () => {
    try {
        const checks = [];
        
        // Test de connexion basique
        const connectionTest = await query('SELECT 1 as test');
        checks.push({
            name: 'Connexion',
            status: connectionTest.rows.length > 0 ? 'OK' : 'FAIL',
            details: 'Connexion basique à la base de données'
        });
        
        // Vérifier les tables principales
        const tablesCheck = await query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('users', 'formations', 'categories')
        `);
        
        checks.push({
            name: 'Tables principales',
            status: tablesCheck.rows.length >= 3 ? 'OK' : 'PARTIAL',
            details: `${tablesCheck.rows.length}/3 tables trouvées`
        });
        
        // Statistiques du pool
        const poolStats = getPoolStats();
        checks.push({
            name: 'Pool de connexions',
            status: poolStats.totalCount > 0 ? 'OK' : 'WARN',
            details: `${poolStats.totalCount} connexions actives`
        });
        
        return {
            status: checks.every(c => c.status === 'OK') ? 'healthy' : 'degraded',
            checks,
            timestamp: new Date().toISOString(),
            stats: poolStats
        };
        
    } catch (error) {
        return {
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
};

// Nettoyer les sessions expirées
export const cleanExpiredSessions = async () => {
    try {
        const result = await query(`
            DELETE FROM user_sessions 
            WHERE expires_at < CURRENT_TIMESTAMP
        `);
        
        console.log(chalk.green(`🧹 ${result.rowCount} sessions expirées supprimées`));
        return result.rowCount;
    } catch (error) {
        console.log(chalk.red('❌ Erreur nettoyage sessions:'), error.message);
        return 0;
    }
};

// ===================================================
// 🚀 INITIALISATION AU DÉMARRAGE
// ===================================================

let isInitialized = false;

export const initializeDatabase = async () => {
    if (isInitialized) {
        return true;
    }
    
    console.log(chalk.blue('🚀 Initialisation de la base de données...'));
    
    try {
        // Test de connexion
        const connectionOk = await testConnection();
        if (!connectionOk) {
            throw new Error('Impossible de se connecter à PostgreSQL');
        }
        
        // Vérification de santé
        const health = await healthCheck();
        if (health.status === 'unhealthy') {
            throw new Error('Base de données en mauvais état: ' + health.error);
        }
        
        // Afficher les statistiques
        displayPoolStats();
        
        // Programmer un nettoyage régulier des sessions
        setInterval(cleanExpiredSessions, 24 * 60 * 60 * 1000); // Toutes les 24h
        
        isInitialized = true;
        console.log(chalk.green('✅ Base de données initialisée avec succès'));
        
        return true;
    } catch (error) {
        console.log(chalk.red('❌ Erreur initialisation base de données:'));
        console.log(chalk.red(`   ${error.message}`));
        return false;
    }
};

// ===================================================
// 🎛️ GESTION DES SIGNAUX SYSTÈME
// ===================================================

const gracefulShutdown = async () => {
    console.log(chalk.yellow('🛑 Arrêt gracieux du pool PostgreSQL...'));
    await closePool();
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// ===================================================
// 📤 EXPORTS
// ===================================================

// Export du pool par défaut
export default pool;

