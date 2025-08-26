import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ForumReply = sequelize.define('forum_replies', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  topic_id: {
    type: DataTypes.UUID,
    references: { model: 'forum_topics', key: 'id' },
    onDelete: 'CASCADE'
  },
  user_id: {
    type: DataTypes.UUID,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  parent_reply_id: {
    type: DataTypes.UUID,
    references: { model: 'forum_replies', key: 'id' }
  },
  likes_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  createdAt: 'created_at',
  updatedAt: false
});

export default ForumReply;
