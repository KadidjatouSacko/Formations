import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const VideoAnalytics = sequelize.define('video_analytics', {
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
  module_id: {
    type: DataTypes.UUID,
    references: { model: 'modules', key: 'id' },
    onDelete: 'CASCADE'
  },
  session_id: DataTypes.UUID,
  watch_time: DataTypes.INTEGER,
  progress_percentage: DataTypes.INTEGER,
  paused_at: DataTypes.ARRAY(DataTypes.INTEGER),
  resumed_at: DataTypes.ARRAY(DataTypes.INTEGER),
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  createdAt: 'created_at',
  updatedAt: false
});

export default VideoAnalytics;
