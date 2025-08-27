// routes/auth.js - Routes d'authentification
import express from 'express';
import jwt from 'jsonwebtoken';
import { User, StudentProfile, InstructorProfile } from '../models/index.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'formapro_secret_key_change_in_production';

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, role = 'student', ...profileData } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    
    // Créer l'utilisateur
    const user = await User.create({
      email,
      password_hash: password, // Le hook beforeCreate va le hasher
      first_name,
      last_name,
      role
    });
    
    // Créer le profil approprié
    if (role === 'student') {
      await StudentProfile.create({ user_id: user.id, ...profileData });
    } else if (role === 'instructor') {
      await InstructorProfile.create({ user_id: user.id, ...profileData });
    }
    
    // Générer le token JWT
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      message: 'Inscription réussie',
      user: user.toSafeJSON(),
      token
    });
    
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Trouver l'utilisateur
    const user = await User.findOne({ 
      where: { email },
      include: [
        { model: StudentProfile, as: 'studentProfile' },
        { model: InstructorProfile, as: 'instructorProfile' }
      ]
    });
    
    if (!user || !await user.validatePassword(password)) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    // Vérifier le statut du compte
    if (user.status !== 'active') {
      return res.status(401).json({ error: 'Compte désactivé ou en attente' });
    }
    
    // Mettre à jour la dernière connexion
    await user.update({ last_login: new Date() });
    
    // Générer le token JWT
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      message: 'Connexion réussie',
      user: user.toSafeJSON(),
      token
    });
    
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

export default router;