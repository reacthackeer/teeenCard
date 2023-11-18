
const asyncHandler = require('express-async-handler');  
const Currency = require('../models/Currency');
const Transaction = require('../models/Transaction');
const { Op } = require('sequelize');

const handleAddSingleCurrency = asyncHandler(async(req, res, next)=>{
    let {name, dollar, currencyRate} = req.body;
    if(name && dollar && currencyRate){
        try { 
            let result = await  Currency.create({name, dollar, currencyRate});
            if(result && result?.id > 0){
                res.json(result)
            }else{
                next('Internal server error!')
            }
        } catch (error) {
            next(new Error('Currency already existed!'))
        }
    }else{
        next(new Error('Invalid post request!'))
    }
});
const handleDeleteSingleCurrency = asyncHandler(async(req, res, next)=>{
    let {id} = req.body;
    if(id){
        try { 
            let result = await  Currency.destroy({where: {id}})
            if(result && result > 0){
                res.json(result)
            }else{
                next('Internal server error!')
            }
        } catch (error) {
            next(new Error('Currency not founded!'))
        }
    }else{
        next(new Error('Invalid post request!'))
    }
});
const handleGetAllCurrency = asyncHandler(async(req, res, next) => {
    try {
        let result = await Currency.findAll({});
        if(result && result?.length > 0){
            res.json(result);
        }else{
            next(new Error('Internal server error!'))
        }
    } catch (error) {
        next(error.message)
    }
});
const handleGetAllReferralIncome = asyncHandler(async(req, res, next)=>{
        let {userId} = req.params;
        if(userId){
        try {
            let realResult = await Transaction.sum('amount',{   
                    where: {
                            userId, 
                            used: 'false', 
                            balanceType: 'REAL', 
                            isIn: 'IN', 
                            typeName: { [Op.like]: '%COMMISSION' } 
                        }
            });
            try {
                let demoResult = await Transaction.sum('amount',{where: {userId, used: 'false', balanceType: 'DEMO', isIn: 'IN', typeName: { [Op.like]: '%COMMISSION' } }});
                try {
                    let offlineResult = await Transaction.sum('amount',{where: {userId, used: 'false', balanceType: 'OFFLINE', isIn: 'IN', typeName: { [Op.like]: '%COMMISSION' } }});
                    let realBalance = 0;
                    let demoBalance = 0;
                    let offlineBalance = 0;
                    if(realResult){ 
                        realBalance = Number(realResult);
                    };
                    if(offlineResult){ 
                        offlineBalance = Number(offlineResult);
                    };
                    if(demoResult){ 
                        demoBalance = Number(demoResult);
                    };
                    res.json({realBalance, demoBalance, offlineBalance})
                } catch (error) {
                    next(new Error(error.message))
                }
            } catch (error) {
                next(new Error(error.message))
            }
        } catch (error) {
            next(new Error(error.message))
        }
        }
});

module.exports = {
    handleAddSingleCurrency,
    handleDeleteSingleCurrency,
    handleGetAllCurrency,
    handleGetAllReferralIncome
}