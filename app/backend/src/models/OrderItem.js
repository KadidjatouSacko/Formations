import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const OrderItem = sequelize.define('order_items', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  order_id: {
    type: DataTypes.UUID,
    references: { model: 'orders', key: 'id' },
    onDelete: 'CASCADE'
  },
  formation_id: {
    type: DataTypes.UUID,
    references: { model: 'formations', key: 'id' }
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  createdAt: 'created_at',
  updatedAt: false
});

export default OrderItem;
