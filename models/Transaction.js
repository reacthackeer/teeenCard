const {DataTypes} = require('sequelize'); 
const sequelize = require('../config/database');
const Transaction = sequelize.define('transaction',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    isIn: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'out'
    },
    txrId: {
        type: DataTypes.STRING,
        allowNull: false, 
    },
    typeName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false, 
    }, 
    sourceId: {
        type: DataTypes.STRING,
        allowNull: true, 
        defaultValue: 'empty'
    }, 
    balanceType: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'DEMO'
    }, 
    used: {
        type: DataTypes.STRING,
        allowNull: false, 
        defaultValue: 'false'
    }, 
    amount: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: false, 
    }
},{
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Transaction;