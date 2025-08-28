import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';

const router = express.Router();

// Page de connexion
router.get('/connexion', (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    
    res.render('auth/login', {
        title: 'Connexion | FormaPro+',
        error: req.query.error || null,
        email: req.query.email || ''
    });
});

// Page d'inscription
router.get('/inscription', (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    
    res.render('auth/register', {
        title: 'Inscription | FormaPro+',
        error: req.query.error || null,
        success: req.query.success || null,
        formData: req.session.formData || {}
    });
    
    // Nettoyer les données de session après affichage
    delete req.session.formData;
});

// Traitement de la connexion
router.post('/connexion', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validation des données
        if (!email || !password) {
            return res.render('auth/login', {
                title: 'Connexion | FormaPro+',
                error: 'Email et mot de passe requis',
                email: email || ''
            });
        }
        
        let user = await User.findOne({ where: { email: email.toLowerCase() } });
        
        // Créer votre compte admin si il n'existe pas
        if (!user && email === 'dalla.sacko@hotmail.com') {
            const hashedPassword = await bcrypt.hash('Dalilou934!', 12);
            user = await User.create({
                email: 'dalla.sacko@hotmail.com',
                password_hash: hashedPassword,
                first_name: 'Dalla',
                last_name: 'Sacko',
                role: 'admin',
                is_active: true
            });
            console.log('✅ Compte admin créé automatiquement');
        }
        
        // Créer comptes demo s'ils n'existent pas
        if (!user && email.includes('@formapro.fr')) {
            const hashedPassword = await bcrypt.hash(password, 12);
            user = await User.create({
                email,
                password_hash: hashedPassword,
                first_name: email.includes('admin') ? 'Admin' : 'Marie',
                last_name: email.includes('admin') ? 'FormaPro' : 'Dubois',
                role: email.includes('admin') ? 'admin' : 'instructor'
            });
        }
        
        if (user && await bcrypt.compare(password, user.password_hash)) {
            // Vérifier si le compte est actif
            if (!user.is_active) {
                return res.render('auth/login', {
                    title: 'Connexion | FormaPro+',
                    error: 'Votre compte a été désactivé. Contactez l\'administrateur.',
                    email: email
                });
            }
            
            req.session.user = {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                job_title: user.job_title,
                company: user.company,
                experience_level: user.experience_level
            };
            
            // Mettre à jour la dernière connexion
            await user.update({ last_login: new Date() });
            
            // Redirection selon le rôle
            if (user.role === 'admin') {
                res.redirect('/admin/dashboard');
            } else if (user.role === 'instructor') {
                res.redirect('/instructor/dashboard');
            } else {
                res.redirect('/dashboard?welcome=' + (req.body.isFirstLogin ? 'true' : 'false'));
            }
        } else {
            res.render('auth/login', {
                title: 'Connexion | FormaPro+',
                error: 'Email ou mot de passe incorrect',
                email: email || ''
            });
        }
    } catch (error) {
        console.error('Erreur connexion:', error);
        res.render('auth/login', {
            title: 'Connexion | FormaPro+',
            error: 'Erreur système. Veuillez réessayer.',
            email: req.body.email || ''
        });
    }
});

// Traitement de l'inscription
router.post('/inscription', async (req, res) => {
    try {
        const { 
            first_name, 
            last_name, 
            email, 
            phone,
            password, 
            confirm_password,
            job_title,
            company,
            experience_level,
            terms
        } = req.body;
        
        // Sauvegarder les données du formulaire pour les réafficher en cas d'erreur
        req.session.formData = {
            first_name,
            last_name,
            email,
            phone,
            job_title,
            company,
            experience_level
        };
        
        // Validation des données
        const errors = [];
        
        if (!first_name || first_name.trim().length < 2) {
            errors.push('Le prénom doit contenir au moins 2 caractères');
        }
        
        if (!last_name || last_name.trim().length < 2) {
            errors.push('Le nom doit contenir au moins 2 caractères');
        }
        
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Email invalide');
        }
        
        if (!password || password.length < 8) {
            errors.push('Le mot de passe doit contenir au moins 8 caractères');
        }
        
        if (password !== confirm_password) {
            errors.push('Les mots de passe ne correspondent pas');
        }
        
        if (!terms) {
            errors.push('Vous devez accepter les conditions d\'utilisation');
        }
        
        // Vérification de la complexité du mot de passe
        if (password) {
            const passwordStrength = checkPasswordStrength(password);
            if (passwordStrength.score < 3) {
                errors.push('Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et être plus complexe');
            }
        }
        
        // Vérification du téléphone si fourni
        if (phone && !/^[0-9+\-\s()]{10,}$/.test(phone)) {
            errors.push('Format de téléphone invalide');
        }
        
        if (errors.length > 0) {
            return res.render('auth/register', {
                title: 'Inscription | FormaPro+',
                error: errors.join(', '),
                formData: req.session.formData
            });
        }
        
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ 
            where: { email: email.toLowerCase() } 
        });
        
        if (existingUser) {
            return res.render('auth/register', {
                title: 'Inscription | FormaPro+',
                error: 'Un compte avec cet email existe déjà. <a href="/connexion">Se connecter</a>',
                formData: req.session.formData
            });
        }
        
        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Créer l'utilisateur
        const user = await User.create({
            email: email.toLowerCase(),
            password_hash: hashedPassword,
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            phone: phone ? phone.trim() : null,
            job_title: job_title ? job_title.trim() : null,
            company: company ? company.trim() : null,
            experience_level: experience_level || null,
            role: 'student',
            is_active: true,
            email_verified_at: new Date(), // Auto-vérifier pour le moment
            created_at: new Date(),
            updated_at: new Date()
        });
        
        console.log(`✅ Nouveau compte créé: ${user.email}`);
        
        // Connecter automatiquement l'utilisateur
        req.session.user = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            job_title: user.job_title,
            company: user.company,
            experience_level: user.experience_level
        };
        
        // Nettoyer les données de formulaire
        delete req.session.formData;
        
        // Rediriger vers le dashboard avec message de bienvenue
        res.redirect('/dashboard?welcome=true&newUser=true');
        
    } catch (error) {
        console.error('Erreur inscription:', error);
        
        // Vérifier si c'est une erreur de contrainte unique
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.render('auth/register', {
                title: 'Inscription | FormaPro+',
                error: 'Cet email est déjà utilisé. <a href="/connexion">Se connecter</a>',
                formData: req.session.formData
            });
        }
        
        res.render('auth/register', {
            title: 'Inscription | FormaPro+',
            error: 'Erreur lors de la création du compte. Veuillez réessayer.',
            formData: req.session.formData
        });
    }
});

