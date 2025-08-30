// ==================== INDEX.JS (Point d'entrée principal) ====================
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

// Configuration ES6 pour __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuration EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app', 'views'));

// Import des routes ES6
import entrepriseRoutes from "./app/backend/src/controllers/entreprise.js";
import dashboardRoutes from "./app/backend/src/controllers/dashboard.js";
import formationRoutes from "./app/backend/src/controllers/formations.js";


// Déclaration des routes
app.use('/entreprise', entrepriseRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/formation', formationRoutes);
app.use('/', entrepriseRoutes); // Route par défaut

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        title: 'Erreur serveur',
        message: 'Une erreur interne est survenue' 
    });
});

// Route 404
app.use('*', (req, res) => {
    res.status(404).render('error', { 
        title: 'Page non trouvée',
        message: 'La page demandée n\'existe pas' 
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur FormaPro+ démarré sur http://localhost:${PORT}`);
    console.log(`📁 Dossier views : ${path.join(__dirname, 'views')}`);
    console.log(`📁 Fichiers statiques : ${path.join(__dirname, 'public')}`);
});
