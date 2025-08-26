// models/Certificate.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Certificate = sequelize.define('certificates', {
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
  template_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'certificate_templates',
      key: 'id'
    }
  },
  certificate_number: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  issued_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  issued_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'issued', 'revoked', 'expired'),
    defaultValue: 'issued'
  },
  pdf_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  verification_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  updatedAt: false
});

export default Certificate;
