const asyncHandler = require('express-async-handler'); 
const { cardUtils} = require('../../utils/cardUtils');
const { uid } = require('uid'); 
const Board = require('../../models/Board');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const RootAsset = require('../../models/RootAsset');
const ConnectedList = require('../../models/ConnectedList');
const jsonConverterUtils = require('../../utils/JsonConverter');
const PlayingHistory = require('../../models/PlayingHistory');

const handleChaalTwoExe = asyncHandler(async(req, res, next)=>{
    let {roomId, userId, id} = req.body;
    if(roomId && userId && id){
        try {
            let myRoomResult = await Board.findOne({
                where: {roomId}
            })
            myRoomResult = jsonConverterUtils.singleBoard(myRoomResult);
            if(myRoomResult && myRoomResult?.id > 0 && myRoomResult.isStart === 'true' && myRoomResult.currentId === userId){
                try {
                    let myUserInfo = await User.findOne({
                        where: {userId}
                    })
                    if(myUserInfo && myUserInfo?.id > 0){
                        if(Number(myRoomResult.chaal) <= Number(myUserInfo[`${myRoomResult.balanceType.toLowerCase()}Balance`])){
                            let myUserUpdateResult = await User.increment({
                                [`${myRoomResult.balanceType.toLowerCase()}Balance`]: -Number(myRoomResult.chaal)*2
                            },{
                                where: {userId} 
                            })
                            if(myUserUpdateResult && myUserUpdateResult[0] && myUserUpdateResult[0][1]){
                                let newPlaying = [...myRoomResult.playing];
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === userId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = false;
                                                newInfo.seenRound = Number(newInfo.seenRound) + 1;
                                                newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                if(myRoomResult.maxChaalHit === newInfo.seenRound){
                                                    newInfo.side = true;
                                                }
                                                return newInfo
                                        }else{
                                            return info
                                        }
                                    });
                                let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                let myRoomNewRound = myRoomResult.round;
                                let currentPlayingIndex = resetPlaying.findIndex((info)=> info.userId === myRoomResult.nextId);
                                if(currentPlayingIndex === 0){
                                    myRoomNewRound = myRoomNewRound + 1
                                }
                                let currentPlaying = resetPlaying[currentPlayingIndex];
                                let nextPlaying = resetPlaying[currentPlayingIndex+1] ? resetPlaying[currentPlayingIndex+1] : resetPlaying[0];
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === currentPlaying.userId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = true;
                                                newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                return newInfo;
                                        }else{
                                            return info;
                                        }
                                    })
                                try {
                                    let NBT = myRoomResult.balanceType.toLowerCase();

                                    // commission calculating start
                                    let totalBalance = Number(myRoomResult.chaal)*2
                                    let currentCommission = (totalBalance / 100) * Number(process.env[`${NBT}BoardFee`]);
                                    let currentBalance = (totalBalance / 100) * (100 - Number(process.env[`${NBT}BoardFee`]));
                                    let totalAppCommission = currentCommission / 2;
                                    let totalPartnerCommission = currentCommission / 2;
                                    // commission calculating end

                                    let allUserTransaction = [];
                                    let recentTxrId = uid(8); 
                                    let boardTransaction = {
                                        typeName: 'CHAAL 2X',
                                        isIn: 'OUT',
                                        amount: (Number(myRoomResult.chaal) / 100) * (100 - Number(process.env[`${NBT}BoardFee`])),
                                        txrId: recentTxrId,
                                        userId: myUserInfo.userId,
                                        sourceId: myUserInfo.referralCode,
                                        balanceType:  NBT.toUpperCase()
                                    }
                                    let boardFeeCommission = {
                                        typeName: 'CHAAL 2X COMMISSION',
                                        isIn: 'OUT',
                                        amount: (Number(totalBalance) / 100) * Number(process.env[`${NBT}BoardFee`]),
                                        txrId: recentTxrId,
                                        userId: myUserInfo.userId,
                                        sourceId: myUserInfo.referralCode,
                                        balanceType:  NBT.toUpperCase()
                                    }
                                    let boardFeeAppCommission = {
                                        typeName: 'CHAAL 2X COMMISSION',
                                        isIn: 'IN',
                                        amount: (Number(totalBalance) / 100) * (Number(process.env[`${NBT}BoardFee`]) / 2),
                                        txrId: recentTxrId,
                                        userId: '999999999999',
                                        sourceId: myUserInfo.userId,
                                        balanceType:  NBT.toUpperCase()
                                    }
                                    let boardFeePartnerCommission = {
                                        typeName: 'CHAAL 2X COMMISSION',
                                        isIn: 'IN',
                                        amount: (Number(totalBalance) / 100) * (Number(process.env[`${NBT}BoardFee`]) / 2),
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
                                    let myTransactionCreateResult = await Transaction.bulkCreate(allUserTransaction);
                                    if(myTransactionCreateResult && myTransactionCreateResult.length){
                                        let rootAssetUpdateResult = await RootAsset.increment({   
                                            [`${NBT}TotalCommission`]:  currentCommission,
                                            [`${NBT}TotalAppCommission`]:  totalAppCommission,
                                            [`${NBT}TotalPartnerCommission`]:  totalPartnerCommission
                                        },{
                                            where:{id: 1}
                                        }) 
                                        if(rootAssetUpdateResult && rootAssetUpdateResult[0] && rootAssetUpdateResult[0][1]){
                                            try {
                                                let myRoomUpdateResult = await Board.update({
                                                    playing: newPlaying,
                                                    currentId: currentPlaying.userId,
                                                    nextId: nextPlaying.userId,
                                                    round: myRoomNewRound, 
                                                    blind: Number(myRoomResult.blind) * 2,
                                                    chaal: Number(myRoomResult.chaal) * 2
                                                },{
                                                    where: {roomId, id} 
                                                })
                                                if(myRoomUpdateResult && myRoomUpdateResult[0]){
                                                    try {
                                                        let myRoomUpdateResult = await Board.increment({
                                                            totalBalance: totalBalance,
                                                            currentBalance: currentBalance,
                                                            currentCommission: currentCommission,
                                                        },{
                                                            where: {roomId, id}
                                                        })
                                                        if(myRoomUpdateResult && myRoomUpdateResult[0] && myRoomUpdateResult[0][1]){
                                                            try {
                                                                let myRoomUpdateResult = await Board.findOne({where: {roomId, id}});
                                                                    myRoomUpdateResult = jsonConverterUtils.singleBoard(myRoomUpdateResult)
                                                                if(myRoomUpdateResult && myRoomUpdateResult.id){
                                                                    try {
                                                                        let resultGetAllConnectedList = await ConnectedList.findAll({attributes: ['socketId']})
                                                                        if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                            let newRoomInfo = {...myRoomUpdateResult};
                                                                            newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                                delete playingInfo.card;
                                                                                return playingInfo;
                                                                            });
                                                                            resultGetAllConnectedList.forEach((info)=>{
                                                                                io.sockets.in(info.socketId).emit('anyoneHitSuccess',{roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.chaal)*2})
                                                                            });
                                                                            res.json({roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.chaal)*2});
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
                                                    next(new Error('Internal server error while updating board info'))
                                                }
                                            } catch (error) {
                                                next(new Error(error.message))
                                            }
                                        }else{
                                            next(new Error('Internal server error while updating root asset'))
                                        }
                                    }else{
                                        next(new Error('Internal server error while creating my transaction'))
                                    }
                                } catch (error) {
                                    next(new Error(error.message))
                                }
                            }else{
                                next(new Error('Internal server error while decrementing user balance'))
                            }
                        }else{ 
                            let currentUser = myRoomResult.playing.filter((info)=> info.userId === userId)[0];
                            let winnerResult = cardUtils.cardCompareHandler(myRoomResult, currentUser);
                            if(myRoomResult.compare === 'true' && winnerResult){
                                let newPlaying = [...myRoomResult.playing];
                                newPlaying = newPlaying.map((info)=>{
                                    if(info.userId === userId){
                                        let newInfo = {...info};
                                            newInfo.isTurn = false;
                                            newInfo.packed = true;
                                            newInfo.packedReasonMess.push({
                                                bengali: `আপনি যখন দেখে হিট দেন (2x chaal ) । তখন আপনার একাউন্ট এ পর্যাপ্ত ব্যালান্স ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি বিজয়ী হন। `,
                                                english: `Hit when you see (2x chaal). Then your account did not have sufficient balance. As the comparison is on in the game. Your card is compared to everyone else. And you win.`
                                            });
                                            return newInfo;
                                    }else{
                                        return info;
                                    }
                                })
                                let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                if(resetPlaying.length > 1){
                                    // checking passed
                                    let myRoomNewRound = myRoomResult.round;
                                    let currentPlayingIndex = resetPlaying.findIndex((info)=> info.userId === myRoomResult.nextId);
                                    if(currentPlayingIndex === 0){
                                        myRoomNewRound = myRoomNewRound + 1
                                    }
                                    let currentPlaying = resetPlaying[currentPlayingIndex];
                                    let nextPlaying = resetPlaying[currentPlayingIndex+1] ? resetPlaying[currentPlayingIndex+1] : resetPlaying[0];
                                        newPlaying = newPlaying.map((info)=>{
                                            if(info.userId === currentPlaying.userId){
                                                let newInfo = {...info};
                                                    newInfo.isTurn = true;
                                                    newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                    if(myRoomResult.maxChaalHit === newInfo.seenRound){
                                                        newInfo.side = true
                                                    }
                                                    return newInfo;
                                            }else{
                                                return info;
                                            }
                                        })
                                        try {
                                            let boardUpdateResult = await Board.update({
                                                playing: newPlaying,
                                                round: myRoomNewRound,
                                                currentId: currentPlaying.userId,
                                                nextId: nextPlaying.userId,
                                                currentBalance: 0,
                                                currentCommission: 0,
                                                totalBalance: 0
                                            },{
                                                where: {roomId, id} 
                                            })
                                            if(boardUpdateResult && boardUpdateResult[0]){
                                                try {
                                                    let boardUpdateResult = await Board.findOne({where: {roomId, id}});
                                                        boardUpdateResult = jsonConverterUtils.singleBoard(boardUpdateResult);
                                                    if(boardUpdateResult && boardUpdateResult.id){
                                                        try {
                                                            let myUserUpdateResult = await User.increment({
                                                                [`${myRoomResult.balanceType.toLowerCase()}Balance`]: Number(myRoomResult.currentBalance)
                                                            },{
                                                                where: {userId} 
                                                            })
                                                            if(myUserUpdateResult && myUserUpdateResult[0] && myUserUpdateResult[0][1]){
                                                                let recentTxrId = uid(8); 
                                                                let userWinTransaction = {
                                                                    typeName: 'GAME WIN BY CHAAL 2X COMPARE WIN',
                                                                    isIn: 'IN',
                                                                    amount: myRoomResult.currentBalance,
                                                                    txrId: recentTxrId,
                                                                    userId: currentUser.userId,
                                                                    sourceId: currentUser.referralCode,
                                                                    balanceType: myRoomResult.balanceType.toUpperCase()
                                                                }
                                                                try {
                                                                    let userTransactionUpdate = await Transaction.create(userWinTransaction);
    
                                                                    if(userTransactionUpdate && userTransactionUpdate.id > 0){
                                                                        try {
                                                                            let resultGetAllConnectedList = await ConnectedList.findAll({attributes: ['socketId']})
                                                                            if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                                let newRoomInfo = {...boardUpdateResult};
                                                                                newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                                    delete playingInfo.card;
                                                                                    return playingInfo;
                                                                                });
                                                                                resultGetAllConnectedList.forEach((info)=>{
                                                                                    io.sockets.in(info.socketId).emit('anyoneHitFailButCompareWin',{roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.currentBalance)})
                                                                                });
                                                                                res.json({roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.currentBalance)});
                                                                            }else{
                                                                                next(new Error('Internal server error!'))
                                                                            }
                                                                        } catch (error) { 
                                                                            next(new Error(error.message))
                                                                        }
                                                                    }else{
                                                                        next(new Error('Internal server error while creating user win transaction!'))
                                                                    }
                                                                } catch (error) {
                                                                    next(new Error(error.message))
                                                                }
                                                            }else{
                                                                next(new Error('Internal server error while updating my winning account balance!'))
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
                                                next(new Error('Internal server error while updating board'))
                                            }
                                        } catch (error) {
                                            next(new Error(error.message))
                                        }
                                }else{
                                    // checking passed
                                    let winnerPlaying = newPlaying.filter((info)=> info.userId === userId)[0];
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
                                                    typeName: 'GAME WIN BY CHAAL 2X COMPARE WIN',
                                                    isIn: 'IN',
                                                    amount: myRoomResult.currentBalance,
                                                    txrId: recentTxrId,
                                                    userId: winnerPlaying.userId,
                                                    sourceId: winnerPlaying.referralCode,
                                                    balanceType: myRoomResult.balanceType.toUpperCase()
                                                }
                                                try {

                                                    let transactionCreateResult = await Transaction.create(boardTransaction);

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
                                                                                winnerId: userId,
                                                                                members: '',
                                                                                name: myRoomUpdateResult.name,
                                                                                balanceType: myRoomUpdateResult.balanceType,
                                                                                playingInfo: newPlaying
                                                                            }
                                                                            newPlaying.forEach((info)=>{
                                                                                boardHistory.members += `___${info.userId}___`;
                                                                            })
                                                                            try {
                                                                                let playingHistoryResult = await PlayingHistory.create(boardHistory);
                                                                                if(playingHistoryResult && playingHistoryResult.id){
                                                                                    let newRoomInfo = {...myRoomUpdateResult};
                                                                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                                        delete playingInfo.card;
                                                                                        return playingInfo;
                                                                                    });
                                                                                    resultGetAllConnectedList.forEach((info)=>{
                                                                                        io.sockets.in(info.socketId).emit('boardFinish',{roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.currentBalance), playingInfo: newPlaying})
                                                                                    });
                                                                                    res.json({roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.currentBalance), playingInfo: newPlaying});
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
                            }else{
                                let newPlaying = [...myRoomResult.playing];
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === userId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = false;
                                                newInfo.packed = true;
                                                newInfo.packedReasonMess.push({
                                                    bengali: `আপনি যখন দেখে হিট দেন (2x chaal ) । তখন আপনার একাউন্ট এ পর্যাপ্ত ব্যালান্স ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি পরাজিত হন। `,
                                                    english: `Hit when you see (2x chaal). Then your account did not have sufficient balance. As the comparison is on in the game. Your card is compared to everyone else. And you lose.`
                                                });
                                                return newInfo;
                                        }else{
                                            return info;
                                        }
                                    })
                                let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                if(resetPlaying.length > 1){
                                    // checking passed
                                    let myRoomNewRound = myRoomResult.round;
                                    let currentPlayingIndex = resetPlaying.findIndex((info)=> info.userId === myRoomResult.nextId);
                                    if(currentPlayingIndex === 0){
                                        myRoomNewRound = myRoomNewRound + 1
                                    }
                                    let currentPlaying = resetPlaying[currentPlayingIndex];
                                    let nextPlaying = resetPlaying[currentPlayingIndex+1] ? resetPlaying[currentPlayingIndex+1] : resetPlaying[0];
                                        newPlaying = newPlaying.map((info)=>{
                                            if(info.userId === currentPlaying.userId){
                                                let newInfo = {...info};
                                                    newInfo.isTurn = true;
                                                    newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                    if(myRoomResult.maxChaalHit === newInfo.seenRound){
                                                        newInfo.side = true
                                                    }
                                                    return newInfo;
                                            }else{
                                                return info;
                                            }
                                        })
                                        try {
                                            let boardUpdateResult = await Board.update({
                                                playing: newPlaying,
                                                round: myRoomNewRound,
                                                currentId: currentPlaying.userId,
                                                nextId: nextPlaying.userId
                                            },{
                                                where: {roomId, id}
                                            })
                                            if(boardUpdateResult && boardUpdateResult[0]){
                                                try {
                                                    let boardUpdateResult = await Board.findOne({where: {roomId, id}});
                                                        boardUpdateResult = jsonConverterUtils.singleBoard(boardUpdateResult);
                                                    if(boardUpdateResult && boardUpdateResult.id){
                                                        try {
                                                            let resultGetAllConnectedList = await ConnectedList.findAll({attributes: ['socketId']})
                                                            if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                let newRoomInfo = {...boardUpdateResult};
                                                                newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                    delete playingInfo.card;
                                                                    return playingInfo;
                                                                });
            
                                                                resultGetAllConnectedList.forEach((info)=>{
                                                                    io.sockets.in(info.socketId).emit('anyoneHitFailButCompareFail',{roomId: myRoomResult.roomId, roomInfo: newRoomInfo })
                                                                });
                                                                res.json({roomId: myRoomResult.roomId, roomInfo: newRoomInfo });
                                                            }else{
                                                                next(new Error('Internal server error!'))
                                                            }
                                                        } catch (error) { 
                                                            next(new Error(error.message))
                                                        }
                                                    }
                                                } catch (error) {
                                                    next(new Error(error.message))
                                                }
                                            }else{
                                                next(new Error('Internal server error while updating board'))
                                            }
                                        } catch (error) {
                                            next(new Error(error.message))
                                        }
                                }else{
                                    // checking passed
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
                                            [`${myRoomResult.balanceType.toLowerCase()}Balance`]: myRoomResult.currentBalance
                                        },{
                                            where:{userId: winnerPlaying.userId}
                                        })
                                        if(userBalanceUpdateResult && userBalanceUpdateResult[0] && userBalanceUpdateResult[0][1]){
                                                let recentTxrId = uid(8); 
                                                let boardTransaction = {
                                                    typeName: 'GAME WIN BY CHAAL 2X COMPARE WIN',
                                                    isIn: 'IN',
                                                    amount: myRoomResult.currentBalance,
                                                    txrId: recentTxrId,
                                                    userId: winnerPlaying.userId,
                                                    sourceId: winnerPlaying.referralCode,
                                                    balanceType: myRoomResult.balanceType.toUpperCase()
                                                }
                                                try {
                                                    let transactionCreateResult = await Transaction.create(boardTransaction);
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
                                                                    myRoomUpdateResult = jsonConverterUtils.singleBoard(myRoomUpdateResult)
                                                                if(myRoomUpdateResult && myRoomUpdateResult.id){
                                                                    try {
                                                                        let resultGetAllConnectedList = await ConnectedList.findAll({attributes: ['socketId']});
                                                                        if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                            let boardHistory = {
                                                                                winnerId: winnerPlaying.userId,
                                                                                members: '',
                                                                                name: myRoomUpdateResult.name,
                                                                                balanceType: myRoomUpdateResult.balanceType,
                                                                                playingInfo: newPlaying
                                                                            }
                                                                            newPlaying.forEach((info)=>{
                                                                                boardHistory.members += `___${info.userId}___`;
                                                                            })
                                                                            try {
                                                                                let playingHistoryResult = await PlayingHistory.create(boardHistory);
                                                                                if(playingHistoryResult && playingHistoryResult.id){
                                                                                    let newRoomInfo = {...myRoomUpdateResult};
                                                                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                                        delete playingInfo.card;
                                                                                        return playingInfo;
                                                                                    });
                
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
                        }
                    }else{
                        next(new Error('Internal server error while finding my user data'))
                    }
                } catch (error) {
                    next(new Error(error.message))
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

module.exports = handleChaalTwoExe;