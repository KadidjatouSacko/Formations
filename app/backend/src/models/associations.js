// models/index.js
import sequelize from '../config/database.js';
import User from './User.js';
import StudentProfile from './StudentProfile.js';
import InstructorProfile from './InstructorProfile.js';
import UserSession from './UserSession.js';
import Category from './Category.js';
import Formation from './Formation.js';
import Module from './Module.js';
import Resource from './Resource.js';
import Quiz from './Quiz.js';
import QuizQuestion from './QuizQuestion.js';
import QuizAnswer from './QuizAnswer.js';
import Enrollment from './Enrollment.js';
import ModuleProgress from './ModuleProgress.js';
import QuizAttempt from './QuizAttempt.js';
import CertificateTemplate from './CertificateTemplate.js';
import Certificate from './Certificate.js';
import Badge from './Badge.js';
import UserBadge from './UserBadge.js';
import Order from './order.js';
import OrderItem from './orderItem.js';
import Notification from './notification.js';
import Message from './message.js';
import ForumTopic from './forumTopic.js';
import ForumReply from './forumReply.js';
import UserActivity from './userActivity.js';
import VideoAnalytic from './VideoAnalytic.js';
import Review from './review.js';


// Définir toutes les associations
const defineAssociations = () => {
  // User associations
  User.hasOne(StudentProfile, { foreignKey: 'user_id', as: 'studentProfile' });
  User.hasOne(InstructorProfile, { foreignKey: 'user_id', as: 'instructorProfile' });
  User.hasMany(UserSession, { foreignKey: 'user_id', as: 'sessions' });
  User.hasMany(Formation, { foreignKey: 'instructor_id', as: 'formations' });
  User.hasMany(Enrollment, { foreignKey: 'user_id', as: 'enrollments' });
  User.hasMany(UserBadge, { foreignKey: 'user_id', as: 'badges' });
  User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
  User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
  User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
  User.hasMany(Message, { foreignKey: 'recipient_id', as: 'receivedMessages' });
  User.hasMany(ForumTopic, { foreignKey: 'user_id', as: 'forumTopics' });
  User.hasMany(ForumReply, { foreignKey: 'user_id', as: 'forumReplies' });
  User.hasMany(UserActivity, { foreignKey: 'user_id', as: 'activities' });
  User.hasMany(VideoAnalytic, { foreignKey: 'user_id', as: 'videoAnalytics' });
  User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });

  // Profile associations
  StudentProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  InstructorProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Session associations
  UserSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Category associations
  Category.belongsTo(Category, { foreignKey: 'parent_id', as: 'parent' });
  Category.hasMany(Category, { foreignKey: 'parent_id', as: 'children' });
  Category.hasMany(Formation, { foreignKey: 'category_id', as: 'formations' });

  // Formation associations
  Formation.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
  Formation.belongsTo(User, { foreignKey: 'instructor_id', as: 'instructor' });
  Formation.belongsTo(CertificateTemplate, { foreignKey: 'certificate_template_id', as: 'certificateTemplate' });
  Formation.hasMany(Module, { foreignKey: 'formation_id', as: 'modules' });
  Formation.hasMany(Enrollment, { foreignKey: 'formation_id', as: 'enrollments' });
  Formation.hasMany(OrderItem, { foreignKey: 'formation_id', as: 'orderItems' });
  Formation.hasMany(Message, { foreignKey: 'formation_id', as: 'messages' });
  Formation.hasMany(ForumTopic, { foreignKey: 'formation_id', as: 'forumTopics' });
  Formation.hasMany(Review, { foreignKey: 'formation_id', as: 'reviews' });
  Formation.hasMany(UserBadge, { foreignKey: 'formation_id', as: 'badges' });

  // Module associations
  Module.belongsTo(Formation, { foreignKey: 'formation_id', as: 'formation' });
  Module.hasMany(Resource, { foreignKey: 'module_id', as: 'resources' });
  Module.hasMany(Quiz, { foreignKey: 'module_id', as: 'quizzes' });
  Module.hasMany(ModuleProgress, { foreignKey: 'module_id', as: 'progress' });
  Module.hasMany(VideoAnalytic, { foreignKey: 'module_id', as: 'videoAnalytics' });

  // Resource associations
  Resource.belongsTo(Module, { foreignKey: 'module_id', as: 'module' });

  // Quiz associations
  Quiz.belongsTo(Module, { foreignKey: 'module_id', as: 'module' });
  Quiz.hasMany(QuizQuestion, { foreignKey: 'quiz_id', as: 'questions' });
  Quiz.hasMany(QuizAttempt, { foreignKey: 'quiz_id', as: 'attempts' });

  // Quiz Question associations
  QuizQuestion.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });
  QuizQuestion.hasMany(QuizAnswer, { foreignKey: 'question_id', as: 'answers' });

  // Quiz Answer associations
  QuizAnswer.belongsTo(QuizQuestion, { foreignKey: 'question_id', as: 'question' });

  // Enrollment associations
  Enrollment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Enrollment.belongsTo(Formation, { foreignKey: 'formation_id', as: 'formation' });
  Enrollment.belongsTo(Module, { foreignKey: 'current_module_id', as: 'currentModule' });
  Enrollment.hasMany(ModuleProgress, { foreignKey: 'enrollment_id', as: 'moduleProgress' });
  Enrollment.hasMany(QuizAttempt, { foreignKey: 'enrollment_id', as: 'quizAttempts' });
  Enrollment.hasMany(Certificate, { foreignKey: 'enrollment_id', as: 'certificates' });

  // Module Progress associations
  ModuleProgress.belongsTo(Enrollment, { foreignKey: 'enrollment_id', as: 'enrollment' });
  ModuleProgress.belongsTo(Module, { foreignKey: 'module_id', as: 'module' });

  // Quiz Attempt associations
  QuizAttempt.belongsTo(Enrollment, { foreignKey: 'enrollment_id', as: 'enrollment' });
  QuizAttempt.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });

  // Certificate associations
  Certificate.belongsTo(Enrollment, { foreignKey: 'enrollment_id', as: 'enrollment' });
  Certificate.belongsTo(CertificateTemplate, { foreignKey: 'template_id', as: 'template' });
  Certificate.belongsTo(User, { foreignKey: 'issued_by', as: 'issuedBy' });

  // Certificate Template associations
  CertificateTemplate.hasMany(Formation, { foreignKey: 'certificate_template_id', as: 'formations' });
  CertificateTemplate.hasMany(Certificate, { foreignKey: 'template_id', as: 'certificates' });

  // Badge associations
  Badge.hasMany(UserBadge, { foreignKey: 'badge_id', as: 'userBadges' });

  // User Badge associations
  UserBadge.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  UserBadge.belongsTo(Badge, { foreignKey: 'badge_id', as: 'badge' });
  UserBadge.belongsTo(Formation, { foreignKey: 'formation_id', as: 'formation' });

  // Order associations
  Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });

  // Order Item associations
  OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
  OrderItem.belongsTo(Formation, { foreignKey: 'formation_id', as: 'formation' });

  // Notification associations
  Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Message associations
  Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
  Message.belongsTo(User, { foreignKey: 'recipient_id', as: 'recipient' });
  Message.belongsTo(Formation, { foreignKey: 'formation_id', as: 'formation' });
  Message.belongsTo(Message, { foreignKey: 'parent_message_id', as: 'parentMessage' });
  Message.hasMany(Message, { foreignKey: 'parent_message_id', as: 'replies' });

  // Forum associations
  ForumTopic.belongsTo(Formation, { foreignKey: 'formation_id', as: 'formation' });
  ForumTopic.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  ForumTopic.hasMany(ForumReply, { foreignKey: 'topic_id', as: 'replies' });

  ForumReply.belongsTo(ForumTopic, { foreignKey: 'topic_id', as: 'topic' });
  ForumReply.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  ForumReply.belongsTo(ForumReply, { foreignKey: 'parent_reply_id', as: 'parentReply' });
  ForumReply.hasMany(ForumReply, { foreignKey: 'parent_reply_id', as: 'replies' });

  // Activity associations
  UserActivity.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Video Analytics associations
  VideoAnalytic.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  VideoAnalytic.belongsTo(Module, { foreignKey: 'module_id', as: 'module' });

  // Review associations
  Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Review.belongsTo(Formation, { foreignKey: 'formation_id', as: 'formation' });
};

// Synchroniser les modèles
const syncModels = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès');
    
    defineAssociations();
    console.log('✅ Associations des modèles définies');
    
    // En développement uniquement
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('✅ Modèles synchronisés avec la base de données');
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  StudentProfile,
  InstructorProfile,
  UserSession,
  Category,
  Formation,
  Module,
  Resource,
  Quiz,
  QuizQuestion,
  QuizAnswer,
  Enrollment,
  ModuleProgress,
  QuizAttempt,
  CertificateTemplate,
  Certificate,
  Badge,
  UserBadge,
  Order,
  OrderItem,
  Notification,
  Message,
  ForumTopic,
  ForumReply,
  UserActivity,
  VideoAnalytic,
  Review,
  defineAssociations,
  syncModels
};