// index.js
import express from 'express';
import router from './router.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour lire du JSON
app.use(express.json());

// Middleware pour lire les données d’un formulaire (si tu en ajoutes plus tard)
app.use(express.urlencoded({ extended: true }));

// Utiliser le router principal
app.use('/', router);

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
