const {DataTypes} = require('sequelize'); 
const sequelize = require('../config/database');

const InRoom = sequelize.define('inRoom',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    userIdes: {
        type: DataTypes.JSON,
        allowNull: true,    
        defaultValue: []
    },  
    roomWithId: {
        type: DataTypes.JSON,
        allowNull: true,    
        defaultValue: []
    },  
},{
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = InRoom;
