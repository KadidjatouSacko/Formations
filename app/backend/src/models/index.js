import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize('formations', 'formations', 'ton_mot_de_passe', {
  host: 'localhost',
  dialect: 'postgres'
});

// Modèle User
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: { type: DataTypes.STRING, unique: true },
  password_hash: DataTypes.STRING,
  first_name: DataTypes.STRING,
  last_name: DataTypes.STRING,
  role: { type: DataTypes.STRING, defaultValue: 'student' }
});

// Modèle Formation
const Formation = sequelize.define('Formation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  short_description: DataTypes.STRING,
  category_name: DataTypes.STRING,
  level: DataTypes.STRING,
  duration_hours: DataTypes.INTEGER,
  total_modules: DataTypes.INTEGER,
  price: { type: DataTypes.DECIMAL, defaultValue: 0 }
});

// Modèle Enrollment
const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
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
Enrollment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Enrollment.belongsTo(Formation, { foreignKey: 'formation_id', as: 'formation' });

// Synchronisation et données de test
const initializeDatabase = async () => {
  await sequelize.sync({ force: true });
  
  // Données de test
  const formations = await Formation.bulkCreate([
    {
      title: 'Communication & Relationnel',
      description: 'Maîtrisez la communication professionnelle dans le secteur médico-social',
      short_description: 'Communication bienveillante et gestion des conflits',
      category_name: 'Communication',
      level: 'Débutant',
      total_modules: 5,
      duration_hours: 8
    },
    {
      title: 'Hygiène & Sécurité',
      description: 'Protocoles d\'hygiène et prévention des risques',
      short_description: 'Sécurité et hygiène au domicile',
      category_name: 'Sécurité',
      level: 'Intermédiaire',
      total_modules: 4,
      duration_hours: 6
    }
  ]);

  console.log('Base de données initialisée avec des données de test');
};

export { sequelize, User, Formation, Enrollment, initializeDatabase };