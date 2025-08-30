// updatePasswords.js - Script pour mettre à jour tous les mots de passe

import bcrypt from 'bcryptjs/dist/bcrypt';

bcrypt.hash('Dalilou934!', 10)
  .then(hash => {
    console.log('Hash généré:', hash);
    console.log('\nRequête SQL à exécuter:');
    console.log(`UPDATE "Users" SET password_hash = '${hash}';`);
  })
  .catch(err => console.error('Erreur:', err));