import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserActivity = sequelize.define('user_activities', {
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
  action: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  resource_type: DataTypes.STRING(50),
  resource_id: DataTypes.UUID,
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  ip_address: DataTypes.INET,
  user_agent: DataTypes.TEXT
}, {
  createdAt: 'created_at',
  updatedAt: false
});

export default UserActivity;
