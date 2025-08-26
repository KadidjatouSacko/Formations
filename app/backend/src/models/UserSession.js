// models/UserSession.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserSession = sequelize.define('user_sessions', {
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
  session_token: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  device_info: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.INET,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  }
});

export default UserSession;
