const { handleAddSingleWithdrawalRequest, handleConfirmWithdrawalRequest, handleDeleteSingleWithdrawalRequest, handleBlockRequestedUserWithdrawal, handleGetAllWithdrawalRequest } = require('../Controller/withdrawalController');
const { authenticateToken, authenticateTokenAdmin } = require('../utils/jsonwebtoken');

const withdrawalRequestRouter = require('express').Router();

withdrawalRequestRouter.post('/create', authenticateToken, handleAddSingleWithdrawalRequest);
withdrawalRequestRouter.post('/confirm', authenticateTokenAdmin, handleConfirmWithdrawalRequest);
withdrawalRequestRouter.delete('/delete', authenticateTokenAdmin, handleDeleteSingleWithdrawalRequest);
withdrawalRequestRouter.delete('/block', authenticateTokenAdmin, handleBlockRequestedUserWithdrawal);
withdrawalRequestRouter.get('/get-all', authenticateTokenAdmin, handleGetAllWithdrawalRequest);

module.exports = {
    withdrawalRequestRouter
}