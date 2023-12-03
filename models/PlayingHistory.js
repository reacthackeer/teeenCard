const {DataTypes} = require('sequelize'); 
const sequelize = require('../config/database');

const PlayingHistory = sequelize.define('playingHistory',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    winnerId: {
        type: DataTypes.STRING,  
        allowNull: false
    },
    members: {
        type: DataTypes.JSON,
        allowNull: true,    
        defaultValue: []
    },  
    playingInfo: {
        type: DataTypes.JSON,
        allowNull: true,    
        defaultValue: []
    },  
},{
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = PlayingHistory;
