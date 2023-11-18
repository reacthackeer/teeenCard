const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('express-async-handler'); 
const prisma = new PrismaClient();

const handleAddSingleCurrency = asyncHandler(async(req, res, next)=>{
    let {name, dollar, currencyRate} = req.body;
    if(name && dollar && currencyRate){
        try { 
            let result = await  prisma.currency.create({data: {name, dollar, currencyRate}});
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
            let result = await  prisma.currency.delete({where: {id}})
            if(result && result.id > 0){
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
        let result = await prisma.currency.findMany({});
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
            let realResult = await prisma.transaction.aggregate({where: {userId, used: 'false', balanceType: 'REAL', isIn: 'IN', typeName: {contains: 'COMMISSION'}},_sum:{amount: true}});
            if(realResult){ 
            try {
                let demoResult = await prisma.transaction.aggregate({where: {userId, used: 'false', balanceType: 'DEMO', isIn: 'IN', typeName: {contains: 'COMMISSION'}},_sum:{amount: true}});
                if(demoResult){ 
                try {
                    let offlineResult = await prisma.transaction.aggregate({where: {userId, used: 'false', balanceType: 'OFFLINE', isIn: 'IN', typeName: {contains: 'COMMISSION'}},_sum:{amount: true}});
                    if(offlineResult){ 
                        let realBalance = 0;
                        let demoBalance = 0;
                        let offlineBalance = 0;
                        if(realResult._sum.amount && realResult._sum.amount > 0){ 
                        realBalance = Number(realResult._sum.amount)
                        };
                        if(demoResult._sum.amount && demoResult._sum.amount > 0){ 
                        demoBalance = Number(demoResult._sum.amount)
                        };
                        if(offlineResult._sum.amount && offlineResult._sum.amount > 0){ 
                        offlineBalance = Number(offlineResult._sum.amount)
                        };
                        res.json({realBalance, demoBalance, offlineBalance})
                    }else{
                    next(new Error('Internal server error while calculation real balance!'))
                    }
                } catch (error) {
                    next(new Error(error.message))
                }
                }else{
                next(new Error('Internal server error while calculation real balance!'))
                }
            } catch (error) {
                next(new Error(error.message))
            }
            }else{
            next(new Error('Internal server error while calculation real balance!'))
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