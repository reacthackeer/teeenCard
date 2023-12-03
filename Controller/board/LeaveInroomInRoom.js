const asyncHandler = require('express-async-handler');  
const { uid } = require('uid'); 
const Board = require('../../models/Board');
const ConnectedList = require('../../models/ConnectedList');
const InRoom = require('../../models/InRoom');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const jsonConverterUtils = require('../../utils/JsonConverter');
const PlayingHistory = require('../../models/PlayingHistory');

const handleLeaveInRoomInRoom = asyncHandler(async(req, res, next)=>{
    
    let {roomId, userId, id} = req.body;
    if(roomId && userId && id){ 
        try {
            let myRoomResult = await Board.findOne({where: {id, roomId}});
                myRoomResult = jsonConverterUtils.singleBoard(myRoomResult);
            if(myRoomResult && myRoomResult.id > 0 && myRoomResult.accessIdes.indexOf(userId) !== -1){
  
                if(myRoomResult.isStart === 'true'){
                    if(myRoomResult.currentId === userId){
                        let newPlaying = [...myRoomResult.playing];
                        let newPlayer = [...myRoomResult.player];
                            newPlayer = newPlayer.filter((info)=> info.userId !== userId);
                        let newMember = [...myRoomResult.member];
                            newMember = newMember.filter((info)=> info !== userId);
                        let newAccessIdes = [...myRoomResult.accessIdes];
                            newAccessIdes = newAccessIdes.filter((info)=> info !== userId);
                            newPlaying = newPlaying.map((info)=>{
                                if(info.userId === userId){
                                    let newInfo = {...info};
                                        newInfo.packed = true;
                                        newInfo.packedReasonMess.push({
                                            bangla: 'তুমি নিজেই খেলা থেকে বের হয়েছো ',
                                            english: `You're out of the game yourself`
                                        });
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
                                        accessIdes: newAccessIdes,
                                        member: newMember,
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
                                                    let updateUserConnectedRoom = await ConnectedList.update({
                                                        roomId: 'false',
                                                        inRoom: 'false'
                                                    },{
                                                        where: {userId}
                                                    })
                                                    if(updateUserConnectedRoom && updateUserConnectedRoom[0]){
                                                        try {
                                                            let resultConnectedList = await InRoom.findOne({where:{id: 1}});
                                                                resultConnectedList = jsonConverterUtils.singleInRoomConverter(resultConnectedList);
                                                            if(resultConnectedList && resultConnectedList.id > 0){
                                                                try {
                                                                    let newConnectedUser = await InRoom.update({
                                                                        userIdes: [...resultConnectedList.userIdes].filter((info)=> info !== userId),
                                                                        roomWithId: [...resultConnectedList.roomWithId].filter((info)=> info.adminId !== userId)
                                                                    },{
                                                                        where: {id: 1}
                                                                    })
                                                                    if(newConnectedUser && newConnectedUser[0]){
                                                                        try {
                                                                            let newConnectedUser = await InRoom.findOne({where: {id: 1}});
                                                                                newConnectedUser = jsonConverterUtils.singleInRoomConverter(newConnectedUser);
                                                                            if(newConnectedUser && newConnectedUser.id){
                                                                                try {
                                                                                    let resultGetAllConnectedList = await ConnectedList.findAll({attributes: ['socketId']});
                                                                                    if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                                        let newRoomInfo = {...boardUpdateResult};
                                                                                        newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                                            delete playingInfo.card;
                                                                                            return playingInfo;
                                                                                        })
                                                                                        resultGetAllConnectedList.forEach((info)=>{
                                                                                            io.sockets.in(info.socketId).emit('packUpSingleUser',{roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo, connectedInfo: {roomWithId: newConnectedUser.roomWithId, userIdes: newConnectedUser.userIdes}})
                                                                                        });
                                                                                        res.json({roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo, connectedInfo: {roomWithId: newConnectedUser.roomWithId, userIdes: newConnectedUser.userIdes}}); 
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
                                                        where:{roomId, id}
                                                    });
                                                    if(myRoomUpdateResult && myRoomUpdateResult[0]){
                                                        try {
                                                            let myRoomUpdateResult = await Board.findOne({where: {roomId, id}});
                                                                myRoomUpdateResult = jsonConverterUtils.singleBoard(myRoomUpdateResult);
                                                            if(myRoomUpdateResult && myRoomUpdateResult.id){
                                                                try {
                                                                    let resultGetAllConnectedList = await ConnectedList.findAll({attributes: ['socketId']});
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
                                                                                resultGetAllConnectedList.forEach((info)=>{
                                                                                    io.sockets.in(info.socketId).emit('boardFinish',{roomId: myRoomUpdateResult.roomId, roomInfo: myRoomUpdateResult, playingInfo: newPlaying, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance)})
                                                                                });
                                                                                res.json({roomId: myRoomUpdateResult.roomId, roomInfo: myRoomUpdateResult, playingInfo: newPlaying, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance)});
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
                                                                next(new Error('Internal server error while find my board'))
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
                        let newPlayer = [...myRoomResult.player];
                        let newMember = [...myRoomResult.member];
                        let newAccessIdes = [...myRoomResult.accessIdes];
                            newMember = newMember.filter((info)=> info !== userId);
                            newAccessIdes = newAccessIdes.filter((info)=> info !== userId);
                            newPlayer = newPlayer.filter((info)=> info.userId !== userId); 
                            newPlaying = newPlaying.map((info)=>{
                                if(info.userId === userId){
                                    let newInfo = {...info};
                                        newInfo.packed = true;
                                        newInfo.packedReasonMess.push({
                                            bengali: 'তুমি নিজেই খেলা থেকে বের হয়েছো ',
                                            english: `You're out of the game yourself`
                                        });
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
                                let currentPlayingIndex = resetPlaying.findIndex((info)=> info.userId === myRoomResult.currentId);
                                let currentPlaying = resetPlaying[currentPlayingIndex];
                                let nextPlaying = resetPlaying[currentPlayingIndex+1] ? resetPlaying[currentPlayingIndex+1] : resetPlaying[0]
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
                                        accessIdes: newAccessIdes,
                                        member: newMember,
                                        currentId: currentPlaying.userId,
                                        nextId: nextPlaying.userId, 
                                    },{
                                        where: {roomId, id}
                                    });
                                    if(boardUpdateResult && boardUpdateResult[0]){
                                        try {
                                            let boardUpdateResult = await Board.findOne({where: {id, roomId}});
                                                boardUpdateResult = jsonConverterUtils.singleBoard(boardUpdateResult)
                                            if(boardUpdateResult && boardUpdateResult.id){
                                                try {
                                                    let updateUserConnectedRoom = await ConnectedList.update({
                                                        roomId: 'false',
                                                        inRoom: 'false'
                                                    },{
                                                        where: {userId}
                                                    })
                                                    if(updateUserConnectedRoom && updateUserConnectedRoom[0]){
                                                        try {
                                                            let resultConnectedList = await InRoom.findOne({where:{id: 1}});
                                                                resultConnectedList = jsonConverterUtils.singleInRoomConverter(resultConnectedList);
                                                            if(resultConnectedList && resultConnectedList.id){
                                                                try {
                                                                    let newConnectedUser = await InRoom.update({
                                                                        userIdes: [...resultConnectedList.userIdes].filter((info)=> info !== userId),
                                                                        roomWithId: [...resultConnectedList.roomWithId].filter((info)=> info.adminId !== userId)
                                                                    },{
                                                                        where: {id: 1}
                                                                    })
                                                                    if(newConnectedUser && newConnectedUser[0]){
                                                                        try {
                                                                            let newConnectedUser = await InRoom.findOne({where: {id: 1}});
                                                                                newConnectedUser = jsonConverterUtils.singleInRoomConverter(newConnectedUser);
                                                                            if(newConnectedUser && newConnectedUser.id){
                                                                                try {
                                                                                    let resultGetAllConnectedList = await ConnectedList.findAll({attributes: ['socketId']});
                                                                                    if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                                        let newRoomInfo = {...boardUpdateResult};
                                                                                        newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                                            delete playingInfo.card;
                                                                                            return playingInfo;
                                                                                        })
                                                                                        resultGetAllConnectedList.forEach((info)=>{
                                                                                            io.sockets.in(info.socketId).emit('packUpSingleUser',{roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo, connectedInfo: {roomWithId: newConnectedUser.roomWithId, userIdes: newConnectedUser.userIdes}})
                                                                                        });
                                                                                        res.json({roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo, connectedInfo: {roomWithId: newConnectedUser.roomWithId, userIdes: newConnectedUser.userIdes}}); 
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
                                })
                                try {
                                    let userBalanceUpdateResult = await User.increment({
                                        [`${myRoomResult.balanceType.toLowerCase()}Balance`]: myRoomResult.currentBalance
                                    },{
                                        where:{userId: winnerPlaying.userId}
                                    })
                                    if(userBalanceUpdateResult && userBalanceUpdateResult[0] && userBalanceUpdateResult[0][0]){
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
                                                        where:{roomId, id}
                                                    });
                                                    if(myRoomUpdateResult && myRoomUpdateResult[0]){
                                                        try {
                                                            let myRoomUpdateResult = await Board.findOne({where: {id, roomId}});
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
                                                                                resultGetAllConnectedList.forEach((info)=>{
                                                                                    io.sockets.in(info.socketId).emit('boardFinish',{roomId: myRoomUpdateResult.roomId, roomInfo: myRoomUpdateResult, playingInfo: newPlaying, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance)})
                                                                                });
                                                                                res.json({roomId: myRoomUpdateResult.roomId, roomInfo: myRoomUpdateResult, playingInfo: newPlaying, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance)});
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
                                                                next( new Error('Internal server error while find one board'))
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
                    let newPlaying = [...myRoomResult.playing];
                    let newPlayer = [...myRoomResult.player];
                    let newMember = [...myRoomResult.member];
                    let newAccessIdes = [...myRoomResult.accessIdes];
                        newMember = newMember.filter((info)=> info !== userId);
                        newAccessIdes = newAccessIdes.filter((info)=> info !== userId);
                        newPlayer = newPlayer.filter((info)=> info.userId !== userId);
                        newPlaying = newPlaying.filter((info)=> info.userId !== userId);
                        try {
                            let boardUpdateResult = await Board.update({
                                playing: newPlaying,
                                player: newPlayer,
                                accessIdes: newAccessIdes,
                                member: newMember,   
                            },{
                                where: {roomId, id} 
                            });
                            if(boardUpdateResult && boardUpdateResult[0]){
                                try {
                                    let boardUpdateResult = await Board.findOne({where: {id, roomId}});
                                        boardUpdateResult = jsonConverterUtils.singleBoard(boardUpdateResult);
                                    if(boardUpdateResult && boardUpdateResult.id){
                                        try {
                                            let updateUserConnectedRoom = await ConnectedList.update({
                                                roomId: 'false',
                                                inRoom: 'false'
                                            },{
                                                where: {userId}
                                            })
                                            if(updateUserConnectedRoom && updateUserConnectedRoom[0]){
                                                try {
                                                    let resultConnectedList = await InRoom.findOne({where:{id: 1}});
                                                        resultConnectedList = jsonConverterUtils.singleInRoomConverter(resultConnectedList);
                                                    if(resultConnectedList && resultConnectedList.id > 0){
                                                        try {
                                                            let newConnectedUser = await InRoom.update({
                                                                userIdes: [...resultConnectedList.userIdes].filter((info)=> info !== userId),
                                                                roomWithId: [...resultConnectedList.roomWithId].filter((info)=> info.adminId !== userId)
                                                            },{
                                                                where: {id: 1}
                                                            })
                                                            if(newConnectedUser && newConnectedUser[0] ){
                                                                try {
                                                                    let newConnectedUser = await InRoom.findOne({where: {id: 1}});
                                                                        newConnectedUser = jsonConverterUtils.singleInRoomConverter(newConnectedUser);
                                                                    if(newConnectedUser && newConnectedUser.id){
                                                                        try {
                                                                            let resultGetAllConnectedList = await ConnectedList.findAll({attributes: ['socketId']});
                                                                            if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                                let newRoomInfo = {...boardUpdateResult};
                                                                                newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                                    delete playingInfo.card;
                                                                                    return playingInfo;
                                                                                })
                                                                                resultGetAllConnectedList.forEach((info)=>{
                                                                                    io.sockets.in(info.socketId).emit('packUpSingleUser',{roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo, connectedInfo: {roomWithId: newConnectedUser.roomWithId, userIdes: newConnectedUser.userIdes}})
                                                                                });
                                                                                res.json({roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo, connectedInfo: {roomWithId: newConnectedUser.roomWithId, userIdes: newConnectedUser.userIdes}}); 
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
                                next(new Error('Internal server error!'))
                            }
                        } catch (error) { 
                            next(new Error(error.message))
                        }
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

module.exports = handleLeaveInRoomInRoom;