// models/Module.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Module = sequelize.define('modules', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  formation_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'formations',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING(300),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  module_type: {
    type: DataTypes.ENUM('video', 'text', 'quiz', 'exercise', 'document', 'interactive'),
    allowNull: false
  },
  content: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  video_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  video_duration: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  document_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_preview: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_mandatory: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  pass_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  estimated_duration: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

export default Module;
