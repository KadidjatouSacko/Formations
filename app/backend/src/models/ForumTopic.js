import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ForumTopic = sequelize.define('forum_topics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  formation_id: {
    type: DataTypes.UUID,
    references: { model: 'formations', key: 'id' },
    onDelete: 'CASCADE'
  },
  user_id: {
    type: DataTypes.UUID,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING(300),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_pinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_locked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  views_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  replies_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  last_activity: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  createdAt: 'created_at',
  updatedAt: false
});

export default ForumTopic;
