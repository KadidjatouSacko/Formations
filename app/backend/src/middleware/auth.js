// middleware/auth.js - Middleware d'authentification
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'formapro_secret_key_change_in_production';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token d\'authentification requis' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'Utilisateur non autorisé' });
    }
    
    req.user = decoded;
    next();
    
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
};