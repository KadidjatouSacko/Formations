// models/InstructorProfile.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const InstructorProfile = sequelize.define('instructor_profiles', {
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
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  expertise_areas: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: true
  },
  certifications: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: true
  },
  experience_years: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00
  },
  total_students: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  hourly_rate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  availability: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  social_links: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
});

export default InstructorProfile;
