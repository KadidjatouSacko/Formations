// models/Formation.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Formation = sequelize.define('formations', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(300),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(300),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  short_description: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  instructor_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  thumbnail: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  banner_image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  video_trailer: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  level: {
    type: DataTypes.STRING(50),
    defaultValue: 'beginner'
  },
  duration_hours: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  original_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  discount_percentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived', 'suspended'),
    defaultValue: 'draft'
  },
  max_students: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  prerequisites: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: true
  },
  learning_objectives: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: true
  },
  target_audience: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: true
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING(50)),
    allowNull: true
  },
  language: {
    type: DataTypes.STRING(10),
    defaultValue: 'fr'
  },
  certificate_template_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'certificate_templates',
      key: 'id'
    }
  },
  pass_percentage: {
    type: DataTypes.INTEGER,
    defaultValue: 80
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_free: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00
  },
  total_ratings: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_students: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

export default Formation;