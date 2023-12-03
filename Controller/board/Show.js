const asyncHandler = require('express-async-handler'); 
const { cardUtils } = require('../../utils/cardUtils');
const { uid } = require('uid'); 
const Board = require('../../models/Board');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const RootAsset = require('../../models/RootAsset');
const ConnectedList = require('../../models/ConnectedList');
const jsonConverterUtils = require('../../utils/JsonConverter');
const PlayingHistory = require('../../models/PlayingHistory');

const handleShowMyCard = asyncHandler(async(req, res, next)=>{
    let {roomId, userId, id} = req.body;
    if(roomId && userId && id){
        try {
            let myRoomResult = await Board.findOne({
                where: {roomId}
            }) 
            myRoomResult = jsonConverterUtils.singleBoard(myRoomResult); 
            if(myRoomResult && myRoomResult?.id > 0 && myRoomResult.isStart === 'true' && myRoomResult.currentId === userId){
                let nowCurrentPlaying = [...myRoomResult.playing].filter((info)=> info.packed === false);
                if(nowCurrentPlaying.length === 2){
                    try {
                        let myUserInfo = await User.findOne({
                            where: {userId}
                        })
                        if(myUserInfo && myUserInfo?.id > 0){
                            if(Number(myRoomResult.blind) <= Number(myUserInfo[`${myRoomResult.balanceType.toLowerCase()}Balance`])){
                                try {
                                    let myUserUpdateResult = await User.increment({
                                        [`${myRoomResult.balanceType.toLowerCase()}Balance`]:  -Number(myRoomResult.blind)
                                    },{
                                        where: {userId}
                                    })
                                    
                                    if(myUserUpdateResult && myUserUpdateResult[0] && myUserUpdateResult[0][1]){
                                        let NBT = myRoomResult.balanceType.toLowerCase();
    
                                        // commission calculating start
                                        let totalBalance = Number(myRoomResult.blind)
                                        let currentCommission = (totalBalance / 100) * Number(process.env[`${NBT}BoardFee`]);
                                        let currentBalance = (totalBalance / 100) * (100 - Number(process.env[`${NBT}BoardFee`]));
                                        let totalAppCommission = currentCommission / 2;
                                        let totalPartnerCommission = currentCommission / 2;
                                        // commission calculating end
    
                                        let allUserTransaction = [];
                                        let recentTxrId = uid(8); 
                                        let boardTransaction = {
                                            typeName: 'CARD SHOW',
                                            isIn: 'OUT',
                                            amount:  currentBalance,
                                            txrId: recentTxrId,
                                            userId: myUserInfo.userId,
                                            sourceId: myUserInfo.referralCode,
                                            balanceType:  NBT.toUpperCase()
                                        }
                                        let boardFeeCommission = {
                                            typeName: 'CARD SHOW COMMISSION',
                                            isIn: 'OUT',
                                            amount: currentCommission,
                                            txrId: recentTxrId,
                                            userId: myUserInfo.userId,
                                            sourceId: myUserInfo.referralCode,
                                            balanceType:  NBT.toUpperCase()
                                        }
                                        let boardFeeAppCommission = {
                                            typeName: 'CARD SHOW COMMISSION',
                                            isIn: 'IN',
                                            amount: totalAppCommission,
                                            txrId: recentTxrId,
                                            userId: '999999999999',
                                            sourceId: myUserInfo.userId,
                                            balanceType:  NBT.toUpperCase()
                                        }
                                        let boardFeePartnerCommission = {
                                            typeName: 'CARD SHOW COMMISSION',
                                            isIn: 'IN',
                                            amount: totalPartnerCommission,
                                            txrId: recentTxrId,
                                            userId: myUserInfo.referralCode,
                                            sourceId: myUserInfo.userId,
                                            balanceType:  NBT.toUpperCase()
                                        }
                                        if(boardTransaction.amount > 0){
                                            allUserTransaction.push(boardTransaction);
                                        }
                                        if(boardFeeCommission.amount > 0){
                                            allUserTransaction.push(boardFeeCommission)
                                        }
                                        if(boardFeeAppCommission.amount > 0){
                                            allUserTransaction.push(boardFeeAppCommission)
                                        }   
                                        if(boardFeePartnerCommission.amount > 0){
                                            allUserTransaction.push(boardFeePartnerCommission)
                                        }
    
                                        try {
                                            let myTransactionCreateResult = await Transaction.bulkCreate(allUserTransaction);
                                            if(myTransactionCreateResult && myTransactionCreateResult.length){
                                                try {
                                                    let rootAssetUpdateResult = await RootAsset.increment({
                                                        [`${NBT}TotalCommission`]: currentCommission,
                                                        [`${NBT}TotalAppCommission`]: totalAppCommission,
                                                        [`${NBT}TotalPartnerCommission`]: totalPartnerCommission
                                                    },{
                                                        where: {id: 1}
                                                    })
                                                    if(rootAssetUpdateResult && rootAssetUpdateResult[0] && rootAssetUpdateResult[0][1]){
                                                        let newPlaying = [...myRoomResult.playing]; 
                                                        let myPlayingInfo = newPlaying.filter((info)=> info.userId === myRoomResult.currentId)[0];
                                                        let nextPlayingInfo = newPlaying.filter((info)=> info.userId === myRoomResult.nextId)[0]; 
                                                        let result = cardUtils.sideHandlerWithTwoUserCardCompare(myPlayingInfo.card, nextPlayingInfo.card);
                                                        if(result){
                                                            newPlaying = newPlaying.map((info)=>{
                                                                if(info.userId === nextPlayingInfo.userId){
                                                                    let newInfo = {...info};
                                                                        newInfo.isTurn = false;
                                                                        newInfo.packed = true;
                                                                        newInfo.packedReasonMess.push({
                                                                            bengali: `${myPlayingInfo.name} যখন তার কার্ড তোমার সাথে  শো করে তখন সে বিজয়ী হয় `,
                                                                            english: `${myPlayingInfo.name} wins when he shows his card to you`
                                                                        })
                                                                        newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                                        return newInfo;
                                                                }else{
                                                                    return info;
                                                                }
                                                            })
                                                            let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                                            
                                                            let winnerPlaying = resetPlaying[0];
                                                            newPlaying = newPlaying.map((info)=>{
                                                                if(info.userId === winnerPlaying.userId){
                                                                    let newInfo = {...info};
                                                                        newInfo.isTurn = false;
                                                                        newInfo.packed = true; 
                                                                        newInfo.packedReasonMess.push({
                                                                            bengali: `আপনি খেলার প্রধান বিজয়ী `,
                                                                            english: `You are the main winner of the game`
                                                                        });
                                                                        return newInfo;
                                                                }else{
                                                                    return info;
                                                                }
                                                            });
                                                            try {
                                                                let userBalanceUpdateResult = await User.increment({
                                                                    [`${myRoomResult.balanceType.toLowerCase()}Balance`]: Number(myRoomResult.currentBalance)+Number(currentBalance)
                                                                },{
                                                                    where:{userId: winnerPlaying.userId}
                                                                })
                                                                if(userBalanceUpdateResult && userBalanceUpdateResult[0] && userBalanceUpdateResult[0][1]){
                                                                        let recentTxrId = uid(8); 
                                                                        let boardTransaction = {
                                                                            typeName: 'GAME WIN BY CARD SHOW',
                                                                            isIn: 'IN',
                                                                            amount:  Number(myRoomResult.currentBalance)+Number(currentBalance),
                                                                            txrId: recentTxrId,
                                                                            userId: winnerPlaying.userId,
                                                                            sourceId: winnerPlaying.referralCode,
                                                                            balanceType: myRoomResult.balanceType.toUpperCase()
                                                                        }
                                                                        try {
                                                                            let transactionCreateResult = await Transaction.create(boardTransaction)
                                                                            if(transactionCreateResult && transactionCreateResult?.id > 0){
                                                                                let myRoomUpdateResult = await Board.update({
                                                                                    playing: [],
                                                                                    totalBalance: 0,
                                                                                    currentBalance: 0,
                                                                                    currentCommission: 0,
                                                                                    round: 0,
                                                                                    currentId: 'false',
                                                                                    nextId: 'false',
                                                                                    previousId: 'false',
                                                                                    isStart: 'false',
                                                                                    blind: myRoomResult.rootBlind,
                                                                                    chaal: myRoomResult.rootChaal,
                                                                                    rootBlind: 0,
                                                                                    rootChaal: 0,
                                                                                    cardViewTill: new Date(new Date().setMilliseconds(40000)),
                                                                                },{
                                                                                    where:{roomId, id}
                                                                                });
                                                                                if(myRoomUpdateResult && myRoomUpdateResult[0]){
                                                                                    try {
                                                                                        let myRoomUpdateResult = await Board.findOne({where: {roomId, id}});
                                                                                            myRoomUpdateResult = jsonConverterUtils.singleBoard(myRoomUpdateResult);
                                                                                        if(myRoomUpdateResult && myRoomUpdateResult.id){
                                                                                            try {
                                                                                                let resultGetAllConnectedList = await ConnectedList.findAll({attributes:['socketId']})
                                                                                                if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                                                    let boardHistory = {
                                                                                                        winnerId: winnerPlaying.userId,
                                                                                                        members: [],
                                                                                                        playingInfo: newPlaying
                                                                                                    }
                                                                                                    newPlaying.forEach((info)=>{
                                                                                                        boardHistory.members.push(info.userId);
                                                                                                    })
                                                                                                    try {
                                                                                                        let playingHistoryResult = await PlayingHistory.create(boardHistory);
                                                                                                        if(playingHistoryResult && playingHistoryResult.id){
                                                                                                            let newRoomInfo = {...myRoomUpdateResult};
                                                                                                            newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                                                                delete playingInfo.card;
                                                                                                                return playingInfo;
                                                                                                            })
        
                                                                                                            resultGetAllConnectedList.forEach((info)=>{
                                                                                                                io.sockets.in(info.socketId).emit('boardFinishWithIncrementAndDecrement',{roomId: roomId, roomInfo: newRoomInfo, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance)+Number(currentBalance), decrement: myRoomResult.blind, playingInfo: newPlaying})
                                                                                                            });
                                                                                                            res.json({roomId: roomId, roomInfo: newRoomInfo, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance)+Number(currentBalance), decrement: myRoomResult.blind, playingInfo: newPlaying});
                                                                                                        }else{
                                                                                                            next(new Error('Playing history updated fail!'))
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
                                                                                    next(new Error('Internal server error while updating my board'))
                                                                                }
                                                                            }else{
                                                                                next( new Error('Internal server error while create transaction'))
                                                                            }
                                                                        } catch (error) {
                                                                            next(new Error(error.message))
                                                                        }
                                                                }else{
                                                                    next(new Error('Internal server error while user balance update'))
                                                                }
                                                            } catch (error) {
                                                                next(new Error(error.message))
                                                            }
                                                        }else{
                                                            newPlaying = newPlaying.map((info)=>{
                                                                if(info.userId === myPlayingInfo.userId){
                                                                    let newInfo = {...info};
                                                                        newInfo.isTurn = false;
                                                                        newInfo.packed = true;
                                                                        newInfo.packedReasonMess.push({
                                                                            bengali: `${nextPlayingInfo.name} এর সাথে যখন তুমি তোমার কার্ড শো করো তখন ${nextPlayingInfo.name} বিজয়ী হয় এবং তুমি পরাজিত হও। `,
                                                                            english: `When you show your cards with ${nextPlayingInfo.name}, ${nextPlayingInfo.name} wins and you lose`
                                                                        });
                                                                        newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                                        return newInfo;
                                                                }else{
                                                                    return info;
                                                                }
                                                            })
                                                            let resetPlaying = newPlaying.filter((info)=> info.packed === false);

                                                            let winnerPlaying = resetPlaying[0];
                                                            newPlaying = newPlaying.map((info)=>{
                                                                if(info.userId === winnerPlaying.userId){
                                                                    let newInfo = {...info};
                                                                        newInfo.isTurn = false;
                                                                        newInfo.packed = true; 
                                                                        newInfo.packedReasonMess.push({
                                                                            bengali: `আপনি খেলার প্রধান বিজয়ী `,
                                                                            english: `You are the main winner of the game`
                                                                        });
                                                                        return newInfo;
                                                                }else{
                                                                    return info;
                                                                }
                                                            })
                                                            try {
                                                                let userBalanceUpdateResult = await User.increment({
                                                                    [`${myRoomResult.balanceType.toLowerCase()}Balance`]: Number(myRoomResult.currentBalance)+Number(currentBalance)
                                                                },{
                                                                    where:{userId: winnerPlaying.userId}
                                                                })
                                                                if(userBalanceUpdateResult && userBalanceUpdateResult[0] && userBalanceUpdateResult[0][1]){
                                                                        let recentTxrId = uid(8); 
                                                                        let boardTransaction = {
                                                                            typeName: 'GAME WIN BY CARD SHOW',
                                                                            isIn: 'IN',
                                                                            amount: Number(myRoomResult.currentBalance)+Number(currentBalance),
                                                                            txrId: recentTxrId,
                                                                            userId: winnerPlaying.userId,
                                                                            sourceId: winnerPlaying.referralCode,
                                                                            balanceType: myRoomResult.balanceType.toUpperCase()
                                                                        }
                                                                        try {
                                                                            let transactionCreateResult = await Transaction.create(boardTransaction)
                                                                            if(transactionCreateResult && transactionCreateResult?.id > 0){
                                                                                let myRoomUpdateResult = await Board.update({
                                                                                    playing: [],
                                                                                    totalBalance: 0,
                                                                                    currentBalance: 0,
                                                                                    currentCommission: 0,
                                                                                    round: 0,
                                                                                    currentId: 'false',
                                                                                    nextId: 'false',
                                                                                    previousId: 'false',
                                                                                    isStart: 'false',
                                                                                    blind: myRoomResult.rootBlind,
                                                                                    chaal: myRoomResult.rootChaal,
                                                                                    rootBlind: 0,
                                                                                    rootChaal: 0,
                                                                                    cardViewTill: new Date(new Date().setMilliseconds(40000)),
                                                                                },{
                                                                                    where:{roomId}
                                                                                });
                                                                                if(myRoomUpdateResult && myRoomUpdateResult[0]){
                                                                                    try {
                                                                                        let myRoomUpdateResult = await Board.findOne({where: {roomId}});
                                                                                            myRoomUpdateResult = jsonConverterUtils.singleBoard(myRoomUpdateResult);
                                                                                        if(myRoomUpdateResult && myRoomUpdateResult.id){
                                                                                            try {
                                                                                                let resultGetAllConnectedList = await  ConnectedList.findAll({attributes: ['socketId']});
                                                                                                if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                                                    let boardHistory = {
                                                                                                        winnerId: winnerPlaying.userId,
                                                                                                        members: [],
                                                                                                        playingInfo: newPlaying
                                                                                                    }
                                                                                                    newPlaying.forEach((info)=>{
                                                                                                        boardHistory.members.push(info.userId);
                                                                                                    })
                                                                                                    try {
                                                                                                        let playingHistoryResult = await PlayingHistory.create(boardHistory);
                                                                                                        if(playingHistoryResult && playingHistoryResult.id){
                                                                                                            let newRoomInfo = {...myRoomUpdateResult};
                                                                                                            newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                                                                delete playingInfo.card;
                                                                                                                return playingInfo;
                                                                                                            })
                
                                                                                                            resultGetAllConnectedList.forEach((info)=>{
                                                                                                                io.sockets.in(info.socketId).emit('boardFinish',{roomId, roomInfo: newRoomInfo, playingInfo: newPlaying, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance)+Number(currentBalance)})
                                                                                                            });
                                                                                                            res.json({roomId, roomInfo: newRoomInfo, playingInfo: newPlaying, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance)+Number(currentBalance)});
                                                                                                        }else{
                                                                                                            next(new Error('Playing history updated fail!'))
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
                                                                                        next(new error(error.message))
                                                                                    }
                                                                                }else{
                                                                                    next(new Error('Internal server error while updating my board'))
                                                                                }
                                                                            }else{
                                                                                next( new Error('Internal server error while create transaction'))
                                                                            }
                                                                        } catch (error) {
                                                                            next(new Error(error.message))
                                                                        }
                                                                }else{
                                                                    next(new Error('Internal server error while user balance update'))
                                                                }
                                                            } catch (error) {
                                                                next(new Error(error.message))
                                                            }
                                                        }
                                                    }else{
                                                        next(new Error('Internal server error while updating root asset commission'))
                                                    }
                                                } catch (error) {
                                                    next(new Error(error.message))
                                                }
                                            }else{
                                                next(new Error('Internal server error while creating multiple user transaction'))
                                            }
                                        } catch (error) {
                                            next(new Error(error.message))
                                        }
                                    }else{
                                        next(new Error('Internal server error while updating user balance'))
                                    }
                                } catch (error) {
                                    next(new Error(error.message))
                                }
    
                            }else{ 
                                let currentUser = myRoomResult.playing.filter((info)=> info.userId === userId)[0];
                                let winnerResult = cardUtils.cardCompareHandler(myRoomResult, currentUser);
                                if(myRoomResult.compare === 'true' && winnerResult){
                                    // checking passed
                                    let newPlaying = [...myRoomResult.playing];
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === myRoomResult.nextId){ 
                                            let newInfo = {...info};
                                                newInfo.isTurn = false;
                                                newInfo.packed = true;
                                                newInfo.packedReasonMess.push({
                                                    bengali: `যখন তুমি তোমার কার্ড শো করো তখন তোমার একাউন্ট এ পর্যাপ্ত পরিমান টাকা ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি বিজয়ী হন।`,
                                                    english: `When you show your card, you don't have enough money in your account. As the comparison is on in the game. Your card is compared to everyone else. And you win.`
                                                })
                                                return newInfo;
                                        }else{
                                            return info;
                                        }
                                    })
                                    let winnerPlaying = currentUser;
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === winnerPlaying.userId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = false;
                                                newInfo.packed = true; 
                                                newInfo.packedReasonMess.push({
                                                    bengali: `আপনি খেলার প্রধান বিজয়ী `,
                                                    english: `You are the main winner of the game`
                                                });
                                                return newInfo;
                                        }else{
                                            return info;
                                        }
                                    })
                                    try {
                                        let userBalanceUpdateResult = await User.increment({
                                            [`${myRoomResult.balanceType.toLowerCase()}Balance`]: myRoomResult.currentBalance
                                        },{
                                            where:{userId: winnerPlaying.userId}
                                        })
                                        if(userBalanceUpdateResult && userBalanceUpdateResult[0] && userBalanceUpdateResult[0][1]){
                                                let recentTxrId = uid(8); 
                                                let boardTransaction = {
                                                    typeName: 'GAME WIN BY CARD SHOW',
                                                    isIn: 'IN',
                                                    amount: myRoomResult.currentBalance,
                                                    txrId: recentTxrId,
                                                    userId: winnerPlaying.userId,
                                                    sourceId: winnerPlaying.referralCode,
                                                    balanceType: myRoomResult.balanceType.toUpperCase()
                                                }
                                                try {
                                                    let transactionCreateResult = await Transaction.create(boardTransaction)
                                                    if(transactionCreateResult && transactionCreateResult?.id > 0){
                                                        let myRoomUpdateResult = await Board.update({
                                                            playing: [],
                                                            totalBalance: 0,
                                                            currentBalance: 0,
                                                            currentCommission: 0,
                                                            round: 0,
                                                            currentId: 'false',
                                                            nextId: 'false',
                                                            previousId: 'false',
                                                            isStart: 'false',
                                                            blind: myRoomResult.rootBlind,
                                                            chaal: myRoomResult.rootChaal,
                                                            rootBlind: 0,
                                                            rootChaal: 0,
                                                            cardViewTill: new Date(new Date().setMilliseconds(40000)),
                                                        },{
                                                            where:{roomId, id}
                                                        });
                                                        if(myRoomUpdateResult && myRoomUpdateResult[0]){
                                                            try {
                                                                let myRoomUpdateResult = await Board.findOne({where: {roomId, id}});
                                                                    myRoomUpdateResult = jsonConverterUtils.singleBoard(myRoomUpdateResult);
                                                                if(myRoomUpdateResult && myRoomUpdateResult.id){
                                                                    try {
                                                                        let resultGetAllConnectedList = await ConnectedList.findAll({attributes: ['socketId']})
                                                                        if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                            let boardHistory = {
                                                                                winnerId: winnerPlaying.userId,
                                                                                members: [],
                                                                                playingInfo: newPlaying
                                                                            }
                                                                            newPlaying.forEach((info)=>{
                                                                                boardHistory.members.push(info.userId);
                                                                            })
                                                                            try {
                                                                                let playingHistoryResult = await PlayingHistory.create(boardHistory);
                                                                                if(playingHistoryResult && playingHistoryResult.id){
                                                                                    let newRoomInfo = {...myRoomUpdateResult};
                                                                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                                        delete playingInfo.card;
                                                                                        return playingInfo;
                                                                                    })
                
                                                                                    resultGetAllConnectedList.forEach((info)=>{
                                                                                        io.sockets.in(info.socketId).emit('boardFinish',{roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance), playingInfo: newPlaying})
                                                                                    });
                                                                                    res.json({roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance), playingInfo: newPlaying});
                                                                                }else{
                                                                                    next(new Error('Playing history updated fail!'))
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
                                                                    next(new Error('Internal server error !'))
                                                                }
                                                            } catch (error) {
                                                                next(new Error(error.message))
                                                            }
                                                        }else{
                                                            next(new Error('Internal server error while updating my board'))
                                                        }
                                                    }else{
                                                        next( new Error('Internal server error while create transaction'))
                                                    }
                                                } catch (error) {
                                                    next(new Error(error.message))
                                                }
                                        }else{
                                            next(new Error('Internal server error while user balance update'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    }
                                }else{
                                    // checking passed
                                    let newPlaying = [...myRoomResult.playing];
                                        newPlaying = newPlaying.map((info)=>{
                                            if(info.userId === userId){
                                                let newInfo = {...info};
                                                    newInfo.isTurn = false;
                                                    newInfo.packed = true;
                                                    newInfo.packedReasonMess.push({
                                                        bengali: `যখন তুমি তোমার কার্ড শো করো তখন তোমার একাউন্ট এ পর্যাপ্ত পরিমান টাকা ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি পরাজিত হন।`,
                                                        english: `When you show your card, you don't have enough money in your account. As the comparison is on in the game. Your card is compared to everyone else. And you lose.`
                                                    });
                                                    return newInfo;
                                            }else{
                                                return info;
                                            }
                                        })
                                    let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                    let winnerPlaying = resetPlaying[0];
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === winnerPlaying.userId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = false;
                                                newInfo.packed = true; 
                                                newInfo.packedReasonMess.push({
                                                    bengali: `আপনি খেলার প্রধান বিজয়ী `,
                                                    english: `You are the main winner of the game`
                                                });
                                                return newInfo;
                                        }else{
                                            return info;
                                        }
                                    })
                                    try {
                                        let userBalanceUpdateResult = await User.increment({
                                            [`${myRoomResult.balanceType.toLowerCase()}Balance`]:  myRoomResult.currentBalance
                                        },{
                                            where:{userId: winnerPlaying.userId}
                                        })
                                        if(userBalanceUpdateResult && userBalanceUpdateResult[0] && userBalanceUpdateResult[0][1]){
                                                let recentTxrId = uid(8); 
                                                let boardTransaction = {
                                                    typeName: 'GAME WIN BY CARD SHOW',
                                                    isIn: 'IN',
                                                    amount: myRoomResult.currentBalance,
                                                    txrId: recentTxrId,
                                                    userId: winnerPlaying.userId,
                                                    sourceId: winnerPlaying.referralCode,
                                                    balanceType: myRoomResult.balanceType.toUpperCase()
                                                }
                                                try {
                                                    let transactionCreateResult = await Transaction.create(boardTransaction)
                                                    if(transactionCreateResult && transactionCreateResult?.id > 0){

                                                        let myRoomUpdateResult = await Board.update({
                                                            playing: [],
                                                            totalBalance: 0,
                                                            currentBalance: 0,
                                                            currentCommission: 0,
                                                            round: 0,
                                                            currentId: 'false',
                                                            nextId: 'false',
                                                            previousId: 'false',
                                                            isStart: 'false',
                                                            blind: myRoomResult.rootBlind,
                                                            chaal: myRoomResult.rootChaal,
                                                            rootBlind: 0,
                                                            rootChaal: 0,
                                                            cardViewTill: new Date(new Date().setMilliseconds(40000)),
                                                        },{
                                                            where:{roomId, id}
                                                        });
                                                        if(myRoomUpdateResult && myRoomUpdateResult[0]){
                                                            try {
                                                                let myRoomUpdateResult = await Board.findOne({where: {roomId, id}});
                                                                    myRoomUpdateResult = jsonConverterUtils.singleBoard(myRoomUpdateResult);
                                                                if(myRoomUpdateResult && myRoomUpdateResult.id){
                                                                    try {
                                                                        let resultGetAllConnectedList = await ConnectedList.findAll({attributes:['socketId']})
                                                                        if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                            
                                                                            let boardHistory = {
                                                                                winnerId: winnerPlaying.userId,
                                                                                members: [],
                                                                                playingInfo: newPlaying
                                                                            }
                                                                            newPlaying.forEach((info)=>{
                                                                                boardHistory.members.push(info.userId);
                                                                            })
                                                                            try {
                                                                                let playingHistoryResult = await PlayingHistory.create(boardHistory);
                                                                                if(playingHistoryResult && playingHistoryResult.id){
                                                                                    let newRoomInfo = {...myRoomUpdateResult};
                                                                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                                        delete playingInfo.card;
                                                                                        return playingInfo;
                                                                                    })
                
                                                                                    resultGetAllConnectedList.forEach((info)=>{
                                                                                        io.sockets.in(info.socketId).emit('boardFinish',{roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance), playingInfo: newPlaying})
                                                                                    });
                                                                                    res.json({roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance), playingInfo: newPlaying});
                                                                                }else{
                                                                                    next(new Error('Playing history updated fail!'))
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
                                                            next(new Error('Internal server error while updating my board'))
                                                        }
                                                    }else{
                                                        next( new Error('Internal server error while create transaction'))
                                                    }
                                                } catch (error) {
                                                    next(new Error(error.message))
                                                }
                                        }else{
                                            next(new Error('Internal server error while user balance update'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    }
                                }
                            }
                        }else{
                            next(new Error('Internal server error while finding my user data'))
                        }
                    } catch (error) {
                        next(new Error(error.message))
                    }
                }else{
                    next(new Error('Tow user need for show you card'))
                }
            }else{
                next(new Error('Internal server error while find my room'))
            }
        } catch (error) {
            next(new Error(error.message))
        }
    }else{
        next(new Error('Internal server error!'))
    }
});


module.exports = handleShowMyCard;