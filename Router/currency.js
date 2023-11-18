const { handleAddSingleCurrency, handleDeleteSingleCurrency, handleGetAllCurrency, handleGetAllReferralIncome } = require('../Controller/currencyController');
const { authenticateTokenAdmin, authenticateToken } = require('../utils/jsonwebtoken');

const currencyRouter = require('express').Router();

currencyRouter.post('/create', authenticateTokenAdmin, handleAddSingleCurrency);
currencyRouter.delete('/delete', authenticateTokenAdmin, handleDeleteSingleCurrency);
currencyRouter.get('/get-all', authenticateTokenAdmin, handleGetAllCurrency);
currencyRouter.get('/get-all-referral-income/:userId', authenticateToken, handleGetAllReferralIncome);

module.exports = {
    currencyRouter
}