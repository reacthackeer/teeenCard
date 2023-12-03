 
const asyncHandler = require('express-async-handler'); 
const { currencyUtils } = require('../utils/CurrencyUtils'); 
const DepositRequest = require('../models/DepositRequest');
const User = require('../models/User');
const Currency = require('../models/Currency');
const RootAsset = require('../models/RootAsset');
const RootTransaction = require('../models/RootTransaction');
const Transaction = require('../models/Transaction');
const WithdrawalRequest = require('../models/WithdrawalRequest');


const handleAddSingleWithdrawalRequest = asyncHandler(async(req, res, next) => {
    let {wallet ,idType ,account , amount , reference, userId, currency} = req.body;
    if(wallet && idType && account && currency && amount && reference && userId && currency) {
        try {
            let currencyResult = await Currency.findOne({where: {
                name: currency
            }});
            if(currencyResult && currencyResult.id){

                let amountConvertToDollar = Number(amount) / Number(currencyResult.currencyRate); 
                let postData = {
                    ...req.body,
                    currency: 'Usd',
                    amount: amountConvertToDollar
                }
                try {
                    let getUserResult = await User.findOne({where: {userId}});
                    if(getUserResult && getUserResult.id){
                        if(Number(getUserResult.realBalance) >= Number(amount) / Number(currencyResult.currencyRate)){
                            try {
                                let result = await  WithdrawalRequest.create(postData);
                                if(result && result.id){
                                    res.json(result);
                                }else{
                                    next(new Error('Internal server error!'))
                                }
                            } catch (error) { 
                                console.log(error);
                                next(new Error(error.message))
                            }
                        }else{
                            next(new Error('Balance low!'))
                        }
                    }else{
                        next(new Error('Internal server error!'))
                    }
                } catch (error) {
                    next(new Error(error.message))
                }
            }else{
                next(new Error('Currency not found!'))
            }
        } catch (error) {
            next(new Error(error.message))
        }

    }else{
        next(new Error('Invalid post requested!'))
    }
    
});


const handleDeleteSingleWithdrawalRequest = asyncHandler(async(req, res, next) => {
    let {id} = req.body;
    if(id){
        try {
            let result = await WithdrawalRequest.destroy({where: {id}});
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

const handleGetAllWithdrawalRequest = asyncHandler(async(req, res, next) => {
    try {
        let result = await WithdrawalRequest.findAll({where: {
            status: 'pending'
        }});
        if(result && result.length){
            res.json(result)
        }else{
            res.json([])
        }
    } catch (error) {
        next(new Error(error.message))
    }
});

const handleConfirmWithdrawalRequest = asyncHandler(async(req, res, next) => {
    let {id, userId} = req.body;
    if(id && userId){
        try {
            let getDepositRequestResult = await WithdrawalRequest.findOne({where: {id, status: 'pending'}});
            if(getDepositRequestResult && getDepositRequestResult.id){
                try {
                    let getDepositUserResult = await User.findOne({where:{userId}});
                    if(getDepositUserResult &&  getDepositUserResult.id){
                        if(Number(getDepositUserResult.realBalance) >= (Number(getDepositRequestResult.amount) + (Number(getDepositRequestResult.amount) / 100) * (Number(process.env.realWithdrawalFee || 0)))){
                            try {
                                let getCurrencyResult = await Currency.findOne({where: {name: getDepositRequestResult.currency}});
                                if(getCurrencyResult && getCurrencyResult.id){
                                    let amount = Number(getDepositRequestResult.amount) / Number(getCurrencyResult.currencyRate);
                                    let couponRootAssetUpdate = currencyUtils.couponRootAssetUpdateDeposit(amount, 'REAL', 'Wallet'); 
                                    try {
                                        let result = await RootAsset.increment(couponRootAssetUpdate,{where: {id: 1}})
                                        if(result && result[0] && result[0][1]){ 
                                            try {
                                                let result = await RootTransaction.create({
                                                    userId: userId,
                                                    isIn: 'false',
                                                    transactionType: 'realWalletWithdrawal',
                                                    amount: Number(amount),
                                                    balanceType: 'REAL'
                                                })
                                                if(result && result.id){ 
                                                    let userDepositTransactionGenerate = currencyUtils.couponRootAssetUserTransactionGeneratorWithdrawal(amount, 'REAL', userId, getDepositUserResult.referralCode);
                                                    try {
                                                        let result = await Transaction.bulkCreate(userDepositTransactionGenerate.array);
                                                        if(result && result?.length){
                                                            try {
                                                                let result = await User.increment({
                                                                    [`realBalance`]: -Number(userDepositTransactionGenerate.increment)
                                                                },{
                                                                    where: {userId: userId}
                                                                })  
                                                                if(result && result[0] && result[0][1] > 0){
                                                                    try {
                                                                        let resultUpdateDepositRequest = await WithdrawalRequest.update({status: 'complete'},{
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
                            next(new Error('Balance Low'))
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


const handleBlockRequestedUserWithdrawal =  asyncHandler(async(req, res, next) => {
    let {id, userId} = req.body;
    if(id && userId){
        try {
            let result = await WithdrawalRequest.destroy({where: {id}});
            if(result && result > 0){   
                try {
                    let result = await User.update({isJail: 'true', isDisabled: 'true'}, {where: {userId}});
                    if(result && result[0]){
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
    handleAddSingleWithdrawalRequest ,
    handleDeleteSingleWithdrawalRequest ,
    handleGetAllWithdrawalRequest,
    handleBlockRequestedUserWithdrawal, 
    handleConfirmWithdrawalRequest
}