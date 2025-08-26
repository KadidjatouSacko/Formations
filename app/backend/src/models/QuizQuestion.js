// models/QuizQuestion.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const QuizQuestion = sequelize.define('quiz_questions', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  question_type: {
    type: DataTypes.ENUM('mcq', 'true_false', 'fill_blank', 'matching', 'essay'),
    defaultValue: 'mcq'
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  media_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  updatedAt: false
});

export default QuizQuestion;