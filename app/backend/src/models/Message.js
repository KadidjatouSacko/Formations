import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Message = sequelize.define('messages', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sender_id: {
    type: DataTypes.UUID,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  recipient_id: {
    type: DataTypes.UUID,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  formation_id: {
    type: DataTypes.UUID,
    references: { model: 'formations', key: 'id' }
  },
  subject: DataTypes.STRING(300),
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  read_at: DataTypes.DATE,
  replied_at: DataTypes.DATE,
  parent_message_id: {
    type: DataTypes.UUID,
    references: { model: 'messages', key: 'id' }
  },
  attachments: DataTypes.ARRAY(DataTypes.STRING)
}, {
  createdAt: 'created_at',
  updatedAt: false
});

export default Message;
