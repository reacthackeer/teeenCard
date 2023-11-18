const { handleAddSingleBackupPassword, handleChangeUserPassword } = require('../Controller/backupPasswordController');
const { authenticateToken } = require('../utils/jsonwebtoken');

const backupPassword = require('express').Router();

backupPassword.post('/add', authenticateToken, handleAddSingleBackupPassword);
backupPassword.post('/change-password', authenticateToken, handleChangeUserPassword);

module.exports = {
    backupPassword
}