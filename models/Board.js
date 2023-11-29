const {DataTypes} = require('sequelize'); 
const sequelize = require('../config/database');

const Board = sequelize.define('board',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },   
    rootBlind: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },   
    rootChaal: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    join: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    chaal: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    blind: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    board: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    currentBalance: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    currentCommission: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    totalBalance: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    accessIdes: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    player: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    member: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    playing: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    roomId: {
        type: DataTypes.STRING, 
        unique: true
    },
    name: {
        type: DataTypes.STRING,
    },
    increase: {
        type: DataTypes.STRING
    },
    compare: {
        type: DataTypes.STRING
    },
    balanceType: {
        type: DataTypes.STRING
    },
    isStart: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'false'
    },
    currentId: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'empty'
    },
    previousId: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'empty'
    },
    nextId: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'empty'
    },
    adminId: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'empty'
    },
    type: {
        type: DataTypes.STRING
    },
    isSchedule: {
        type: DataTypes.STRING
    },
    maxBlindHit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    maxChaalHit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    minBlindHit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    minChaalHit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    maxPlayer: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    cardViewTill: {
        type: DataTypes.DATE, 
        allowNull: true,
        defaultValue: DataTypes.NOW
    },
    startTime: {
        type: DataTypes.DATE, 
        allowNull: true,
        defaultValue: DataTypes.NOW
    }
},{
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Board;

