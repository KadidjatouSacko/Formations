// models/CertificateTemplate.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CertificateTemplate = sequelize.define('certificate_templates', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  template_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  background_image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  layout: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  updatedAt: false
});

export default CertificateTemplate;
