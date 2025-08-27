//scripts/seed-database.js - Script de données de test
import bcrypt from 'bcryptjs';
import {
  User,
  StudentProfile,
  InstructorProfile,
  Category,
  Formation,
  Module,
  CertificateTemplate,
  Badge,
  Quiz,
  QuizQuestion,
  QuizAnswer
} from '../models/index.js';

export async function setupInitialData() {
  try {
    console.log('📝 Insertion des données initiales...');
    
    // Créer les catégories
    const categories = await Category.bulkCreate([
      {
        name: 'Communication & Relationnel',
        slug: 'communication-relationnel',
        description: 'Formations sur la communication professionnelle',
        icon: '🗣️',
        color: '#d4a5a5',
        sort_order: 1
      },
      {
        name: 'Hygiène & Sécurité',
        slug: 'hygiene-securite',
        description: 'Formations sur les règles d\'hygiène et sécurité',
        icon: '🛡️',
        color: '#a5c9d4',
        sort_order: 2
      },
      {
        name: 'Premiers Secours',
        slug: 'premiers-secours',
        description: 'Formations aux gestes de premiers secours',
        icon: '🚨',
        color: '#ff6b6b',
        sort_order: 3
      },
      {
        name: 'Développement Personnel',
        slug: 'developpement-personnel',
        description: 'Formations de développement des compétences personnelles',
        icon: '🎯',
        color: '#4ecdc4',
        sort_order: 4
      }
    ]);
    
    // Créer les templates de certificats
    const certificateTemplates = await CertificateTemplate.bulkCreate([
      {
        name: 'Template Standard',
        template_url: '/templates/standard-certificate.pdf',
        is_default: true
      },
      {
        name: 'Template Premium',
        template_url: '/templates/premium-certificate.pdf',
        is_default: false
      }
    ]);
    
    // Créer les badges
    const badges = await Badge.bulkCreate([
      {
        name: 'Premier Pas',
        description: 'Première connexion sur la plateforme',
        icon: '👋',
        badge_type: 'milestone',
        points: 10
      },
      {
        name: 'Premier Certificat',
        description: 'Première formation terminée avec succès',
        icon: '🥇',
        badge_type: 'completion',
        points: 50
      },
      {
        name: 'Apprenant Assidu',
        description: '7 jours consécutifs de connexion',
        icon: '📚',
        badge_type: 'engagement',
        points: 30
      },
      {
        name: 'Expert Quiz',
        description: 'Moyenne supérieure à 95% sur les quiz',
        icon: '🎯',
        badge_type: 'performance',
        points: 100
      },
      {
        name: 'Speed Learner',
        description: 'Formation terminée en moins d\'une semaine',
        icon: '⚡',
        badge_type: 'performance',
        points: 75
      }
    ]);
    
    // Créer un administrateur
    const adminPassword = await bcrypt.hash('AdminPassword123!', 12);
    const admin = await User.create({
      email: 'admin@formapro.fr',
      password_hash: adminPassword,
      first_name: 'Admin',
      last_name: 'FormaPro',
      role: 'super_admin',
      status: 'active',
      email_verified: true
    });
    
    // Créer un instructeur
    const instructorPassword = await bcrypt.hash('InstructorPass123!', 12);
    const instructor = await User.create({
      email: 'instructeur@formapro.fr',
      password_hash: instructorPassword,
      first_name: 'Marie',
      last_name: 'Dubois',
      role: 'instructor',
      status: 'active',
      email_verified: true
    });
    
    await InstructorProfile.create({
      user_id: instructor.id,
      bio: 'Formatrice expérimentée dans le secteur médico-social avec plus de 15 ans d\'expérience.',
      expertise_areas: ['Communication', 'Hygiène', 'Premiers Secours'],
      certifications: ['Formateur SST', 'Formateur PRAP'],
      experience_years: 15,
      rating: 4.8
    });
    
    // Créer un étudiant de démonstration
    const studentPassword = await bcrypt.hash('StudentPass123!', 12);
    const student = await User.create({
      email: 'sophie.martin@example.com',
      password_hash: studentPassword,
      first_name: 'Sophie',
      last_name: 'Martin',
      role: 'student',
      status: 'active',
      email_verified: true
    });
    
    await StudentProfile.create({
      user_id: student.id,
      company: 'Services à Domicile Plus',
      job_title: 'Aide à domicile',
      experience_level: 'intermediaire',
      learning_goals: 'Améliorer mes compétences en communication et sécurité'
    });
    
    // Créer des formations
    const formations = await Formation.bulkCreate([
      {
        title: 'Communication & Relationnel',
        slug: 'communication-relationnel',
        description: 'Apprenez les techniques de communication professionnelle adaptées au secteur médico-social. Cette formation vous donnera tous les outils pour communiquer efficacement avec les bénéficiaires, leurs familles et votre équipe.',
        short_description: 'Maîtrisez la communication professionnelle dans le secteur médico-social',
        category_id: categories[0].id,
        instructor_id: instructor.id,
        thumbnail: '/images/formations/communication-thumb.jpg',
        banner_image: '/images/formations/communication-banner.jpg',
        level: 'beginner',
        duration_hours: 8,
        price: 0.00,
        status: 'published',
        prerequisites: [],
        learning_objectives: [
          'Maîtriser les techniques de communication bienveillante',
          'Adapter sa communication selon les interlocuteurs',
          'Gérer les situations de communication difficiles',
          'Travailler efficacement en équipe'
        ],
        target_audience: ['Aides à domicile', 'Auxiliaires de vie', 'Personnel médico-social'],
        tags: ['communication', 'relationnel', 'équipe'],
        certificate_template_id: certificateTemplates[0].id,
        is_free: true,
        rating: 4.5,
        total_ratings: 87,
        total_students: 234,
        published_at: new Date()
      },
      {
        title: 'Hygiène & Sécurité au Domicile',
        slug: 'hygiene-securite-domicile',
        description: 'Formation complète sur les règles d\'hygiène et de sécurité à respecter lors des interventions à domicile. Apprenez à protéger les bénéficiaires et vous-même.',
        short_description: 'Règles essentielles d\'hygiène et sécurité à domicile',
        category_id: categories[1].id,
        instructor_id: instructor.id,
        thumbnail: '/images/formations/hygiene-thumb.jpg',
        banner_image: '/images/formations/hygiene-banner.jpg',
        level: 'beginner',
        duration_hours: 6,
        price: 0.00,
        status: 'published',
        prerequisites: [],
        learning_objectives: [
          'Connaître les règles d\'hygiène de base',
          'Identifier et prévenir les risques',
          'Utiliser correctement les équipements de protection',
          'Organiser un environnement sécurisé'
        ],
        target_audience: ['Aides à domicile', 'Auxiliaires de vie'],
        tags: ['hygiène', 'sécurité', 'prévention'],
        certificate_template_id: certificateTemplates[0].id,
        is_free: true,
        rating: 4.7,
        total_ratings: 156,
        total_students: 312,
        published_at: new Date()
      },
      {
        title: 'Gestes de Premiers Secours',
        slug: 'premiers-secours',
        description: 'Apprenez les gestes qui sauvent ! Formation aux premiers secours adaptée aux professionnels de l\'aide à domicile.',
        short_description: 'Les gestes qui sauvent en situation d\'urgence',
        category_id: categories[2].id,
        instructor_id: instructor.id,
        thumbnail: '/images/formations/secours-thumb.jpg',
        banner_image: '/images/formations/secours-banner.jpg',
        level: 'intermediate',
        duration_hours: 12,
        price: 0.00,
        status: 'published',
        prerequisites: ['Expérience dans le secteur médico-social recommandée'],
        learning_objectives: [
          'Évaluer une situation d\'urgence',
          'Pratiquer les gestes de premiers secours',
          'Utiliser un défibrillateur',
          'Organiser les secours'
        ],
        target_audience: ['Professionnels médico-sociaux', 'Aides à domicile'],
        tags: ['premiers secours', 'urgence', 'sst'],
        certificate_template_id: certificateTemplates[1].id,
        is_free: true,
        rating: 4.9,
        total_ratings: 203,
        total_students: 445,
        published_at: new Date()
      }
    ]);
    
    // Créer des modules pour la formation Communication
    const communicationModules = await Module.bulkCreate([
      {
        formation_id: formations[0].id,
        title: 'Introduction à la communication',
        description: 'Découvrez les bases de la communication professionnelle',
        module_type: 'text',
        content: {
          html: `
            <h2>Bienvenue dans cette formation</h2>
            <p>La communication est au cœur de notre métier d'aide à domicile. Elle nous permet de créer des relations de confiance avec les bénéficiaires et de travailler efficacement en équipe.</p>
            
            <h3>Objectifs de ce module</h3>
            <ul>
              <li>Comprendre l'importance de la communication</li>
              <li>Identifier les différents types de communication</li>
              <li>Reconnaître les obstacles à la communication</li>
            </ul>
            
            <h3>La communication, qu'est-ce que c'est ?</h3>
            <p>Communiquer, c'est <strong>échanger des informations</strong> avec une ou plusieurs personnes. Cet échange peut se faire de différentes manières :</p>
            
            <ul>
              <li><strong>Verbalement</strong> : par la parole</li>
              <li><strong>Non-verbalement</strong> : par les gestes, les expressions, la posture</li>
              <li><strong>Par écrit</strong> : par les messages, les rapports</li>
            </ul>
          `
        },
        sort_order: 1,
        is_preview: true,
        estimated_duration: 15
      },
      {
        formation_id: formations[0].id,
        title: 'Communication bienveillante',
        description: 'Apprenez les principes de la communication bienveillante',
        module_type: 'text',
        content: {
          html: `
            <h2>La communication bienveillante</h2>
            <p>La communication bienveillante est une approche qui privilégie <strong>l'écoute</strong>, <strong>l'empathie</strong> et le <strong>respect mutuel</strong>.</p>
            
            <h3>Les 4 piliers de la communication bienveillante</h3>
            
            <h4>1. L'observation</h4>
            <p>Décrire les faits sans juger ni interpréter.</p>
            <p><em>Exemple : "Je vois que vous avez l'air fatigué" plutôt que "Vous êtes grognon aujourd'hui"</em></p>
            
            <h4>2. L'expression des sentiments</h4>
            <p>Exprimer ses émotions de manière claire et respectueuse.</p>
            <p><em>Exemple : "Je suis inquiète de votre état" plutôt que "Vous m'énervez"</em></p>
            
            <h4>3. L'identification des besoins</h4>
            <p>Comprendre les besoins derrière les comportements.</p>
            
            <h4>4. La formulation de demandes</h4>
            <p>Proposer des solutions concrètes et réalisables.</p>
          `
        },
        sort_order: 2,
        estimated_duration: 20
      },
      {
        formation_id: formations[0].id,
        title: 'Gestion des émotions',
        description: 'Apprenez à gérer vos émotions et celles des autres',
        module_type: 'text',
        content: {
          html: `
            <h2>La gestion des émotions</h2>
            <p>Dans notre métier, nous sommes souvent confrontés à des <strong>situations émotionnellement intenses</strong>. Savoir gérer ses émotions et accompagner celles des autres est essentiel.</p>
            
            <h3>Reconnaître ses émotions</h3>
            <p>La première étape est de <strong>prendre conscience</strong> de ce que l'on ressent :</p>
            <ul>
              <li>Tristesse</li>
              <li>Colère</li>
              <li>Peur</li>
              <li>Joie</li>
              <li>Surprise</li>
            </ul>
            
            <h3>Techniques de régulation émotionnelle</h3>
            
            <h4>La respiration</h4>
            <p>Prenez quelques respirations profondes pour vous calmer.</p>
            
            <h4>La prise de recul</h4>
            <p>Essayez de comprendre pourquoi vous ressentez cette émotion.</p>
            
            <h4>La communication</h4>
            <p>Exprimez vos sentiments de manière appropriée.</p>
            
            <blockquote>
              <p>"Les émotions sont des informations précieuses sur nos besoins et ceux des autres."</p>
            </blockquote>
          `
        },
        sort_order: 3,
        estimated_duration: 25
      },
      {
        formation_id: formations[0].id,
        title: 'Communication avec les familles et l\'équipe',
        description: 'Techniques spécifiques pour communiquer avec les familles et travailler en équipe',
        module_type: 'text',
        content: {
          html: `
            <h2>Communication avec les familles</h2>
            <p>Les familles sont des <strong>partenaires essentiels</strong> dans l'accompagnement. Une bonne communication avec elles est cruciale pour le bien-être du bénéficiaire.</p>
            
            <h3>Principes de base</h3>
            <ul>
              <li><strong>Transparence</strong> : Informer régulièrement sur l'état et l'évolution</li>
              <li><strong>Confidentialité</strong> : Respecter la vie privée du bénéficiaire</li>
              <li><strong>Professionnalisme</strong> : Maintenir une distance professionnelle appropriée</li>
              <li><strong>Empathie</strong> : Comprendre les inquiétudes et émotions des familles</li>
            </ul>
            
            <h3>Situations délicates</h3>
            <p>Comment réagir face aux situations difficiles :</p>
            
            <h4>Famille anxieuse</h4>
            <p>✅ Rassurer par des faits concrets<br>
            ✅ Écouter les inquiétudes<br>
            ❌ Minimiser leurs préoccupations</p>
            
            <h4>Désaccord sur les soins</h4>
            <p>✅ Expliquer le pourquoi de vos actions<br>
            ✅ Chercher un compromis<br>
            ✅ Impliquer l'équipe si nécessaire</p>
            
            <h2>Travail en équipe</h2>
            <p>Une équipe soudée garantit une meilleure qualité d'accompagnement.</p>
            
            <h3>Les clés du travail en équipe</h3>
            <ul>
              <li><strong>Communication régulière</strong> : Échanger sur les situations</li>
              <li><strong>Transmissions claires</strong> : Noter les informations importantes</li>
              <li><strong>Respect mutuel</strong> : Valoriser le travail de chacun</li>
              <li><strong>Solidarité</strong> : S'entraider dans les difficultés</li>
              <li><strong>Coordination</strong> : Maintenir une approche cohérente dans l'accompagnement</li>
            </ul>
            
            <p>Une communication efficace en équipe passe par des transmissions claires, un respect mutuel et une écoute active de chacun.</p>
          `
        },
        sort_order: 4,
        estimated_duration: 18
      },
      {
        formation_id: formations[0].id,
        title: 'Quiz d\'évaluation',
        description: 'Testez vos connaissances sur la communication',
        module_type: 'quiz',
        content: {},
        sort_order: 5,
        is_mandatory: true,
        pass_required: true,
        estimated_duration: 10
      }
    ]);
    
    // Créer un quiz pour le dernier module
    const communicationQuiz = await Quiz.create({
      module_id: communicationModules[4].id,
      title: 'Quiz de validation - Communication',
      description: 'Évaluez vos connaissances sur la communication professionnelle',
      instructions: 'Répondez aux questions suivantes. Un score minimum de 80% est requis pour valider le module.',
      time_limit: 15, // 15 minutes
      max_attempts: 3,
      pass_percentage: 80,
      shuffle_questions: true,
      show_results: true,
      allow_review: true,
      is_mandatory: true
    });
    
    // Créer les questions du quiz
    const quizQuestions = await QuizQuestion.bulkCreate([
      {
        quiz_id: communicationQuiz.id,
        question: 'Quels sont les 4 piliers de la communication bienveillante ?',
        question_type: 'mcq',
        points: 2,
        explanation: 'Les 4 piliers sont : observation, expression des sentiments, identification des besoins, formulation de demandes.',
        sort_order: 1
      },
      {
        quiz_id: communicationQuiz.id,
        question: 'La communication non-verbale représente environ quel pourcentage de notre communication ?',
        question_type: 'mcq',
        points: 1,
        explanation: 'La communication non-verbale représente environ 55% de notre communication totale.',
        sort_order: 2
      },
      {
        quiz_id: communicationQuiz.id,
        question: 'Comment doit-on réagir face à une famille anxieuse ?',
        question_type: 'mcq',
        points: 2,
        explanation: 'Il faut rassurer par des faits concrets et écouter leurs inquiétudes sans les minimiser.',
        sort_order: 3
      },
      {
        quiz_id: communicationQuiz.id,
        question: 'La confidentialité est-elle importante dans la communication avec les familles ?',
        question_type: 'true_false',
        points: 1,
        explanation: 'Oui, la confidentialité est essentielle pour respecter la vie privée du bénéficiaire.',
        sort_order: 4
      }
    ]);
    
    // Créer les réponses pour les questions à choix multiples
    await QuizAnswer.bulkCreate([
      // Question 1
      {
        question_id: quizQuestions[0].id,
        answer_text: 'Observation, expression des sentiments, identification des besoins, formulation de demandes',
        is_correct: true,
        sort_order: 1
      },
      {
        question_id: quizQuestions[0].id,
        answer_text: 'Écoute, parole, gestes, silence',
        is_correct: false,
        sort_order: 2
      },
      {
        question_id: quizQuestions[0].id,
        answer_text: 'Respect, politesse, empathie, patience',
        is_correct: false,
        sort_order: 3
      },
      
      // Question 2
      {
        question_id: quizQuestions[1].id,
        answer_text: '25%',
        is_correct: false,
        sort_order: 1
      },
      {
        question_id: quizQuestions[1].id,
        answer_text: '55%',
        is_correct: true,
        sort_order: 2
      },
      {
        question_id: quizQuestions[1].id,
        answer_text: '75%',
        is_correct: false,
        sort_order: 3
      },
      
      // Question 3
      {
        question_id: quizQuestions[2].id,
        answer_text: 'Rassurer par des faits concrets et écouter leurs inquiétudes',
        is_correct: true,
        sort_order: 1
      },
      {
        question_id: quizQuestions[2].id,
        answer_text: 'Minimiser leurs préoccupations pour les calmer',
        is_correct: false,
        sort_order: 2
      },
      {
        question_id: quizQuestions[2].id,
        answer_text: 'Éviter le sujet pour ne pas les inquiéter davantage',
        is_correct: false,
        sort_order: 3
      },
      
      // Question 4 (true/false)
      {
        question_id: quizQuestions[3].id,
        answer_text: 'Vrai',
        is_correct: true,
        sort_order: 1
      },
      {
        question_id: quizQuestions[3].id,
        answer_text: 'Faux',
        is_correct: false,
        sort_order: 2
      }
    ]);
    
    console.log('✅ Données initiales créées avec succès');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion des données:', error);
    throw error;
  }
}
