// diagnostic.js - Script pour diagnostiquer le problème de connexion
import bcrypt from 'bcryptjs/dist/bcrypt';

async function diagnosticLogin(email, password) {
    console.log('=== DIAGNOSTIC CONNEXION ===\n');
    console.log(`📧 Email testé: ${email}`);
    console.log(`🔐 Mot de passe testé: ${password}`);
    console.log('---');

    // Simuler les données de votre base
    const userFromDB = {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        email: 'dalla.sacko@hotmail.com',
        password_hash: '$2b$10$rGHqHkf8Nh.vHOI8B8TqBu7C8Z4K5mJdR2N1P7Q6S9T0U3V8W2X5Y',
        first_name: 'Dalla',
        last_name: 'Sacko',
        role: 'student',
        is_active: true,
        email_verified: true
    };

    // Étape 1: Vérifier l'email
    console.log('1️⃣ Vérification de l\'email...');
    const emailNormalized = email.toLowerCase().trim();
    const emailMatch = emailNormalized === userFromDB.email;
    console.log(`   Email normalisé: ${emailNormalized}`);
    console.log(`   Email en base: ${userFromDB.email}`);
    console.log(`   ✅ Correspondance email: ${emailMatch ? 'OUI' : 'NON'}`);
    
    if (!emailMatch) {
        console.log('❌ PROBLÈME: Email ne correspond pas');
        return false;
    }

    // Étape 2: Vérifier le statut utilisateur
    console.log('\n2️⃣ Vérification du statut utilisateur...');
    console.log(`   Actif: ${userFromDB.is_active}`);
    console.log(`   Email vérifié: ${userFromDB.email_verified}`);
    
    if (!userFromDB.is_active || !userFromDB.email_verified) {
        console.log('❌ PROBLÈME: Utilisateur inactif ou email non vérifié');
        return false;
    }

    // Étape 3: Vérifier le mot de passe
    console.log('\n3️⃣ Vérification du mot de passe...');
    console.log(`   Hash en base: ${userFromDB.password_hash}`);
    console.log(`   Mot de passe fourni: "${password}"`);
    
    try {
        const passwordMatch = await bcrypt.compare(password, userFromDB.password_hash);
        console.log(`   ✅ Vérification bcrypt: ${passwordMatch ? 'SUCCÈS' : 'ÉCHEC'}`);
        
        if (passwordMatch) {
            console.log('\n🎉 CONNEXION RÉUSSIE !');
            console.log('Utilisateur connecté:', {
                id: userFromDB.id,
                email: userFromDB.email,
                nom: `${userFromDB.first_name} ${userFromDB.last_name}`,
                role: userFromDB.role
            });
            return true;
        } else {
            console.log('\n❌ PROBLÈME: Mot de passe incorrect');
            
            // Test des mots de passe courants
            console.log('\n🔍 Test des mots de passe courants...');
            const commonPasswords = ['password123', '123456', 'test123', 'admin', 'password'];
            
            for (const testPwd of commonPasswords) {
                const match = await bcrypt.compare(testPwd, userFromDB.password_hash);
                if (match) {
                    console.log(`✅ TROUVÉ! Le bon mot de passe est: "${testPwd}"`);
                    return false;
                }
            }
            console.log('❌ Aucun mot de passe courant ne correspond');
        }
        
    } catch (error) {
        console.log(`❌ ERREUR bcrypt: ${error.message}`);
        return false;
    }
    
    return false;
}

// Tests
async function runTests() {
    console.log('🧪 LANCEMENT DES TESTS DE DIAGNOSTIC\n');
    
    // Test avec les données fournies
    await diagnosticLogin('dalla.sacko@hotmail.com', 'password123');
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test avec un autre mot de passe
    await diagnosticLogin('dalla.sacko@hotmail.com', 'test123');
}

// Exécuter les tests
runTests().catch(console.error);