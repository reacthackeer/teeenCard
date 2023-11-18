const {DataTypes} = require('sequelize'); 
const sequelize = require('../config/database');

const Coupon = sequelize.define('coupon',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: false,  
        defaultValue: 0
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false, 
    },
    adminId: {
        type: DataTypes.STRING,
        allowNull: false, 
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false, 
    },
    coupon: {
        type: DataTypes.STRING,
        allowNull: false, 
        unique: true
    },
    isActive: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'true' 
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'pending' 
    },
    message: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'empty' 
    },
    balanceType: {
        type: DataTypes.STRING,
        allowNull: false, 
    }
},{
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Coupon;