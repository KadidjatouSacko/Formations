// models/QuizAnswer.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const QuizAnswer = sequelize.define('quiz_answers', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  question_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'quiz_questions',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  answer_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  updatedAt: false
});

export default QuizAnswer;