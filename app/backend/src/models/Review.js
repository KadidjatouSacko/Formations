import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Review = sequelize.define('reviews', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  formation_id: {
    type: DataTypes.UUID,
    references: { model: 'formations', key: 'id' },
    onDelete: 'CASCADE'
  },
  rating: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 }
  },
  title: DataTypes.STRING(300),
  comment: DataTypes.TEXT,
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  helpful_votes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'formation_id']
    }
  ]
});

export default Review;

