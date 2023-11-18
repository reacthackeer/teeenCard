const {DataTypes} = require('sequelize'); 
const sequelize = require('../config/database');

const Wallet = sequelize.define('wallet',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,   
        unique: true
    },
    ides: {
        type: DataTypes.JSON,
        allowNull: false, 
    },
    idesType: {
        type: DataTypes.JSON,
        allowNull: false, 
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false, 
    },
},{
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Wallet;
