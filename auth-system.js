// auth-system.js - Système d'authentification complet pour FormaCare
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');

// Configuration de la base de données
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://formations:formations@localhost:5432/formations', {
    dialect: 'postgres',
    logging: console.log, // Activer les logs SQL pour debug
});

// Modèle User (ajustez selon votre structure de table)
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [6, 255]
        }
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 100]
        }
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 100]
        }
    },
    role: {
        type: DataTypes.ENUM('admin', 'instructor', 'student'),
        defaultValue: 'student',
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    email_verified_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    date_of_birth: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true, // utilise snake_case pour les timestamps
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Middleware de hachage du mot de passe
User.beforeCreate(async (user) => {
    if (user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
    }
});

User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
    }
});

// Méthode pour vérifier le mot de passe
User.prototype.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Méthode pour générer un JWT
User.prototype.generateJWT = function() {
    return jwt.sign({
        id: this.id,
        email: this.email,
        role: this.role
    }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '7d'
    });
};

// Controllers pour l'authentification
class AuthController {
    // Inscription
    static async register(req, res) {
        try {
            const { email, password, firstName, lastName, phone, dateOfBirth } = req.body;

            // Validation des données
            if (!email || !password || !firstName || !lastName) {
                return res.status(400).json({
                    success: false,
                    message: 'Email, mot de passe, prénom et nom sont obligatoires'
                });
            }

            // Vérifier que l'email n'existe pas
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Un compte avec cet email existe déjà'
                });
            }

            // Créer l'utilisateur
            const user = await User.create({
                email: email.toLowerCase(),
                password, // Sera haché automatiquement
                first_name: firstName,
                last_name: lastName,
                phone,
                date_of_birth: dateOfBirth,
                role: 'student', // Par défaut
                is_active: true,
                email_verified_at: new Date() // Auto-vérifier pour le moment
            });

            // Générer le token
            const token = user.generateJWT();

            res.status(201).json({
                success: true,
                message: 'Compte créé avec succès !',
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role
                },
                token
            });

        } catch (error) {
            console.error('Erreur inscription:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la création du compte',
                error: error.message
            });
        }
    }

    // Connexion
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email et mot de passe requis'
                });
            }

            // Trouver l'utilisateur
            const user = await User.findOne({ 
                where: { email: email.toLowerCase() }
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Email ou mot de passe incorrect'
                });
            }

            // Vérifier le mot de passe
            const isPasswordValid = await user.validPassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Email ou mot de passe incorrect'
                });
            }

            // Vérifier que le compte est actif
            if (!user.is_active) {
                return res.status(401).json({
                    success: false,
                    message: 'Votre compte a été désactivé'
                });
            }

            // Générer le token
            const token = user.generateJWT();

            res.json({
                success: true,
                message: 'Connexion réussie !',
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role
                },
                token
            });

        } catch (error) {
            console.error('Erreur connexion:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la connexion',
                error: error.message
            });
        }
    }

    // Middleware d'authentification
    static async authenticate(req, res, next) {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Token d\'accès requis'
                });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            const user = await User.findByPk(decoded.id);

            if (!user || !user.is_active) {
                return res.status(401).json({
                    success: false,
                    message: 'Token invalide ou compte inactif'
                });
            }

            req.user = user;
            next();
        } catch (error) {
            res.status(401).json({
                success: false,
                message: 'Token invalide',
                error: error.message
            });
        }
    }
}

// Utilitaire pour créer un hash manuel
async function hashPassword(plainPassword) {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(plainPassword, salt);
}

module.exports = {
    sequelize,
    User,
    AuthController,
    hashPassword
};

// Exemple d'utilisation dans app.js:
/*
const express = require('express');
const { AuthController, sequelize } = require('./auth-system');

const app = express();
app.use(express.json());

// Routes d'authentification
app.post('/api/register', AuthController.register);
app.post('/api/login', AuthController.login);

// Route protégée
app.get('/api/profile', AuthController.authenticate, (req, res) => {
    res.json({ user: req.user });
});

// Synchroniser les modèles
sequelize.sync({ alter: true }).then(() => {
    console.log('Base de données synchronisée');
    app.listen(3000, () => {
        console.log('Serveur démarré sur le port 3000');
    });
});
*/