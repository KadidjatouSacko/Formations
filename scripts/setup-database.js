//scripts/setup-database.js - Script de configuration de la BDD
import { syncModels, sequelize } from '../models/index.js';
import { setupInitialData } from './seed-database.js';

async function setupDatabase() {
  try {
    console.log('🔧 Configuration de la base de données...');
    
    // Tester la connexion
    await sequelize.authenticate();
    console.log('✅ Connexion à PostgreSQL établie');
    
    // Créer les tables
    await sequelize.sync({ force: true }); // ATTENTION: force: true supprime tout !
    console.log('✅ Tables créées');
    
    // Insérer les données initiales
    await setupInitialData();
    console.log('✅ Données initiales insérées');
    
    console.log('🎉 Base de données configurée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

setupDatabase();