const {DataTypes} = require('sequelize'); 
const sequelize = require('../config/database');

const RootTransaction = sequelize.define('rootTransaction',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, 
    },
    amount: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: false,  
        defaultValue: 0
    },
    transactionType: {
        type: DataTypes.STRING,
        allowNull: true, 
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: true, 
    },
    balanceType: {
        type: DataTypes.STRING,
        allowNull: true, 
    },
    isIn: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'false' 
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
},{
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = RootTransaction;