 
const asyncHandler = require('express-async-handler'); 
const { currencyUtils } = require('../utils/CurrencyUtils'); 
const DepositRequest = require('../models/DepositRequest');
const User = require('../models/User');
const Currency = require('../models/Currency');
const RootAsset = require('../models/RootAsset');
const RootTransaction = require('../models/RootTransaction');
const Transaction = require('../models/Transaction');

const handleAddSingleDepositRequest = asyncHandler(async(req, res, next) => {
    let {wallet ,idType ,account ,currency ,amount , referrance, userId} = req.body;

    if(wallet && idType && account && currency && amount && referrance && userId) {
        try {
            let result = await  DepositRequest.create(req.body);
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
            let result = await DepositRequest.destroy({where: {id}});
            if(result && result > 0){    
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
        let result = await DepositRequest.findAll({where: {
            status: 'pending'
        }});
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
            let getDepositRequestResult = await DepositRequest.findOne({where: {id, status: 'pending'}});
            if(getDepositRequestResult && getDepositRequestResult.id > 0){
                try {
                    let getDepositUserResult = await User.findOne({where:{userId}});
                    if(getDepositUserResult &&  getDepositUserResult.id > 0){
                        try {
                            let getCurrencyResult = await Currency.findOne({where: {name: getDepositRequestResult.currency}});
                            if(getCurrencyResult && getCurrencyResult.id > 0){
                                let amount = Number(getDepositRequestResult.amount) / Number(getCurrencyResult.currencyRate);
                                let couponRootAssetUpdate = currencyUtils.couponRootAssetUpdate(amount, 'REAL', 'Wallet'); 
                                try {
                                    let result = await RootAsset.increment(couponRootAssetUpdate,{where: {id: 1}})
                                    if(result && result[0] && result[0][1]){ 
                                        try {
                                            let result = await RootTransaction.create({
                                                userId: userId,
                                                isIn: 'true',
                                                transactionType: 'realWalletDeposit',
                                                amount: Number(amount),
                                                balanceType: 'REAL'
                                            })
                                            if(result && result.id){ 
                                                let userDepositTransactionGenerate = currencyUtils.couponRootAssetUserTransactionGenerator(amount, 'REAL', userId, getDepositUserResult.referralCode);
                                                try {
                                                    let result = await Transaction.bulkCreate(userDepositTransactionGenerate.array);
                                                    if(result && result?.length > 0){
                                                        try {
                                                            let result = await User.increment({
                                                                [`realBalance`]: userDepositTransactionGenerate.increment
                                                            },{
                                                                where: {userId: userId}
                                                            })  
                                                            if(result && result[0] && result[0][1] > 0){
                                                                try {
                                                                    let resultUpdateDepositRequest = await DepositRequest.update({status: 'complete'},{
                                                                        where: {id: id}
                                                                    })
                                                                    if(resultUpdateDepositRequest &&  resultUpdateDepositRequest[0]){
                                                                        try {
                                                                            let result = await User.findOne({where: {userId: userId}});
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
            let result = await DepositRequest.destroy({where: {id}});
            if(result && result > 0){   
                try {
                    let result = await User.update({isJail: 'true', isDisabled: 'true'}, {where: {userId}});
                    if(result && result[0] > 0){
                        try {
                            let result = await User.findOne({where: {userId: userId}});
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