const { handleRegisterUser, handleLoginUser, verifyUserReEnter, updateDesignation, handleDeleteSingleUser, handleGetAllAdmin, handleDisabledSingleAccount, handleGetAllUser, handleActiveSingleAccount, toggleUserInvitation, handleUserBalanceTransfer, handleReferralBalanceTransfer, handleResetConnection } = require('../Controller/authController');
const { authenticateTokenAdmin, authenticateToken } = require('../utils/jsonwebtoken');

const authRouter = require('express').Router();
authRouter.put('/reset-connection/:userId', handleResetConnection)
authRouter.post('/register', handleRegisterUser);
authRouter.post('/login', handleLoginUser);
authRouter.post('/re-enter', verifyUserReEnter);
authRouter.post('/admin/designation', authenticateTokenAdmin, updateDesignation);
authRouter.put('/toggle-invitation', authenticateToken, toggleUserInvitation);
authRouter.put('/balance-transfer', authenticateToken, handleUserBalanceTransfer);
authRouter.put('/referral-balance-transfer', authenticateToken, handleReferralBalanceTransfer);
authRouter.delete('/delete', authenticateTokenAdmin, handleDeleteSingleUser);
authRouter.get('/get-all-admin', authenticateTokenAdmin, handleGetAllAdmin);
authRouter.get('/get-all-user', authenticateTokenAdmin, handleGetAllUser);
authRouter.put('/disabled', authenticateTokenAdmin, handleDisabledSingleAccount);
authRouter.put('/active', authenticateTokenAdmin, handleActiveSingleAccount);
authRouter.put('/active', authenticateTokenAdmin, handleActiveSingleAccount);

module.exports = {
    authRouter
}
