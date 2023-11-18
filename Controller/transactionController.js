 
const asyncHandler = require('express-async-handler'); 
const Transaction = require('../models/Transaction');
const { Op } = require('sequelize');

const handleGetSingleUserReferralIncome = asyncHandler(async(req, res, next) => { 
    const page = Number(req.query?.page) || 1; 
    let limit = 20;
    let skip = (limit*page) - limit;  
    let {userId} = req.params;   
    if(userId){
        try { 
            let result = await Transaction.findAll({
                where: {
                    isIn: "IN", 
                    userId: userId,
                    typeName: {
                        [Op.like]: '%COMMISSION'
                    }
                },
                orderBy: ['id', 'DESC'],
                offset: skip,
                limit: limit
            }) 
            if(result && result?.length > 0){
                try {
                    let userAllTransactionCount = await Transaction.count({where: {
                        isIn: "IN",
                        typeName: {
                            [Op.like]: '%COMMISSION'
                        }, 
                        userId: userId
                    }});
                    if(userAllTransactionCount && userAllTransactionCount > 0){ 
                        res.json({transactions: result, pages: Math.ceil(userAllTransactionCount/limit), currentPage: page})
                    }else{
                        next(new Error('Internal server error while calculation transaction'))
                    }
                } catch (error) {
                    next(new Error(error.message))
                }
            }else{
                res.json([])
            }
        } catch (error) {
            next(new Error(error.message))
        }
    }else{
        next(new Error('Internal server error!'))
    }
});

const handleGetSingleUserTransactionHistory = asyncHandler(async(req, res, next) => { 

    const page = Number(req.query?.page) || 1; 
    let limit = 20;
    let skip = (limit*page) - limit;  

    let {userId} = req.params; 
    if(userId){
        try { 
            let result = await Transaction.findAll({
                where: { 
                    userId: userId
                },
                orderBy: ['id', 'DESC'],
                offset: skip,
                limit: limit
            }) 
            if(result && result?.length > 0){  
                try {
                    let userAllTransactionCount = await Transaction.count({where: {userId}});
                    
                    if(userAllTransactionCount && userAllTransactionCount > 0){
                        res.json({transactions: result, pages: Math.ceil(userAllTransactionCount/limit), currentPage: page})
                    }else{
                        next(new Error('Internal server error while calculation transaction'))
                    }
                } catch (error) {
                    next(new Error(error.message))
                }
            }else{
                res.json([])
            }
        } catch (error) {
            next(new Error(error.message))
        }
    }else{
        next(new Error('Internal server error!'))
    }
});

module.exports = {
    handleGetSingleUserTransactionHistory,
    handleGetSingleUserReferralIncome
}