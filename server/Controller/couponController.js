const asyncHandler = require('express-async-handler'); 
const { PrismaClient } = require('@prisma/client');
const { comparePasswords, hashPassword } = require('../utils/Password');
const { currencyUtils } = require('../utils/CurrencyUtils');
const prisma = new PrismaClient();

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
                let result = await prisma.coupon.create({
                    data: couponModel
                }) 
                
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
                let singleCouponResult = await prisma.coupon.findUnique({
                    where: {coupon: couponCode, amount: newAmount, email, balanceType, userId}
                })
                if(singleCouponResult && singleCouponResult?.id){ 
                    let couponRootAssetUpdate = currencyUtils.couponRootAssetUpdate(singleCouponResult.amount, singleCouponResult.balanceType, 'Coupon'); 
                    try {
                        let result = await prisma.rootasset.update({
                            where: {id: 1},
                            data: couponRootAssetUpdate
                        })
                        if(result && result?.id){ 
                            try {
                                let result = await prisma.rootassettransaction.create({
                                    data: {
                                        userId: adminId,
                                        isIn: 'true',
                                        transactionType: balanceType.toLowerCase()+'CouponDeposit',
                                        amount: Number(amount),
                                        balanceType: balanceType.toUpperCase()
                                    }
                                })
                                if(result && result.id){ 
                                    let userDepositTransactionGenerate = currencyUtils.couponRootAssetUserTransactionGenerator(Number(amount), balanceType, adminId, refId);
                                    try {
                                        let result = await prisma.transaction.createMany({
                                            data: userDepositTransactionGenerate.array
                                        })
                                        if(result && result?.count > 0){
                                            let result = await prisma.user.update({
                                                where: {userId: adminId},
                                                data: {
                                                    [`${balanceType.toLowerCase()}Balance`]: {increment: userDepositTransactionGenerate.increment}
                                                }
                                            })  
                                            try {
                                                let resultDeleteSingleCoupon = await prisma.coupon.delete({
                                                    where: {id: singleCouponResult.id}
                                                })
                                                if(resultDeleteSingleCoupon &&  resultDeleteSingleCoupon?.id){
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
            let walletDeleteResult = await prisma.coupon.delete({
                where: {id}
            })
            if(walletDeleteResult && walletDeleteResult.id > 0){
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
        let walletResult = await prisma.coupon.findMany({});
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
