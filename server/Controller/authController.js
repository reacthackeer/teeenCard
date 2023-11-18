const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('express-async-handler');
const { hashPassword, comparePasswords } = require('../utils/Password');
const { generateToken, verifyToken } = require('../utils/jsonwebtoken');
const { currencyUtils } = require('../utils/CurrencyUtils');
const prisma = new PrismaClient();
''
const handleRegisterUser = asyncHandler(async(req, res, next) => {
    let {name, email, phone, password, referralCode, promoCode, currentBalance, demoBalance, offlineBalance, userId, myRef} = req.body; 
    if(name && email && phone && password && referralCode && promoCode && currentBalance === 0 && demoBalance === 10000 && offlineBalance === 0 && userId && myRef){
        let postData = {...req.body} 
        let userIdes = {prevUserId: postData.prevUserId, currentUserId: postData.currentUserId};
        delete postData.prevUserId;
        delete postData.currentUserId;
        delete postData.currentBalance
        let demoDepositFee = Number(process.env.demoDepositFee);
        if(demoDepositFee > 0){
            postData.demoBalance = (Number(postData.demoBalance) / 100) * (100 - demoDepositFee);
        }
        let passwordResult = await hashPassword(password)
        
        if(passwordResult.status__code === 200){
            try {
                let result = await prisma.user.create({
                    data: {...postData, password: passwordResult.password, realBalance: currentBalance}
                })  
                try {
                    if(Number(result.role) <= 6){
                        let tokenResult = await generateToken(result); 
                        delete result.password;
                        
                        if(userIdes && userIdes.prevUserId && userIdes.currentUserId){
                            try {
                                let result = await prisma.connectedlist.updateMany({
                                    where: {userId: userIdes.prevUserId},
                                    data: {userId: userIdes.currentUserId}
                                })  
                                if(result.count >= 0){ 
                                    
                                    try {
                                        let registerResetAmount = currencyUtils.registerAccountRootTransactionGenerator(10000);
                                        let rootAssetUpdateResult = await prisma.rootasset.update({
                                            where: {id: 1},
                                            data: {
                                                demoTotalWalletWithdrawal: {increment: registerResetAmount.demoTotalWalletWithdrawal},
                                                demoCurrentBalance: {decrement: registerResetAmount.demoCurrentBalance},
                                                demoTotalCommission: {increment: registerResetAmount.demoTotalCommission},
                                                demoTotalAppCommission: {increment: registerResetAmount.demoTotalAppCommission},
                                                demoTotalPartnerCommission: {increment: registerResetAmount.demoTotalPartnerCommission}
                                            }
                                        }) 
                                        if(rootAssetUpdateResult && rootAssetUpdateResult?.id){
                                            try {
                                                let rootAssetTransaction = await prisma.rootassettransaction.create({
                                                    data: {
                                                        userId: userIdes.currentUserId,
                                                        isIn: 'false',
                                                        transactionType: 'demoWalletWithdrawal',
                                                        amount: 10000,
                                                        balanceType: "DEMO"
                                                    }
                                                })
                                                if(rootAssetTransaction && rootAssetTransaction?.id){
                                                    let registerAccountUserTransactionGenerator = currencyUtils.registerAccountUserTransactionGenerator(10000, userIdes.currentUserId, referralCode);

                                                    try {
                                                        let resultTransactionInsert = await prisma.transaction.createMany({
                                                            data: registerAccountUserTransactionGenerator
                                                        }) 
                                                        if(resultTransactionInsert && resultTransactionInsert?.count > 0){
                                                            res.json({token: tokenResult, auth: result}); 
                                                        }else{
                                                            next(new Error('Internal server error!'))
                                                        }
                                                    } catch (error) {
                                                        next(new Error(error.message))
                                                    }
                                                }else{
                                                    next(new error('Internal server error!'))
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
                                    next(new Error('UserId updated failed!'))
                                }
                            } catch (error) {  
                                next(new Error('UserId updated failed!'))
                            }
                        }else{
                            next(new Error('UserId updated failed!'))
                        }
                    }else{
                        let newError = new Error('Unauthenticated');
                            newError.status = 401;
                            next(newError)
                    }
                } catch (error) {
                    next(new Error('Internal server Error!'))
                }
            } catch (error) {   
                console.log(error.message);
                next(new Error('Already Email Or Phone Existed!'))
            }
        }else{
            next(new Error('Invalid password requested!'))
        }
    }else{
        next(new Error('Invalid server request'))
    }
});
const handleLoginUser = asyncHandler(async(req, res, next) => {
    let {email, phone, password, prevUserId} = req.body;
    if(email && phone && password && prevUserId){
        try {
            let result = await prisma.user.findFirst({
                where:{
                    email, phone
                }
            }) 
            if(result){
                try {
                    let passComResult = await comparePasswords(password, result.password);
                    if(passComResult.status__code === 200){ 
                        try {
                            if(Number(result.role) <= 6 && result.isDisabled === 'false' && result.isJail === 'false'){
                                try {
                                    let currentUserPrevConnectedListDelete = await prisma.connectedlist.deleteMany({where: {userId: result.userId}});
                                    if(currentUserPrevConnectedListDelete && currentUserPrevConnectedListDelete.count >= 0){ 
                                        try {
                                            let resultU = await prisma.connectedlist.updateMany({
                                                where: {userId: prevUserId},
                                                data: {userId: result.userId}
                                            }) 
                                            if(resultU.count >= 0){
                                                let tokenResult = await generateToken(result); 
                                                delete result.password;
                                                res.json({token: tokenResult, auth: result});
                                            }else{   
                                                next(new Error('User Id Updated Failed!'))
                                            }
                                        } catch (error) { 
                                            next(new Error('User Id Updated Failed!'))
                                        }
                                    }else{ 
                                        next(new Error('Internal server error!'))
                                    }
                                } catch (error) {
                                    next(new Error(error.message))
                                }
                            }else{
                                let newError = new Error('Unauthenticated');
                                    newError.status = 401;
                                    next(newError)
                            }
                        } catch (error) {
                            next(new Error('Internal server Error!'))
                        }
                    }else{
                        next(new Error('Invalid email / phone/ password!'))
                    }
                } catch (error) {
                    next(new Error('Invalid email / phone/ password!'))
                }
            }else{
                next(new Error('Invalid email or phone number!'))
            }

        } catch (error) {
            next(new Error('Invalid email or phone number!'))
        }   
    }else{
        next(new Error('Invalid server request!'))
    }
});
const verifyUserReEnter = asyncHandler(async(req, res) => {
    if(req.body?.token){ 
        try {
            let result = await verifyToken(req.body.token);
            if(result && result.userInfo){
                try {
                    let latestUserInfo = await prisma.user.findUnique({
                        where: {id: result.userInfo.id}
                    }) 
                    if(latestUserInfo && latestUserInfo.isDisabled === 'false' && latestUserInfo.isJail === 'false'){
                        res.json(latestUserInfo)
                    }else{
                        next(new Error('Account disabled'))
                    }
                } catch (error) {
                    res.status(401).json('Unauthenticated request!');
                }
            }else{
                res.status(401).json('Unauthenticated request!');
            }
        } catch (error) { 
            res.status(401).json(error.message);
        } 
    }else{
        res.status(401).json('Unauthenticated request!');
    }
});
const updateDesignation = asyncHandler(async(req, res, next) => {
    let {email, role, designation, adminId} = req.body;
    if(email && role && designation && adminId){
        try {
            let result = await prisma.user.update({
                where: {email},
                data: {email, role, designation}
            }) 
            if(result && result?.id && result.isJail === 'false' && result.isDisabled === 'false'){
                res.json(result);
            }else{
                next(new Error("User not founded!"));
            }
        } catch (error) {
            // console.log(error.message);
            console.log(email, role, designation);
            next(new Error('User not founded'))
        }
    }else{
        next(new Error('Invalid server request!'))
    }
});
const toggleUserInvitation = asyncHandler(async(req, res, next) => {
    let {email, userId} = req.body;
    if(email && userId){
        try {
            let getCurrentResult = await prisma.user.findUnique({where: {email, userId}});
            if(getCurrentResult && getCurrentResult?.id > 0){
                let prevInvitation = getCurrentResult.invitation;
                if(prevInvitation === 'Enable'){
                    prevInvitation = 'Disable'
                }else{
                    prevInvitation = 'Enable'
                }
                try {
                    let userUpdateResult = await prisma.user.update({where: {email, userId}, data: {invitation: prevInvitation}});
                    if(userUpdateResult && userUpdateResult?.id > 0){
                        res.json(userUpdateResult);
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
            next(new Error('User not founded'))
        }
    }else{
        next(new Error('Invalid server request!'))
    }
});
const handleDeleteSingleUser = asyncHandler(async(req ,res, next)=>{
    let {id} = req.body;
    if(id){
        try {
            let walletDeleteResult = await prisma.user.delete({
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
const handleDisabledSingleAccount = asyncHandler(async(req ,res, next)=>{
    let {id} = req.body;
    if(id){
        try {
            let walletDeleteResult = await prisma.user.update({
                where: {id},
                data: {
                    isDisabled: 'true',
                    isJail: 'true'
                }
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
const handleGetAllAdmin = asyncHandler(async(req ,res, next)=>{
    try {
        let walletResult = await prisma.user.findMany({where: {designation: 'admin'},select: {email: true, id: true, phone: true, userId: true, role: true, designation: true, isJail: true}});
        if(walletResult && walletResult.length > 0){
            res.json(walletResult)
        }else{ 
            res.json([]);
        }
    } catch (error) {
        next(new Error(error.message))
    }
});
const handleGetAllUser = asyncHandler(async(req ,res, next)=>{
    try {
        let walletResult = await prisma.user.findMany({where: {designation: 'user'}, select: {email: true, isJail: true, role: true, designation: true, id: true, phone: true, userId: true}});
        if(walletResult && walletResult.length > 0){
            res.json(walletResult)
        }else{ 
            res.json([]);
        }
    } catch (error) {
        next(new Error(error.message))
    }
});
const handleActiveSingleAccount = asyncHandler(async(req ,res, next)=>{
    let {id} = req.body;
    if(id){
        try {
            let walletDeleteResult = await prisma.user.update({
                where: {id},
                data: {
                    isDisabled: 'false',
                    isJail: 'false'
                }
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
const handleUserBalanceTransfer = asyncHandler(async(req ,res, next)=>{
    let {userId, receiverId, amount, password, backupPassword} = req.body;
    if(amount && userId && receiverId && password  && backupPassword){
        try {
            let getSingleUserResult = await prisma.user.findUnique({where: {userId}});
            if(getSingleUserResult && getSingleUserResult.id){
                if(Number(getSingleUserResult.realBalance) >= Number(amount) && getSingleUserResult.isDisabled === 'false' && getSingleUserResult.isJail === 'false'){
                    try {
                        let receiverResult = await prisma.user.findUnique({where:{userId:receiverId}});
                        if(receiverResult && receiverResult.id > 0){
                            try {
                                let comparePasswordResult = await comparePasswords(backupPassword, getSingleUserResult.password);
                                if(comparePasswordResult.status__code === 204){
                                    try {
                                        let comparePasswordResult = await comparePasswords(password, getSingleUserResult.password);
                                        if(comparePasswordResult.status__code === 200){
                                            try {
                                                let backupPasswordResult = await prisma.backuppassword.findUnique({where:{email: getSingleUserResult.email}});
                                                if(backupPasswordResult && backupPasswordResult.id > 0){
                                                    try {
                                                        let comparePasswordResult = await comparePasswords(backupPassword, backupPasswordResult.password);
                                                        if(comparePasswordResult.status__code === 200){
                                                            let transaction = currencyUtils.transferBalanceTransactionGenerator(amount,receiverId,receiverResult.referralCode,userId);
                                                            try {
                                                                console.log(amount);
                                                                let senderUpdate = await prisma.user.update({where: {userId},data:{realBalance:{decrement:Number(amount)}}});
                                                                if(senderUpdate && senderUpdate.id > 0){
                                                                    try {
                                                                        let receiverUpdate = await prisma.user.update({where: {userId:receiverId},data:{realBalance:{increment:Number(transaction.increment)}}});
                                                                        if(receiverUpdate && receiverUpdate.id > 0){
                                                                            try {
                                                                                let transactionCreateResult = await prisma.transaction.createMany({data: transaction.transactions});
                                                                                if(transactionCreateResult && transactionCreateResult.count > 0){
                                                                                    res.json({senderUpdate,receiverUpdate})
                                                                                }else{
                                                                                    next(new Error('Error occurred while creating transfer transaction'))
                                                                                }
                                                                            } catch (error) {
                                                                                next(new Error(error.message))
                                                                            }
                                                                        }else{
                                                                            next('Error occurred while increment receiver balance')
                                                                        }
                                                                    } catch (error) {
                                                                        next(new Error(error.message))
                                                                    }
                                                                }else{
                                                                    next('Error occurred while decrement sender balance')
                                                                }
                                                            } catch (error) {
                                                                next(new Error(error.message))
                                                            }
                                                        }else{
                                                            next(new Error('Incorrect old password provided!'));
                                                        }
                                                    } catch (error) {
                                                        next(new Error('Incorrect password password provided!'));
                                                    }
                                                }else{
                                                    next(new Error('Backup password not founded!'))
                                                }
                                            } catch (error) {
                                                next(new Error(error.message))
                                            }
                                        }else{
                                            next(new Error('Incorrect old password provided!'));
                                        }
                                    } catch (error) {
                                        next(new Error('Incorrect password password provided!'));
                                    }
                                }else{
                                    next(new Error('Password and backup password must be different!'));
                                }
                            } catch (error) {
                                next(new Error('Please use different password!'));
                            }
                        }else{
                            next(new Error('Receiver User Not founded!'))
                        }
                    } catch (error) {
                        next(new Error(error.message))
                    }
                }else{
                    next(new Error('Balance low!'))
                }
            }else{
                next(new Error('Internal server  error!'))
            }
        } catch (error) { 
            next(new Error('Wallet already existed!'))
        }
    }else{
        next(new Error(`Invalid server request!`));
    }
});
const handleReferralBalanceTransfer = asyncHandler(async(req ,res, next)=>{
    let {userId, balanceType, password, backupPassword} = req.body;
    if( userId && balanceType && password  && backupPassword){
        try {
            let getSingleUserResult = await prisma.user.findUnique({where: {userId}});
            if(getSingleUserResult && getSingleUserResult.id){
                try {
                    let comparePasswordResult = await comparePasswords(backupPassword, getSingleUserResult.password);
                    if(comparePasswordResult.status__code === 204){
                        try {
                            let comparePasswordResult = await comparePasswords(password, getSingleUserResult.password);
                            if(comparePasswordResult.status__code === 200){
                                try {
                                    let backupPasswordResult = await prisma.backuppassword.findUnique({where:{email: getSingleUserResult.email}});
                                    if(backupPasswordResult && backupPasswordResult.id > 0){
                                        try {
                                            let comparePasswordResult = await comparePasswords(backupPassword, backupPasswordResult.password);
                                            if(comparePasswordResult.status__code === 200){ 
                                                try {
                                                    let balanceResult = await prisma.transaction.aggregate({where: {userId, used: 'false', balanceType: balanceType, isIn: 'IN', typeName: {contains: 'COMMISSION'}},_sum:{amount: true}});
                                                    let totalBalance = balanceResult && balanceResult._sum.amount;
                                                    if(totalBalance > 0){
                                                        try {
                                                            let transactionUpdateResult = await prisma.transaction.updateMany({
                                                                where: {userId, used: 'false', balanceType: balanceType, isIn: 'IN', typeName: {contains: 'COMMISSION'}},
                                                                data: {
                                                                    used: 'true'
                                                                }
                                                            })
                                                            if(transactionUpdateResult && transactionUpdateResult?.count > 0){
                                                                try {
                                                                    let userUpdateResult = await prisma.user.update({
                                                                        where: {userId},
                                                                        data: {
                                                                            [`${balanceType.toLowerCase()}Balance`]: {increment: totalBalance}
                                                                        }
                                                                    });
                                                                    if(userUpdateResult && userUpdateResult?.id > 0){
                                                                        res.json(userUpdateResult)
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
                                                        next(new Error('You have not any '+balanceType+' balance'));
                                                    }
                                                } catch (error) {
                                                    next(new Error(error.message))
                                                }
                                            }else{
                                                next(new Error('Incorrect old password provided!'));
                                            }
                                        } catch (error) {
                                            next(new Error('Incorrect password password provided!'));
                                        }
                                    }else{
                                        next(new Error('Backup password not founded!'))
                                    }
                                } catch (error) {
                                    next(new Error(error.message))
                                }
                            }else{
                                next(new Error('Incorrect old password provided!'));
                            }
                        } catch (error) {
                            next(new Error('Incorrect password password provided!'));
                        }
                    }else{
                        next(new Error('Password and backup password must be different!'));
                    }
                } catch (error) {
                    next(new Error('Please use different password!'));
                }
            }else{
                next(new Error('Internal server  error!'))
            }
        } catch (error) { 
            next(new Error('Wallet already existed!'))
        }
    }else{
        next(new Error(`Invalid server request!`));
    }
});

module.exports = {
    handleLoginUser,
    handleRegisterUser,
    verifyUserReEnter,
    updateDesignation,
    handleDeleteSingleUser,
    handleGetAllAdmin,
    handleDisabledSingleAccount,
    handleGetAllUser,
    handleActiveSingleAccount,
    toggleUserInvitation,
    handleUserBalanceTransfer,
    handleReferralBalanceTransfer
};

// try {
//     let receiverUpdate = await prisma.user.update({where: {userId:receiverId},data:{realBalance:{increment:Number(transaction.increment)}}});
//     if(receiverUpdate && receiverUpdate.id > 0){
//         try {
//             let transactionCreateResult = await prisma.transaction.createMany({data: transaction.transactions});
//             if(transactionCreateResult && transactionCreateResult.count > 0){
//                 res.json({senderUpdate,receiverUpdate})
//             }else{
//                 next(new Error('Error occurred while creating transfer transaction'))
//             }
//         } catch (error) {
//             next(new Error(error.message))
//         }
//     }else{
//         next('Error occurred while increment receiver balance')
//     }
// } catch (error) {
//     next(new Error(error.message))
// }