// Route de déconnexion
router.post('/deconnexion', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erreur déconnexion:', err);
        }
        res.clearCookie('connect.sid'); // Nom du cookie de session par défaut
        res.redirect('/connexion?message=Déconnexion réussie');
    });
});

router.get('/deconnexion', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erreur déconnexion:', err);
        }
        res.clearCookie('connect.sid');
        res.redirect('/connexion?message=Déconnexion réussie');
    });
});

// Route pour vérifier si un email existe (API)
router.get('/api/check-email', async (req, res) => {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({ error: 'Email requis' });
        }
        
        const existingUser = await User.findOne({ 
            where: { email: email.toLowerCase() }
        });
        
        res.json({ exists: !!existingUser });
        
    } catch (error) {
        console.error('Erreur vérification email:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour réinitialiser le mot de passe (à implémenter)
router.get('/mot-de-passe-oublie', (req, res) => {
    res.render('auth/forgot-password', {
        title: 'Mot de passe oublié | FormaPro+',
        message: req.query.message || null,
        error: req.query.error || null
    });
});

// Middleware pour vérifier l'authentification
export function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/connexion?error=Vous devez être connecté pour accéder à cette page');
    }
    next();
}

// Middleware pour vérifier le rôle
export function requireRole(roles) {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.redirect('/connexion?error=Vous devez être connecté');
        }
        
        if (!roles.includes(req.session.user.role)) {
            return res.status(403).render('errors/403', {
                title: 'Accès refusé | FormaPro+',
                message: 'Vous n\'avez pas les permissions nécessaires'
            });
        }
        
        next();
    };
}

// Fonction utilitaire pour vérifier la force du mot de passe
function checkPasswordStrength(password) {
    let score = 0;
    const checks = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        numbers: /\d/.test(password),
        symbols: /[^A-Za-z0-9]/.test(password)
    };

    Object.values(checks).forEach(check => {
        if (check) score++;
    });

    // Bonus pour longueur
    if (password.length >= 12) score += 1;

    return {
        score: Math.min(score, 5),
        checks,
        level: ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'][Math.min(score, 4)]
    };
}

// Route pour créer un compte administrateur (développement uniquement)
if (process.env.NODE_ENV === 'development') {
    router.get('/create-admin', async (req, res) => {
        try {
            const adminExists = await User.findOne({ 
                where: { email: 'dalla.sacko@hotmail.com' }
            });
            
            if (!adminExists) {
                const hashedPassword = await bcrypt.hash('Dalilou934!', 12);
                
                const admin = await User.create({
                    email: 'dalla.sacko@hotmail.com',
                    password_hash: hashedPassword,
                    first_name: 'Dalla',
                    last_name: 'Sacko',
                    role: 'admin',
                    is_active: true,
                    email_verified_at: new Date()
                });
                
                res.json({ 
                    success: true, 
                    message: 'Compte admin créé avec succès',
                    admin: {
                        id: admin.id,
                        email: admin.email,
                        role: admin.role
                    }
                });
            } else {
                res.json({ 
                    success: true, 
                    message: 'Compte admin existe déjà' 
                });
            }
            
        } catch (error) {
            console.error('Erreur création admin:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Erreur lors de la création du compte admin' 
            });
        }
    });
}

export default router;