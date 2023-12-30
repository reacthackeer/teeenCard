 
const asyncHandler = require('express-async-handler');  
const { uid } = require('uid'); 
const Board = require('../../models/Board');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const ConnectedList = require('../../models/ConnectedList');
const jsonConverterUtils = require('../../utils/JsonConverter');
const PlayingHistory = require('../../models/PlayingHistory');


const handleRefreshMyCard = asyncHandler(async(req, res, next)=>{
    let {roomId, userId, id} = req.body;
    if(roomId && userId && id){ 
        try {
            let myRoomResult = await Board.findOne({where: {id, roomId}});
                myRoomResult = jsonConverterUtils.singleBoard(myRoomResult);
            if(myRoomResult && myRoomResult.id > 0 && myRoomResult.accessIdes.indexOf(userId) !== -1 && myRoomResult.isStart === 'true' && myRoomResult.currentId === userId){

                let currentUserInfo = myRoomResult.playing.filter((info)=> info.userId === userId)[0];
                let currentNowTime = new Date().getTime();
                let prevDate = new Date(currentUserInfo.timeUp).getTime();
                if(currentNowTime >= prevDate){
                    let newPlaying = [...myRoomResult.playing];
                    let newPlayer = [...myRoomResult.player];
                        newPlayer = newPlayer.filter((info)=> info.userId !== userId);
                        newPlaying = newPlaying.map((info)=>{
                            if(info.userId === userId){
                                let newInfo = {...info};
                                    newInfo.packed = true;
                                    newInfo.packedReasonMess.push({
                                        bengali: `তোমাকে দেয়া টাইম এর ভিতরে তুমি খেলায় কোনো রেসপন্স করোনি তাই তোমাকে রিফ্রেশ এর মাধ্যমে প্যাক করা হয়েছে `,
                                        english: `You did not respond to the game within the time given to you so you are packed with refresh`
                                    })
                                    newInfo.isTurn = false;
                                    newInfo.timeUp = new Date()
                                    return newInfo;
                            }else{
                                return info;
                            }
                        }) 
                        let resetPlaying = newPlaying.filter((info)=> info.packed === false); 
                        let myRoomNewRound = myRoomResult.round;
                        if(resetPlaying.length > 1){
                            let currentPlayingIndex = resetPlaying.findIndex((info)=> info.userId === myRoomResult.nextId);
                            let currentPlaying = resetPlaying[currentPlayingIndex];
                            let nextPlaying = resetPlaying[currentPlayingIndex+1] ? resetPlaying[currentPlayingIndex+1] : resetPlaying[0]
                            if(currentPlayingIndex === 0){
                                myRoomNewRound = myRoomNewRound + 1
                            }
                            newPlaying = newPlaying.map((info)=>{
                                if(info.userId === currentPlaying.userId){
                                    let newInfo = {...info};
                                        newInfo.isTurn = true;
                                        newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                        if(newInfo.seen === false && myRoomResult.maxBlindHit === newInfo.blindRound){
                                            newInfo.seen = true
                                        }
                                        return newInfo
                                }else{
                                    return info;
                                }
                            })
                            try {
                                let boardUpdateResult = await Board.update({
                                    playing: newPlaying,
                                    player: newPlayer,
                                    currentId: currentPlaying.userId,
                                    nextId: nextPlaying.userId,
                                    round: myRoomNewRound
                                },{
                                    where: {roomId, id}
                                });
                                if(boardUpdateResult && boardUpdateResult[0]){
                                    try {
                                        let boardUpdateResult = await Board.findOne({where: {id, roomId}});
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
                                                        io.sockets.in(info.socketId).emit('packUpSingleUser',{roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo})
                                                    });
                                                    res.json({roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo}); 
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
                                    [`${myRoomResult.balanceType.toLowerCase()}Balance`]: myRoomResult.currentBalance
                                },{
                                    where:{userId: winnerPlaying.userId}
                                })
                                if(userBalanceUpdateResult && userBalanceUpdateResult[0] && userBalanceUpdateResult[0][1]){
                                        let recentTxrId = uid(8); 
                                        let boardTransaction = {
                                            typeName: 'GAME WIN',
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
                                                    where:{roomId, id}, 
                                                });
                                                if(myRoomUpdateResult && myRoomUpdateResult[0]){

                                                    try {
                                                        let myRoomUpdateResult = await Board.findOne({where: {id, roomId}});
                                                            myRoomUpdateResult = jsonConverterUtils.singleBoard(myRoomUpdateResult);
                                                        if(myRoomResult && myRoomUpdateResult.id){
                                                            try {
                                                                let resultGetAllConnectedList = await  ConnectedList.findAll({attributes: ['socketId']});
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

                                                                        }else{
                                                                            next(new Error('Playing history updated fail!'))
                                                                        }
                                                                    } catch (error) {
                                                                        next(new Error(error.message))
                                                                    }
                                                                    // resultGetAllConnectedList.forEach((info)=>{
                                                                    //     io.sockets.in(info.socketId).emit('boardFinish',{roomId: myRoomUpdateResult.roomId, roomInfo: myRoomUpdateResult, playingInfo: newPlaying, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance)})
                                                                    // });
                                                                    // res.json({roomId: myRoomUpdateResult.roomId, roomInfo: myRoomUpdateResult, playingInfo: newPlaying, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance)});
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
                    next(new Error(`Please wait till ${new Date(currentUserInfo.timeUp).toString().split(' ')[4]}`));
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
});

module.exports = handleRefreshMyCard;