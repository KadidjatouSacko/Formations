// models/Badge.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Badge = sequelize.define('badges', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  icon: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  badge_type: {
    type: DataTypes.ENUM('completion', 'performance', 'engagement', 'special', 'milestone'),
    defaultValue: 'completion'
  },
  criteria: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  updatedAt: false
});

export default Badge;