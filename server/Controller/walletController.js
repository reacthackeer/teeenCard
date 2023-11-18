const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('express-async-handler'); 
const prisma = new PrismaClient();

const handleAddSingleWallet = asyncHandler(async(req ,res, next)=>{
    let {wallet, currency, ides, idesType} = req.body;
    if(wallet && currency && ides && idesType && ides?.length > 0 && idesType.length > 0){
        try {
            let walletCreateResult = await prisma.wallet.create({data: {name:wallet, currency, ides, idesType}})
            if(walletCreateResult && walletCreateResult.id > 0){
                res.json(walletCreateResult);
            }else{
                next(new Error('Internal server error!'))
            }
        } catch (error) { 
            next(new Error('Wallet already existed!'))
        }
    }else{
        next(new Error(`Invalid post request!`));
    }
});

const handleDeleteSingleWallet = asyncHandler(async(req ,res, next)=>{
    let {id} = req.body;
    if(id){
        try {
            let walletDeleteResult = await prisma.wallet.delete({
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

const handleGetAllWallet = asyncHandler(async(req ,res, next)=>{
    try {
        let walletResult = await prisma.wallet.findMany({});
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
    handleAddSingleWallet,
    handleDeleteSingleWallet,
    handleGetAllWallet
}