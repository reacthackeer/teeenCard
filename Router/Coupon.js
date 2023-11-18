const { handleAddCoupon, handleApplyCoupon, handleDeleteSingleCoupon, handleGetAllCoupon } = require('../Controller/couponController');
const { authenticateToken, authenticateTokenAdmin } = require('../utils/jsonwebtoken');

const couponRouter = require('express').Router();

couponRouter.post('/add', authenticateTokenAdmin, handleAddCoupon);
couponRouter.post('/apply', authenticateToken, handleApplyCoupon);
couponRouter.delete('/delete', authenticateTokenAdmin, handleDeleteSingleCoupon);
couponRouter.get('/get-all', authenticateTokenAdmin, handleGetAllCoupon);
module.exports = {
    couponRouter
}