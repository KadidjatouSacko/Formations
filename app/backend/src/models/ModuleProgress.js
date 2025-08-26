// models/ModuleProgress.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ModuleProgress = sequelize.define('module_progress', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  enrollment_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'enrollments',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  module_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'modules',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'not_started'
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  time_spent: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  progress_percentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  video_watched_duration: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  bookmarked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['enrollment_id', 'module_id']
    }
  ]
});

export default ModuleProgress;