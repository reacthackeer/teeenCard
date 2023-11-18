const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('express-async-handler');
const prisma = new PrismaClient();

const handleGetSingleUserReferralIncome = asyncHandler(async(req, res, next) => { 
    const page = Number(req.query?.page) || 1; 
    let limit = 20;
    let skip = (limit*page) - limit;  
    let {userId} = req.params;   
    if(userId){
        try { 
            let result = await prisma.transaction.findMany({
                where: {
                    isIn: "IN",
                    typeName: {contains: 'COMMISSION'}, 
                    userId: userId
                },
                orderBy: {
                    id: 'desc'
                },
                skip,
                take: limit
            }) 
            if(result && result?.length > 0){
                try {
                    let userAllTransactionCount = await prisma.transaction.count({where: {
                        isIn: "IN",
                        typeName: {contains: 'COMMISSION'}, 
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
            let result = await prisma.transaction.findMany({
                where: { 
                    userId: userId
                },
                orderBy: {
                    id: 'desc'
                },
                skip,
                take: limit
            }) 
            if(result && result?.length > 0){  
                try {
                    let userAllTransactionCount = await prisma.transaction.count({where: {userId}});
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