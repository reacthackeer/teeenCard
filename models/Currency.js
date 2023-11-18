const {DataTypes} = require('sequelize'); 
const sequelize = require('../config/database');

const Currency = sequelize.define('currency',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,   
    },
    dollar: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: false, 
    },
    currencyRate: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: false, 
    },
},{
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Currency;