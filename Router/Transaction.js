const { handleGetSingleUserReferralIncome, handleGetSingleUserTransactionHistory } = require('../Controller/transactionController');
const { authenticateToken } = require('../utils/jsonwebtoken');

const transactionRouter = require('express').Router();

transactionRouter.get('/referral-income/:userId', authenticateToken, handleGetSingleUserReferralIncome);
transactionRouter.get('/transaction-history/:userId', authenticateToken, handleGetSingleUserTransactionHistory);
module.exports = {
    transactionRouter
}