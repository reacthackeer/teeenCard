const { handleAddSingleWallet, handleDeleteSingleWallet, handleGetAllWallet } = require('../Controller/walletController');
const { authenticateTokenAdmin, authenticateToken } = require('../utils/jsonwebtoken');

const walletRouter = require('express').Router();
walletRouter.post('/create', authenticateTokenAdmin, handleAddSingleWallet);
walletRouter.delete('/delete', authenticateTokenAdmin, handleDeleteSingleWallet);
walletRouter.get('/get-all', authenticateToken, handleGetAllWallet);

module.exports = {
    walletRouter
}