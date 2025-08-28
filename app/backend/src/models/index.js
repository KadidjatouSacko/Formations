import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize('formations', 'formations', 'ton_mot_de_passe', {
  host: 'localhost',
  dialect: 'postgres'
});

// Modèle User
const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, unique: true },
  password_hash: DataTypes.STRING,
  first_name: DataTypes.STRING,
  last_name: DataTypes.STRING,
  role: { type: DataTypes.STRING, defaultValue: 'student' }
});

// Modèle Formation
const Formation = sequelize.define('Formation', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  short_description: DataTypes.STRING,
  category_name: DataTypes.STRING,
  level: DataTypes.STRING,
  duration_hours: DataTypes.INTEGER,
  price: { type: DataTypes.DECIMAL, defaultValue: 0 },
  rating: { type: DataTypes.DECIMAL(3,2), defaultValue: 0 },
  total_students: { type: DataTypes.INTEGER, defaultValue: 0 },
  instructor_name: DataTypes.STRING
});

// Modèle Module
const Module = sequelize.define('Module', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  formation_id: DataTypes.UUID,
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  duration_minutes: DataTypes.INTEGER,
  module_type: { type: DataTypes.STRING, defaultValue: 'video' },
  sort_order: DataTypes.INTEGER,
  is_preview: { type: DataTypes.BOOLEAN, defaultValue: false }
});

// Modèle Enrollment
const Enrollment = sequelize.define('Enrollment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: DataTypes.UUID,
  formation_id: DataTypes.UUID,
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  progress_percentage: { type: DataTypes.INTEGER, defaultValue: 0 },
  modules_completed: { type: DataTypes.INTEGER, defaultValue: 0 },
  time_spent: { type: DataTypes.INTEGER, defaultValue: 0 },
  final_score: DataTypes.DECIMAL,
  completed_at: DataTypes.DATE
});

// Relations
User.hasMany(Enrollment, { foreignKey: 'user_id', as: 'enrollments' });
Formation.hasMany(Enrollment, { foreignKey: 'formation_id', as: 'enrollments' });
Formation.hasMany(Module, { foreignKey: 'formation_id', as: 'modules' });
Enrollment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Enrollment.belongsTo(Formation, { foreignKey: 'formation_id', as: 'formation' });
Module.belongsTo(Formation, { foreignKey: 'formation_id', as: 'formation' });

// Initialisation avec données complètes
const initializeDatabase = async () => {
  await sequelize.sync({ force: true });
  
  const formations = await Formation.bulkCreate([
    {
      title: 'Communication & Relationnel',
      description: 'Maîtrisez la communication professionnelle dans le secteur médico-social. Cette formation vous donnera tous les outils pour communiquer efficacement avec les bénéficiaires, leurs familles et votre équipe.',
      short_description: 'Communication bienveillante et gestion des conflits',
      category_name: 'Communication',
      level: 'Débutant',
      duration_hours: 8,
      rating: 4.5,
      total_students: 234,
      instructor_name: 'Marie Dubois'
    },
    {
      title: 'Hygiène & Sécurité',
      description: 'Protocoles d\'hygiène professionnelle, sécurité avec les produits ménagers, prévention des risques au domicile.',
      short_description: 'Sécurité et hygiène au domicile',
      category_name: 'Sécurité',
      level: 'Intermédiaire',
      duration_hours: 6,
      rating: 4.7,
      total_students: 312,
      instructor_name: 'Dr. Jean Petit'
    }
  ]);

  // Créer les modules pour chaque formation
  const modules = [
    // Modules pour Communication
    { formation_id: formations[0].id, title: 'Introduction à la communication', description: 'Découvrez les bases de la communication professionnelle', duration_minutes: 15, module_type: 'video', sort_order: 1, is_preview: true },
    { formation_id: formations[0].id, title: 'Communication bienveillante', description: 'Apprenez les principes de la communication bienveillante', duration_minutes: 25, module_type: 'video', sort_order: 2 },
    { formation_id: formations[0].id, title: 'Gestion des émotions', description: 'Apprenez à gérer vos émotions et celles des autres', duration_minutes: 30, module_type: 'video', sort_order: 3 },
    { formation_id: formations[0].id, title: 'Communication avec les familles', description: 'Techniques spécifiques pour communiquer avec les familles', duration_minutes: 20, module_type: 'video', sort_order: 4 },
    { formation_id: formations[0].id, title: 'Quiz d\'évaluation', description: 'Testez vos connaissances', duration_minutes: 10, module_type: 'quiz', sort_order: 5 },
    
    // Modules pour Hygiène
    { formation_id: formations[1].id, title: 'Protocoles d\'hygiène', description: 'Les règles d\'hygiène essentielles', duration_minutes: 20, module_type: 'video', sort_order: 1, is_preview: true },
    { formation_id: formations[1].id, title: 'Sécurité des produits', description: 'Utilisation sécurisée des produits ménagers', duration_minutes: 25, module_type: 'video', sort_order: 2 },
    { formation_id: formations[1].id, title: 'Prévention des risques', description: 'Identifier et prévenir les risques', duration_minutes: 30, module_type: 'video', sort_order: 3 },
    { formation_id: formations[1].id, title: 'Quiz final', description: 'Évaluation des acquis', duration_minutes: 15, module_type: 'quiz', sort_order: 4 }
  ];
  
  await Module.bulkCreate(modules);

  console.log('Base de données initialisée avec formations et modules');
};

export { sequelize, User, Formation, Module, Enrollment, initializeDatabase };