// models/StudentProfile.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StudentProfile = sequelize.define('student_profiles', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  company: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  job_title: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  experience_level: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  learning_goals: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  preferred_learning_style: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  timezone: {
    type: DataTypes.STRING(50),
    defaultValue: 'Europe/Paris'
  },
  language: {
    type: DataTypes.STRING(10),
    defaultValue: 'fr'
  },
  accessibility_options: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
});

export default StudentProfile;