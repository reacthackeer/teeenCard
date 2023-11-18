const asyncHandler = require('express-async-handler');   
const { currencyUtils } = require('../utils/CurrencyUtils'); 
const Coupon = require('../models/Coupon');
const RootAsset = require('../models/RootAsset');
const RootTransaction = require('../models/RootTransaction');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const handleAddCoupon = asyncHandler(async(req, res, next) => {
    let {couponCode, amount, email, balanceType, userId, adminId} = req.body; 
    if(couponCode && amount && email && balanceType && userId && adminId){
        if(Number(amount) > 0){
            let couponModel = {
                coupon: couponCode,
                adminId: adminId,
                email: email,
                amount: Number(amount),
                balanceType: balanceType,
                userId: userId
            }
            try {
                let result = await Coupon.create(couponModel) 
                
                if(result && result?.id){
                    res.json(result)
                }else{
                    next(new Error('Internal server error!'))
                }
            } catch (error) {  
                next(new Error('Coupon already existed!'))
            }
        }else{
            next(new Error('Invalid server request!'))
        }
    }else{
        next(new Error('Invalid server request!'))
    } 
});
const handleApplyCoupon = asyncHandler(async(req, res, next)=>{
    let {couponCode, amount, email, balanceType, userId, adminId, refId,  adminEmail} = req.body; 
    if(couponCode && amount && email && balanceType && userId && adminId && refId && adminEmail){
        let newAmount = Number(amount);
        if(newAmount > 0){
            
            try {
                let singleCouponResult = await Coupon.findOne({
                    where: {coupon: couponCode, amount: newAmount, email, balanceType, userId, status: 'pending'}
                })
                if(singleCouponResult && singleCouponResult?.id){ 
                    let couponRootAssetUpdate = currencyUtils.couponRootAssetUpdate(singleCouponResult.amount, singleCouponResult.balanceType, 'Coupon'); 
                    try {
                        let result = await RootAsset.increment(couponRootAssetUpdate, {
                            where: {id: 1}
                        })
                        if(result && result[0] && result[0][1]){ 
                            try {
                                let result = await RootTransaction.create({
                                    userId: adminId,
                                    isIn: 'true',
                                    transactionType: balanceType.toLowerCase()+'CouponDeposit',
                                    amount: Number(amount),
                                    balanceType: balanceType.toUpperCase()
                                })
                                if(result && result.id){ 
                                    let userDepositTransactionGenerate = currencyUtils.couponRootAssetUserTransactionGenerator(Number(amount), balanceType, adminId, refId);
                                    try {
                                        let result = await Transaction.bulkCreate(userDepositTransactionGenerate.array);
                                        if(result && result?.length > 0){
                                            let result = await User.increment({
                                                [`${balanceType.toLowerCase()}Balance`]: userDepositTransactionGenerate.increment
                                            },{
                                                where: {userId: adminId}
                                            })  
                                            if(result && result[0] && result[0][1]){
                                                try {
                                                    let resultDeleteSingleCoupon = await Coupon.update({status: 'complete'},{
                                                        where: {id: singleCouponResult.id}
                                                    })
                                                    if(resultDeleteSingleCoupon &&  resultDeleteSingleCoupon[0]){ 
                                                        try {
                                                            let result = await User.findOne({where: {userId: adminId}});
                                                            if(result && result.id){
                                                                res.json(result);
                                                            }else{
                                                                next(new Error('Internal server error!'))
                                                            }
                                                        } catch (error) {
                                                            next(new Error(error.message))
                                                        }
                                                    }else{
                                                        next(new Error('Internal server error!'))
                                                    }
                                                } catch (error) {
                                                    next(new Error(error.message))
                                                }
                                            }else{
                                                next(new Error('Internal server error!'))
                                            }
                                        }else{
                                            next(new Error('Internal server error!'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    }
                                }else{
                                    next(new Error('Internal server error!'))
                                }
                            } catch (error) {
                                next(new Error(error.message))
                            }
                        }else{
                            next(new Error('Internal server error!'))
                        }
                    } catch (error) {
                        next(new error(error.message))
                    }
                }else{
                    next(new Error('No Coupon Founded!'))
                }
            } catch (error) { 
                next(new Error(error.message))
            }
        }else{
            next(new Error('Invalid server request!'))
        }
    }else{
        next(new Error('Invalid server request!'))
    } 
});
const handleDeleteSingleCoupon = asyncHandler(async(req ,res, next)=>{
    let {id} = req.body;
    if(id){
        try {
            let walletDeleteResult = await Coupon.destroy({
                where: {id}
            })
            if(walletDeleteResult && walletDeleteResult > 0){
                res.json(walletDeleteResult);
            }else{
                next(new Error('Internal server error!'))
            }
        } catch (error) {
            next(new Error(error.message))
        }
    }else{
        next(new Error(`Invalid post request!`));
    }
});
const handleGetAllCoupon = asyncHandler(async(req ,res, next)=>{
    try {
        let walletResult = await Coupon.findAll({})
        if(walletResult && walletResult.length > 0){
            res.json(walletResult)
        }else{ 
            res.json([]);
        }
    } catch (error) {
        next(new Error(error.message))
    }
});


module.exports = {
    handleAddCoupon,
    handleApplyCoupon,
    handleDeleteSingleCoupon,
    handleGetAllCoupon
}
