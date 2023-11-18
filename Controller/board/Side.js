const asyncHandler = require('express-async-handler'); 
const { cardUtils } = require('../../utils/cardUtils');
const { uid } = require('uid'); 
const Board = require('../../models/Board');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const RootAsset = require('../../models/RootAsset');
const ConnectedList = require('../../models/ConnectedList');
const jsonConverterUtils = require('../../utils/JsonConverter');

const handleSideMyCard = asyncHandler(async(req, res, next)=>{
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
                        if(Number(myRoomResult.blind) <= Number(myUserInfo[`${myRoomResult.balanceType.toLowerCase()}Balance`])){
                            try {
                                let myUserUpdateResult = await User.increment({
                                    [`${myRoomResult.balanceType.toLowerCase()}Balance`]: -Number(myRoomResult.blind)
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
                                        typeName: 'SIDE CARD',
                                        isIn: 'OUT',
                                        amount:  currentBalance,
                                        txrId: recentTxrId,
                                        userId: myUserInfo.userId,
                                        sourceId: myUserInfo.referralCode,
                                        balanceType:  NBT.toUpperCase()
                                    }
                                    let boardFeeCommission = {
                                        typeName: 'SIDE CARD COMMISSION',
                                        isIn: 'OUT',
                                        amount: currentCommission,
                                        txrId: recentTxrId,
                                        userId: myUserInfo.userId,
                                        sourceId: myUserInfo.referralCode,
                                        balanceType:  NBT.toUpperCase()
                                    }
                                    let boardFeeAppCommission = {
                                        typeName: 'SIDE CARD COMMISSION',
                                        isIn: 'IN',
                                        amount: totalAppCommission,
                                        txrId: recentTxrId,
                                        userId: '999999999999',
                                        sourceId: myUserInfo.userId,
                                        balanceType:  NBT.toUpperCase()
                                    }
                                    let boardFeePartnerCommission = {
                                        typeName: 'SIDE CARD COMMISSION',
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
                                        if(myTransactionCreateResult && myTransactionCreateResult?.length > 0){
                                            try {
                                                let rootAssetUpdateResult = await RootAsset.increment({
                                                    [`${NBT}TotalCommission`]:  currentCommission,
                                                    [`${NBT}TotalAppCommission`]:  totalAppCommission,
                                                    [`${NBT}TotalPartnerCommission`]:  totalPartnerCommission
                                                },{
                                                    where: {id: 1} 
                                                })
                                                if(rootAssetUpdateResult && rootAssetUpdateResult[0] && rootAssetUpdateResult[0][1]){
                                                    let newPlaying = [...myRoomResult.playing];
                                                    let myRoomNewRound = myRoomResult.round;
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
                                                                        bengali: `${myPlayingInfo.name} বিজয়ী হয় যখন সে তার কার্ড তোমার সাথে সাইড করে `,
                                                                        english: `${myPlayingInfo.name} wins when he sides his cards with you`
                                                                    })
                                                                    newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                                    return newInfo;
                                                            }else{
                                                                return info;
                                                            }
                                                        })
                                                        let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                                        let presetPlayerIndex = resetPlaying.findIndex((info)=> info.userId === userId);
                                                        let currentPlaying = resetPlaying[presetPlayerIndex+1] ? resetPlaying[presetPlayerIndex+1] : resetPlaying[0];
                                                        let currentPlayingIndex = resetPlaying.findIndex((info)=> info.userId === currentPlaying.userId);
                                                        let nextPlaying = resetPlaying[currentPlayingIndex+1] ? resetPlaying[currentPlayingIndex+1] : resetPlaying[0];
                                                        if(currentPlayingIndex === 0){
                                                            myRoomNewRound = myRoomNewRound + 1;
                                                        }
                                                        newPlaying = newPlaying.map((info)=>{
                                                            if(info.userId === currentPlaying.userId){
                                                                let newInfo = {...info};
                                                                    newInfo.isTurn = true;
                                                                    newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                                    if(myRoomResult.maxChaalHit === newInfo.seenRound){
                                                                        newInfo.side = true;
                                                                    }
                                                                    return newInfo;
                                                            }else{
                                                                return info;
                                                            }
                                                        })
                                                        try {
                                                            let myRoomUpdateResult = await Board.update({
                                                                playing: newPlaying,
                                                                currentId: currentPlaying.userId,
                                                                nextId: nextPlaying.userId,
                                                                round: myRoomNewRound
                                                            },{
                                                                where: {roomId, id}
                                                            })
                                                            if(myRoomUpdateResult && myRoomUpdateResult[0]){
                                                                try {
                                                                    let myRoomUpdateResult = await Board.increment({
                                                                        totalBalance: totalBalance,
                                                                        currentBalance: currentBalance,
                                                                        currentCommission: currentCommission,
                                                                    },{where: {roomId, id}});

                                                                    if(myRoomUpdateResult && myRoomUpdateResult[0] && myRoomUpdateResult[0][1]){
                                                                        try {
                                                                            let myRoomUpdateResult = await Board.findOne({where: {roomId, id}});
                                                                                myRoomUpdateResult = jsonConverterUtils.singleBoard(myRoomUpdateResult);
                                                                            if(myRoomUpdateResult && myRoomUpdateResult.id){
                                                                                try {
                                                                                    let resultGetAllConnectedList = await ConnectedList.findAll({attributes: ['socketId']})
                                                                                    if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                
                                                                                        let newRoomInfo = {...myRoomUpdateResult};
                                                                                        newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                                            delete playingInfo.card;
                                                                                            return playingInfo;
                                                                                        })
                
                                                                                        resultGetAllConnectedList.forEach((info)=>{
                                                                                            io.sockets.in(info.socketId).emit('anyoneHitSuccess',{roomId: myRoomUpdateResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomUpdateResult.blind)})
                                                                                        });
                                                                                        res.json({roomId: myRoomUpdateResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomUpdateResult.blind)});
                                                                                    }else{
                                                                                        next(new Error('Internal server error!'))
                                                                                    }
                                                                                } catch (error) { 
                                                                                    console.log('enter 1');
                                                                                    next(new Error(error.message))
                                                                                }
                                                                            }else{
                                                                                next(new Error('Internal server error!'))
                                                                            }
                                                                        } catch (error) {
                                                                            console.log('enter 2');
                                                                            next(new Error(error.message))
                                                                        }
                                                                    }else{
                                                                        next(new Error('Internal server error!'))
                                                                    }
                                                                } catch (error) {
                                                                    console.log('enter 3');
                                                                    next(new Error(error.message))
                                                                } 
                                                            }else{
                                                                next(new Error('Internal server error while updating board info'))
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
                                                                        bengali: `তুমি যখন তোমার কার্ড ${nextPlayingInfo.name} এর সাথে সাইড করে তখন ${nextPlayingInfo.name} বিজয়ী হয় এবং তুমি পরাজিত হও `,
                                                                        english: `When you side your cards with ${nextPlayingInfo.name}, ${nextPlayingInfo.name} wins and you lose`
                                                                    })
                                                                    newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                                    return newInfo;
                                                            }else{
                                                                return info;
                                                            }
                                                        })
                                                        let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                                        let currentPlayingIndex = resetPlaying.findIndex((info)=> info.userId === myRoomResult.nextId);
                                                        let currentPlaying = resetPlaying[currentPlayingIndex];
                                                        let nextPlaying = resetPlaying[currentPlayingIndex+1] ?  resetPlaying[currentPlayingIndex+1] : resetPlaying[0] 
                                                        if(currentPlayingIndex === 0){
                                                            myRoomNewRound = myRoomNewRound + 1;
                                                        }
                                                        newPlaying = newPlaying.map((info)=>{
                                                            if(info.userId === currentPlaying.userId){
                                                                let newInfo = {...info};
                                                                    newInfo.isTurn = true;
                                                                    newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                                    if(myRoomResult.maxChaalHit === newInfo.seenRound){
                                                                        newInfo.side = true;
                                                                    }
                                                                    return newInfo;
                                                            }else{
                                                                return info;
                                                            }
                                                        })
                
                                                        try {
                                                            let myRoomUpdateResult = await Board.update(
                                                                {
                                                                    playing: newPlaying,
                                                                    currentId: currentPlaying.userId,
                                                                    nextId: nextPlaying.userId,
                                                                    round: myRoomNewRound
                                                                }
                                                            ,{
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
                                                                    });

                                                                    if(myRoomUpdateResult && myRoomUpdateResult[0] && myRoomUpdateResult[0][1]){
                                                                        try {
                                                                            let myRoomUpdateResult = await Board.findOne({where: {roomId, id}});
                                                                                myRoomUpdateResult = jsonConverterUtils.singleBoard(myRoomUpdateResult);
                                                                            if(myRoomUpdateResult && myRoomUpdateResult.id){
                                                                                try {
                                                                                    let resultGetAllConnectedList = await ConnectedList.findAll({attributes: ['socketId']})
                                                                                    if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                
                                                                                        let newRoomInfo = {...myRoomUpdateResult};
                                                                                        newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                                            delete playingInfo.card;
                                                                                            return playingInfo;
                                                                                        })
                
                                                                                        resultGetAllConnectedList.forEach((info)=>{
                                                                                            io.sockets.in(info.socketId).emit('anyoneHitSuccess',{roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.blind)})
                                                                                        });
                                                                                        res.json({roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.blind)});
                                                                                    }else{
                                                                                        next(new Error('Internal server error!'))
                                                                                    }
                                                                                } catch (error) { 
                                                                                    next(new Error(error.message))
                                                                                }
                                                                            }else{
                                                                                next(new Error('Internal server error'))
                                                                            }
                                                                        } catch (error) {
                                                                            next(new Error(error.message))
                                                                        }
                                                                    }else{
                                                                        next(new Error('Internal server error'))
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
                                let newPlaying = [...myRoomResult.playing];
                                newPlaying = newPlaying.map((info)=>{
                                    if(info.userId === userId){
                                        let newInfo = {...info};
                                            newInfo.isTurn = false;
                                            newInfo.packed = true;
                                            newInfo.packedReasonMess.push({
                                                bengali: `যখন তুমি তোমার কার্ড সাইড করো তখন তোমার একাউন্ট এ পর্যাপ্ত পরিমান টাকা ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি বিজয়ী হন।`,
                                                english: `Your account did not have enough funds when you side your card. As the comparison is on in the game. Your card is compared to everyone else. And you win.`
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
                                                                typeName: 'GAME WIN BY SIDE CARD',
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
                                                                            })
        
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
                                    next(new Error('Invalid server request'))
                                }
                            }else{
                                let newPlaying = [...myRoomResult.playing];
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === userId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = false;
                                                newInfo.packed = true;
                                                newInfo.packedReasonMess.push({
                                                    bengali: `যখন তুমি তোমার কার্ড সাইড করো তখন তোমার একাউন্ট এ পর্যাপ্ত পরিমান টাকা ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি পরাজিত হন।`,
                                                    english: `Your account did not have enough funds when you side your card. As the comparison is on in the game. Your card is compared to everyone else. And you lose.`
                                                })
                                                return newInfo;
                                        }else{
                                            return info;
                                        }
                                    })
                                let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                if(resetPlaying.length > 1){
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
                                                            })
        
                                                            resultGetAllConnectedList.forEach((info)=>{
                                                                io.sockets.in(info.socketId).emit('anyoneHitFailButCompareFail',{roomId, roomInfo: newRoomInfo})
                                                            });
                                                            res.json({roomId, roomInfo: newRoomInfo});
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
                                            next(new Error('Internal server error while updating board'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    }
                                }else{
                                    next(new Error('Invalid server request'))
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


module.exports = handleSideMyCard;