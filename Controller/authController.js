
const asyncHandler = require('express-async-handler');
const { hashPassword, comparePasswords } = require('../utils/Password');
const { generateToken, verifyToken } = require('../utils/jsonwebtoken');
const { currencyUtils } = require('../utils/CurrencyUtils'); 
const User = require('../models/User');
const ConnectedList = require('../models/ConnectedList');
const RootAsset = require('../models/RootAsset');
const RootTransaction = require('../models/RootTransaction');
const Transaction = require('../models/Transaction');
const BackupPassword = require('../models/BackupPassword');
const { Op } = require('sequelize');
const InRoom = require('../models/InRoom');
const jsonConverterUtils = require('../utils/JsonConverter');
const Board = require('../models/Board');
const Currency = require('../models/Currency');
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
                let result = await User.create({...postData, password: passwordResult.password, realBalance: currentBalance})  
                try {
                    if(Number(result.role) <= 6){
                        let tokenResult = await generateToken(result); 
                        delete result.password;
                        
                        if(userIdes && userIdes.prevUserId && userIdes.currentUserId){
                            try {
                                let result = await ConnectedList.update({userId: userIdes.currentUserId}, {
                                    where: {userId: userIdes.prevUserId}
                                })  
                                if(result && result[0]){ 
                                    
                                    try {
                                        let registerResetAmount = currencyUtils.registerAccountRootTransactionGenerator(10000);
                                        let rootAssetUpdateResult = await RootAsset.increment({
                                            demoTotalWalletWithdrawal:  registerResetAmount.demoTotalWalletWithdrawal,
                                            demoCurrentBalance: -registerResetAmount.demoCurrentBalance,
                                            demoTotalCommission: registerResetAmount.demoTotalCommission,
                                            demoTotalAppCommission: registerResetAmount.demoTotalAppCommission,
                                            demoTotalPartnerCommission: registerResetAmount.demoTotalPartnerCommission
                                        },{
                                            where: {id: 1}
                                        }) 
                                        if(rootAssetUpdateResult && rootAssetUpdateResult[0] && rootAssetUpdateResult[0][1] > 0){
                                            try {
                                                let rootAssetTransaction = await RootTransaction.create({
                                                        userId: userIdes.currentUserId,
                                                        isIn: 'false',
                                                        transactionType: 'demoWalletWithdrawal',
                                                        amount: 10000,
                                                        balanceType: "DEMO"
                                                    })
                                                if(rootAssetTransaction && rootAssetTransaction?.id){
                                                    let registerAccountUserTransactionGenerator = currencyUtils.registerAccountUserTransactionGenerator(10000, userIdes.currentUserId, referralCode);

                                                    try {
                                                        let resultTransactionInsert = await Transaction.bulkCreate(registerAccountUserTransactionGenerator) 
                                                        if(resultTransactionInsert && resultTransactionInsert?.length > 0){
                                                            try {
                                                                let userResult = await User.findOne({where: {userId}});
                                                                res.json({token: tokenResult, auth: userResult});
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
                                                    next(new error('Internal server error!'))
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
            let result = await User.findOne({
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
                                    let currentUserPrevConnectedListDelete = await ConnectedList.destroy({where: {userId: result.userId}});
                                    try { 
                                        let resultU = await ConnectedList.update({userId: result.userId},{where: {userId: prevUserId}}) 
                                        let tokenResult = await generateToken(result); 
                                        delete result.password;
                                        res.json({token: tokenResult, auth: result});
                                    } catch (error) { 
                                        next(new Error('User Id Updated Failed!'))
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
                    let latestUserInfo = await User.findOne({
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
            let result = await User.update({email, role, designation}, {
                where: {email},
            }) 
            if(result && result[0]){
                try {
                    let result = await User.findOne({where: {email}})
                    if(result.isJail === 'false' && result.isDisabled === 'false'){
                        res.json(result)
                    }else{
                        res.status(401).json('Unauthenticated request!');
                    }
                } catch (error) {
                    next(new Error('Internal server error!'))
                }
            }else{
                next(new Error("User not founded!"));
            }
        } catch (error) {  
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
            let getCurrentResult = await User.findOne({where: {email, userId}});
            if(getCurrentResult && getCurrentResult?.id > 0){
                let prevInvitation = getCurrentResult.invitation;
                if(prevInvitation === 'Enable'){
                    prevInvitation = 'Disable'
                }else{
                    prevInvitation = 'Enable'
                }
                try {
                    let userUpdateResult = await User.update({invitation: prevInvitation},{where: {email, userId}});
                    if(userUpdateResult && userUpdateResult[0]){
                        try {
                            let result = await User.findOne({where: {userId: userId, email}});
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
            let walletDeleteResult = await User.destroy({
                where: {id}
            })
            if(walletDeleteResult && walletDeleteResult > 0){
                res.json({id: id})
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
            let walletDeleteResult = await User.update({
                isDisabled: 'true',
                isJail: 'true'
            },{
                where: {id}
            })
            if(walletDeleteResult && walletDeleteResult.id > 0){
                res.json({id})
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
        let walletResult = await User.findAll({where: {designation: 'admin'}, attributes: ['email', 'id', 'phone', 'userId', 'role', 'designation', 'isJail']});
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
        let walletResult = await User.findAll({where: {designation: 'user'}, attributes: ['email', 'id', 'phone', 'userId', 'role', 'designation', 'isJail']});
        if(walletResult && walletResult.length > 0){
            res.json(walletResult);
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
            let walletDeleteResult = await User.update({
                isDisabled: 'false',
                isJail: 'false'
            },{
                where: {id},
            })
            if(walletDeleteResult && walletDeleteResult[0] > 0){
                res.json({id});
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
    let {userId, receiverId, amount, password, backupPassword, currency} = req.body;
    if(amount && userId && receiverId && password  && backupPassword){
        try {
            let getSingleUserResult = await User.findOne({where: {userId}});
            if(getSingleUserResult && getSingleUserResult.id){
                try {
                    let currencyResult = await Currency.findOne({where: {
                        name: currency
                    }});
                    if(currencyResult && currencyResult.id){
                        let amountConvertToDollar = Number(amount) / Number(currencyResult.currencyRate); 
                        if(Number(getSingleUserResult.realBalance) >= Number(amountConvertToDollar) && getSingleUserResult.isDisabled === 'false' && getSingleUserResult.isJail === 'false'){
                            try {
                                let receiverResult = await User.findOne({where:{userId:receiverId}});
                                if(receiverResult && receiverResult.id > 0){
                                    try {
                                        let comparePasswordResult = await comparePasswords(backupPassword, getSingleUserResult.password);
                                        if(comparePasswordResult.status__code === 204){
                                            try {
                                                let comparePasswordResult = await comparePasswords(password, getSingleUserResult.password);
                                                if(comparePasswordResult.status__code === 200){
                                                    try {
                                                        let backupPasswordResult = await BackupPassword.findOne({where:{email: getSingleUserResult.email}});
                                                        if(backupPasswordResult && backupPasswordResult.id > 0){
                                                            try {
                                                                let comparePasswordResult = await comparePasswords(backupPassword, backupPasswordResult.password);
                                                                if(comparePasswordResult.status__code === 200){
                                                                    let transaction = currencyUtils.transferBalanceTransactionGenerator(amountConvertToDollar,receiverId,receiverResult.referralCode,userId);
                                                                    try { 
                                                                        let senderUpdate = await User.decrement({realBalance: Number(amountConvertToDollar)},{where: {userId}});
                                                                        if(senderUpdate && senderUpdate[0] && senderUpdate[0][1] > 0){
                                                                            try {
                                                                                let receiverUpdate = await User.increment({realBalance: Number(transaction.increment)},{where: {userId:receiverId}});
                                                                                if(receiverUpdate && receiverUpdate[0] && receiverUpdate[0][1] > 0){
                                                                                    try {
                                                                                        let transactionCreateResult = await Transaction.bulkCreate(transaction.transactions);
                                                                                        if(transactionCreateResult && transactionCreateResult.length > 0){
                                                                                            res.json({senderUpdate: {id: 2, userId},receiverUpdate: {id: 3, userId: receiverId}})
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
                        next(new Error('Currency not found!'))
                    }
                } catch (error) {
                    next(new Error(error.message))
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
            let getSingleUserResult = await User.findOne({where: {userId}});
            if(getSingleUserResult && getSingleUserResult.id){
                try {
                    let comparePasswordResult = await comparePasswords(backupPassword, getSingleUserResult.password);
                    if(comparePasswordResult.status__code === 204){
                        try {
                            let comparePasswordResult = await comparePasswords(password, getSingleUserResult.password);
                            if(comparePasswordResult.status__code === 200){
                                try {
                                    let backupPasswordResult = await BackupPassword.findOne({where:{email: getSingleUserResult.email}});
                                    if(backupPasswordResult && backupPasswordResult.id > 0){
                                        try {
                                            let comparePasswordResult = await comparePasswords(backupPassword, backupPasswordResult.password);
                                            if(comparePasswordResult.status__code === 200){ 
                                                try { 
                                                    let balanceResult = await Transaction.sum('amount',{where: {userId, used: 'false', balanceType: balanceType, isIn: 'IN', typeName: { [Op.like]: '%COMMISSION%'}}});  
                                                    if(balanceResult > 0){
                                                        try {
                                                            let transactionUpdateResult = await Transaction.update({
                                                                used: 'true'
                                                            },{
                                                                where: {userId, used: 'false', balanceType: balanceType, isIn: 'IN', typeName: {[Op.like]: '%COMMISSION'}}
                                                            })
                                                            if(transactionUpdateResult && transactionUpdateResult[0]){
                                                                try {
                                                                    let userUpdateResult = await User.increment({
                                                                        [`${balanceType.toLowerCase()}Balance`]:  balanceResult
                                                                    },{
                                                                        where: {userId}
                                                                    });
                                                                    if(userUpdateResult && userUpdateResult[0] && userUpdateResult[0][1] > 0){
                                                                        res.json({id: 1, userId})
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
const handleResetConnection = asyncHandler(async(req, res, next) => {
    let { userId } = req.params; 
    if (userId) {
        try {
            let roomResult = await InRoom.findOne({
                where: {
                    id: 1
                }
            });
            if(roomResult && roomResult.id){
                roomResult = jsonConverterUtils.singleInRoomConverter(roomResult); 
                let newRoomInfo ={...roomResult}
                newRoomInfo.userIdes = newRoomInfo.userIdes.filter((info)=> info !== userId);
                newRoomInfo.roomWithId = newRoomInfo.roomWithId.filter((info)=> info.adminId !== userId);
                try {
                    let roomUpdateResult = await InRoom.update(newRoomInfo,{where: {id: 1}});
                    if(roomUpdateResult && roomUpdateResult[0]){
                        try {
                            let result = await Board.findAll({}); 
                            if(result && result.length > 0){
                                result = jsonConverterUtils.multipleBoard(result);
                                let newResult = [...result];
                                let roomId = '';
                                let roomInfo = '';
                                    newResult = newResult.map((info)=>{
                                        if(info.member.indexOf(userId) !== -1 && !roomId){
                                            roomId = info.roomId;
                                            let newInfo = {...info};
                                            newInfo.member = newInfo.member.filter((info)=> info !== userId);
                                            newInfo.accessIdes = newInfo.accessIdes.filter((info)=> info !== userId);
                                            newInfo.player = newInfo.player.filter((info)=> info.userId !== userId);
                                            roomInfo = newInfo;
                                            return newInfo;
                                        }else{
                                            return info;
                                        }
                                    });
                                if(roomId && roomInfo){
                                    try {
                                        let roomUpdateResult = await Board.update(roomInfo,{where: {roomId}});
                                        if(roomUpdateResult && roomUpdateResult[0]){
                                            res.json({message: 'Successfully reset connection!', status__code: 200});
                                        }else{
                                            next(new Error('Internal server error!'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    }
                                    
                                }else{
                                    res.json({message: 'Successfully reset connection!', status__code: 200});
                                }
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
                res.json({message: 'Successfully reset connection!', status__code: 200})
            }
        } catch (error) {
            next(new Error(error.message));
        }
    } else {
        next(new Error('Internal server Error!'));
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
    handleReferralBalanceTransfer,
    handleResetConnection
};
