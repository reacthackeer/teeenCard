const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('express-async-handler'); 
const { currencyUtils } = require('../utils/CurrencyUtils');
const prisma = new PrismaClient();

const handleAddSingleDepositRequest = asyncHandler(async(req, res, next) => {
    let {wallet ,idType ,account ,currency ,amount , referrance, userId} = req.body;

    if(wallet && idType && account && currency && amount && referrance && userId) {
        try {
            let result = await prisma.depositrequest.create({data: req.body});
            if(result && result.id > 0){
                res.json(result);
            }else{
                next(new Error('Internal server error!'))
            }
        } catch (error) {
            console.log(error.message);
            next(new Error(error.message))
        }
    }else{
        next(new Error('Invalid post requested!'))
    }
    
});


const handleDeleteSingleDepositRequest = asyncHandler(async(req, res, next) => {
    let {id} = req.body;
    if(id){
        try {
            let result = await prisma.depositrequest.delete({where: {id}});
            if(result && result.id > 0){    
                res.json(result);
            }else{
                next(new Error('Internal server error!'))
            }
        } catch (error) {
            next(new Error(error.message))
        }
    }else{
        next(new Error('Invalid delete requested!'))
    }
});

const handleGetAllDepositRequest = asyncHandler(async(req, res, next) => {
    try {
        let result = await prisma.depositrequest.findMany({});
        if(result && result.length > 0){
            res.json(result)
        }else{
            res.json([])
        }
    } catch (error) {
        next(new Error(error.message))
    }
});


const handleConfirmDepositRequest = asyncHandler(async(req, res, next) => {
    let {id, userId} = req.body;
    if(id && userId){
        try {
            let getDepositRequestResult = await prisma.depositrequest.findUnique({where: {id}});
            if(getDepositRequestResult && getDepositRequestResult.id > 0){
                try {
                    let getDepositUserResult = await prisma.user.findFirst({where:{userId}});
                    if(getDepositUserResult &&  getDepositUserResult.id > 0){
                        try {
                            let getCurrencyResult = await prisma.currency.findFirst({where: {name: getDepositRequestResult.currency}});
                            if(getCurrencyResult && getCurrencyResult.id > 0){
                                let amount = Number(getDepositRequestResult.amount) / Number(getCurrencyResult.currencyRate);
                                let couponRootAssetUpdate = currencyUtils.couponRootAssetUpdate(amount, 'REAL', 'Wallet'); 
                                try {
                                    let result = await prisma.rootasset.update({
                                        where: {id: 1},
                                        data: couponRootAssetUpdate
                                    })
                                    if(result && result?.id){ 
                                        try {
                                            let result = await prisma.rootassettransaction.create({
                                                data: {
                                                    userId: userId,
                                                    isIn: 'true',
                                                    transactionType: 'realWalletDeposit',
                                                    amount: Number(amount),
                                                    balanceType: 'REAL'
                                                }
                                            })
                                            if(result && result.id){ 
                                                let userDepositTransactionGenerate = currencyUtils.couponRootAssetUserTransactionGenerator(amount, 'REAL', userId, getDepositUserResult.referralCode);
                                                try {
                                                    let result = await prisma.transaction.createMany({
                                                        data: userDepositTransactionGenerate.array
                                                    })
                                                    if(result && result?.count > 0){
                                                        try {
                                                            let result = await prisma.user.update({
                                                                where: {userId: userId},
                                                                data: {
                                                                    [`realBalance`]: {increment: userDepositTransactionGenerate.increment}
                                                                }
                                                            })  
                                                            if(result && result.id > 0){
                                                                try {
                                                                    let resultDeleteSingleCoupon = await prisma.depositrequest.delete({
                                                                        where: {id: id}
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
                                            next(new Error(error.message))
                                        }
                                    }else{
                                        next(new Error('Internal server error!'))
                                    }
                                } catch (error) {
                                    console.log(error.message);
                                    next(new Error(error.message))
                                }
                            }else{
                                next(new Error('Internal server error!'));
                            }
                        } catch (error) {
                            next(new Error(error.message))
                        }
                    }else{
                        next(new Error('Internal server error!'));
                    }
                } catch (error) {
                    next(new Error('Internal server error!'));
                }
            }else{
                next(new Error('Internal server error'));
            }
        } catch (error) {
            next(new Error(error.message))
        }
    }else{
        next(new Error('Invalid server request!'))
    }
});


const handleBlockRequestedUser =  asyncHandler(async(req, res, next) => {
    let {id, userId} = req.body;
    if(id && userId){
        try {
            let result = await prisma.depositrequest.delete({where: {id}});
            if(result && result.id > 0){   
                try {
                    let result = await prisma.user.update({where: {userId},data: {isJail: 'true', isDisabled: 'true'}});
                    if(result && result.id > 0){
                        res.json(result)
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
        next(new Error('Invalid delete requested!'))
    }
});

module.exports = {
    handleAddSingleDepositRequest,
    handleDeleteSingleDepositRequest,
    handleGetAllDepositRequest,
    handleBlockRequestedUser,
    handleConfirmDepositRequest
}