// config/database.js
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/formapro', {
  dialect: 'postgres',
  logging: console.log, // Mettre false en production
  define: {
    underscored: true,
    freezeTableName: true,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export default sequelize;