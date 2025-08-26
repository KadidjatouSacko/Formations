// models/UserBadge.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserBadge = sequelize.define('user_badges', {
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
  badge_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'badges',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  earned_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  formation_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'formations',
      key: 'id'
    }
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'badge_id']
    }
  ]
});

export default UserBadge;