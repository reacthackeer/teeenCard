const {DataTypes} = require('sequelize'); 
const sequelize = require('../config/database');
const User = sequelize.define('user',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'empty'
    }, 
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'empty',
        unique: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'empty',
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'empty'
    },
    src: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'empty'
    },
    inRoom: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'false'
    },
    roomId: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'false'
    },
    isDisabled: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'false'
    },
    isJail: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'false'
    },
    disabledTill: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'false'
    },
    verify: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'false'
    },
    role: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '6'
    },
    accessCode: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'empty'
    },
    designation: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'user'
    },
    invitation: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Enable'
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'empty'
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'empty'
    },
    referralCode: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'empty'
    },
    promoCode: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'empty'
    },
    realBalance: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: false,
        defaultValue: 0
    },
    demoBalance: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: false,
        defaultValue: 0
    },
    offlineBalance: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: false,
        defaultValue: 0
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false, 
        unique: true
    },
    myRef: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
},{
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = User;