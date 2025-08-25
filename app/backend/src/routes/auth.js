// app/backend/src/routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
const router = express.Router();

// Utilisateur de test (remplacer par BDD)
const users = [
    {
        id: 1,
        nom: 'Martin',
        prenom: 'Sophie',
        email: 'sophie.martin@email.com',
        password: '$2a$10$rOgE1YFVZvf8RkUmYfJvfOW5SPBOHhJFj0QJyMa/7kXTlKkHI5j.e', // "password" hashé
        role: 'etudiant',
        avatar: 'SM',
        formations: [1, 2, 3]
    }
];

// Page de connexion
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('auth/login', {
        title: 'Connexion - FormaPro+',
        error: req.query.error
    });
});

// Traitement de la connexion
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email);
    if (!user) {
        return res.redirect('/auth/login?error=credentials');
    }
    
    // Pour le test, accepter "password" comme mot de passe
    const isValidPassword = password === 'password' || await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        return res.redirect('/auth/login?error=credentials');
    }
    
    req.session.user = {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        avatar: user.avatar
    };
    
    res.redirect('/dashboard');
});

// Déconnexion
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

export default router;