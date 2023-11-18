const {Sequelize} = require('sequelize');

const sequelize = new Sequelize(process.env.DB_N, process.env.DB_U, process.env.DB_P,{
    host: process.env.DB_H,
    dialect: 'mysql',
    logging: false
});


module.exports = sequelize;