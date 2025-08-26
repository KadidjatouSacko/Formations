import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Notification = sequelize.define('notifications', {
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
  title: {
    type: DataTypes.STRING(300),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  notification_type: {
    type: DataTypes.ENUM('system', 'payment', 'message', 'alert'),
    defaultValue: 'system'
  },
  related_id: DataTypes.UUID,
  related_type: DataTypes.STRING(50),
  read_at: DataTypes.DATE,
  action_url: DataTypes.STRING(500),
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  createdAt: 'created_at',
  updatedAt: false
});

export default Notification;
