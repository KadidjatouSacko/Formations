// models/QuizAttempt.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const QuizAttempt = sequelize.define('quiz_attempts', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  enrollment_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'enrollments',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  quiz_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'quizzes',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  attempt_number: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  started_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  time_taken: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  total_points: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  obtained_points: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  passed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  answers: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['enrollment_id', 'quiz_id', 'attempt_number']
    }
  ]
});

export default QuizAttempt;