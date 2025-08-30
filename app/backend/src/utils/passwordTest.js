// utils/passwordTest.js
import bcrypt from 'bcryptjs/dist/bcrypt';

// Hash existant dans votre base de données
const existingHash = '$2b$10$rGHqHkf8Nh.vHOI8B8TqBu7C8Z4K5mJdR2N1P7Q6S9T0U3V8W2X5Y';

// Fonction pour tester différents mots de passe
async function testPasswords() {
    const testPasswords = [
        'password123',
        '123456',
        'test123',
        'admin',
        'motdepasse',
        'password',
        'test',
        'formapro',
        'formation123',
        'user123'
    ];

    console.log('🔍 Test des mots de passe possibles...\n');

    for (const password of testPasswords) {
        const isMatch = await bcrypt.compare(password, existingHash);
        console.log(`${password.padEnd(15)} : ${isMatch ? '✅ MATCH!' : '❌ Non'}`);
        
        if (isMatch) {
            console.log(`\n🎉 MOT DE PASSE TROUVÉ: "${password}"`);
            return password;
        }
    }

    console.log('\n❌ Aucun mot de passe testé ne correspond au hash');
    return null;
}

// Fonction pour créer un nouveau hash
async function createNewPassword(password) {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    console.log(`\nNouveau hash pour "${password}":`);
    console.log(hash);
    return hash;
}

// Script de test principal
async function main() {
    console.log('=== DIAGNOSTIC MOT DE PASSE ===\n');
    console.log('Hash existant:', existingHash);
    
    const foundPassword = await testPasswords();
    
    if (!foundPassword) {
        console.log('\n=== SOLUTION: Créer un nouveau mot de passe ===');
        const newPassword = 'password123';
        const newHash = await createNewPassword(newPassword);
        
        console.log(`\n📝 Requête SQL pour mettre à jour la base:`);
        console.log(`UPDATE "Users" SET password_hash = '${newHash}' WHERE email = 'dalla.sacko@hotmail.com';`);
    }
}

// Exécuter si ce fichier est appelé directement
if (require.main === module) {
    main().catch(console.error);
}

export  { testPasswords, createNewPassword };