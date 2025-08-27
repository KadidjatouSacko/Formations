import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';

const router = express.Router();

router.get('/connexion', (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    
    res.render('auth/login', {
        title: 'Connexion | FormaPro+',
        error: req.query.error || null,
        email: req.query.email || ''
    });
});

router.get('/inscription', (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    
    res.render('auth/register', {
        title: 'Inscription | FormaPro+',
        error: req.query.error || null
    });
});

router.post('/connexion', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        let user = await User.findOne({ where: { email } });
        
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
            req.session.user = {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role
            };
            res.redirect('/dashboard');
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
            error: 'Erreur système',
            email: ''
        });
    }
});

router.post('/inscription', async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.render('auth/register', {
                title: 'Inscription | FormaPro+',
                error: 'Cet email est déjà utilisé'
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({
            email,
            password_hash: hashedPassword,
            first_name,
            last_name,
            role: 'student'
        });
        
        req.session.user = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role
        };
        
        res.redirect('/dashboard?welcome=true');
        
    } catch (error) {
        console.error('Erreur inscription:', error);
        res.render('auth/register', {
            title: 'Inscription | FormaPro+',
            error: 'Erreur lors de la création du compte'
        });
    }
});

export default router;