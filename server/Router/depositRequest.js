const { handleAddSingleDepositRequest, handleDeleteSingleDepositRequest, handleGetAllDepositRequest, handleBlockRequestedUser, handleConfirmDepositRequest } = require('../Controller/depositRequestController');
const { authenticateToken, authenticateTokenAdmin } = require('../utils/jsonwebtoken');

const depositRequestRouter = require('express').Router();

depositRequestRouter.post('/create', authenticateToken, handleAddSingleDepositRequest);
depositRequestRouter.post('/confirm', authenticateTokenAdmin, handleConfirmDepositRequest);
depositRequestRouter.delete('/delete', authenticateTokenAdmin, handleDeleteSingleDepositRequest);
depositRequestRouter.delete('/block', authenticateTokenAdmin, handleBlockRequestedUser);
depositRequestRouter.get('/get-all', authenticateTokenAdmin, handleGetAllDepositRequest);

module.exports = {
    depositRequestRouter
}