const asyncHandler = require('express-async-handler'); 
const { handleGetCardByPlayer, handleGetMyCardsByRandomly } = require('../../utils/cardUtils');
const { uid } = require('uid'); 
const Board = require('../../models/Board');
const User = require('../../models/User');
const { Op } = require('sequelize');
const Transaction = require('../../models/Transaction');
const ConnectedList = require('../../models/ConnectedList');
const jsonConverterUtils = require('../../utils/JsonConverter');
const RootAsset = require('../../models/RootAsset');

const handleStartRoom = asyncHandler(async(req, res, next)=>{
    let {roomId, userId, id} = req.body;
    if(roomId && userId && id){
        try {
            let myRoomResult = await Board.findOne({where: {id: id}});
                myRoomResult = jsonConverterUtils.singleBoard(myRoomResult);
            let myPlayerPosition = myRoomResult?.player?.filter((info)=> info?.userId === userId);
            let nowTime = new Date().getTime();
            let prevDate = new Date(myRoomResult?.cardViewTill).getTime();
            if(
                myRoomResult && 
                myRoomResult.id > 0 && 
                myRoomResult.accessIdes.indexOf(userId) !== -1 && 
                myPlayerPosition.length === 1 && 
                myRoomResult.isStart === 'false' && 
                myRoomResult.playing.length === 0 
            ){
                if(prevDate <= nowTime){
                    let playerIdes = myRoomResult.player.map((info)=> info.userId);
                    try {
                        let playerUserResult = await User.findAll({
                            where: {
                                userId: {[Op.in]: playerIdes}
                            }
                        })
                        let NBT = myRoomResult.balanceType.toLowerCase(); // new balance type
                        if(playerUserResult && playerUserResult?.length > 1){

                            let getRandomUser = handleGetMyCardsByRandomly(playerUserResult);
                            let pureRandomUser = [];
                            getRandomUser.forEach((info)=>{ 
                                if(Number(info[`${NBT}Balance`]) >= Number(myRoomResult.board)){
                                    pureRandomUser.push(info) 
                                }
                            }) 

                            let cards = handleGetCardByPlayer(pureRandomUser.length);
                            let getCardsRandomly = handleGetMyCardsByRandomly(cards);
                            pureRandomUser = pureRandomUser.slice(0, myRoomResult.maxPlayer);
                            if(pureRandomUser.length > 1 && pureRandomUser.length < 18){
                                let AllUserWithCards = [];
                                pureRandomUser.forEach((userInfo, index)=>{
                                    let newUserInfo = {
                                        index,
                                        src: userInfo.src,
                                        name: userInfo.name,
                                        email: userInfo.email,
                                        phone: userInfo.phone,
                                        userId: userInfo.userId,
                                        referralCode: userInfo.referralCode,
                                        id: userInfo.id,
                                        card: getCardsRandomly.splice(Math.floor(Math.random()*getCardsRandomly.length), 1)[0],
                                        seen: false,
                                        packed: false,
                                        packedReasonMess: [],
                                        seenRound: 0,
                                        blindRound: 0,
                                        side: false,  
                                        isTurn: false,
                                        timeUp: new Date()
                                    }
                                    AllUserWithCards.push(newUserInfo)
                                })
                                try {   
                                    AllUserWithCards = AllUserWithCards.slice(0,17)
                                    let totalBalance = Number(myRoomResult.board) * AllUserWithCards.length;
                                    let currentCommission = (totalBalance / 100) * Number(process.env[`${NBT}BoardFee`]);
                                    let currentBalance = (totalBalance / 100) * (100 - Number(process.env[`${NBT}BoardFee`]));
                                    let totalAppCommission = currentCommission / 2;
                                    let totalPartnerCommission = currentCommission / 2;
                                    try {
                                        
                                        let rootAssetUpdateResult = await RootAsset.increment({   
                                            [`${NBT}TotalCommission`]:  currentCommission,
                                            [`${NBT}TotalAppCommission`]:  totalAppCommission,
                                            [`${NBT}TotalPartnerCommission`]:  totalPartnerCommission
                                        },{
                                            where:{id: 1}
                                        }) 
                                        if(rootAssetUpdateResult && rootAssetUpdateResult[0] && rootAssetUpdateResult[0][1]){
                                            AllUserWithCards[0].isTurn = true;
                                            AllUserWithCards[0].timeUp = new Date(new Date().setMilliseconds(40000));
                                            let roomUpdateResult = await Board.update({
                                                playing: AllUserWithCards,
                                                totalBalance: totalBalance,
                                                currentBalance: currentBalance,
                                                currentCommission: currentCommission,
                                                currentId: AllUserWithCards[0].userId,
                                                rootBlind: myRoomResult.blind,
                                                rootChaal: myRoomResult.chaal,
                                                nextId: AllUserWithCards[1].userId,
                                                isStart: 'true'
                                            },{
                                                where: {id}
                                            })
                                            if(roomUpdateResult && roomUpdateResult[0]){
                                                try {
                                                    let roomUpdateResult = await Board.findOne({where: {id, roomId}});
                                                        roomUpdateResult = jsonConverterUtils.singleBoard(roomUpdateResult);
                                                        if(roomUpdateResult && roomUpdateResult.id){
                                                            let playingUserIdes = AllUserWithCards.map((info)=> info.userId);
                                                            let allUserBalanceUpdateResult = await User.increment({
                                                                [`${NBT}Balance`]: -Number(myRoomResult.board)
                                                            },{
                                                                where: {userId: {[Op.in]: playingUserIdes}}
                                                            })
                
                                                            if(allUserBalanceUpdateResult && allUserBalanceUpdateResult[0] && allUserBalanceUpdateResult[0][1]){
                                                                let allUserTransaction = [];
                                                                AllUserWithCards.forEach((info)=>{
                                                                    let recentTxrId = uid(8); 
                                                                    let boardTransaction = {
                                                                        typeName: 'BOARD FEE',
                                                                        isIn: 'OUT',
                                                                        amount: (Number(myRoomResult.board) / 100) * (100 - Number(process.env[`${NBT}BoardFee`])),
                                                                        txrId: recentTxrId,
                                                                        userId: info.userId,
                                                                        sourceId: info.referralCode,
                                                                        balanceType:  NBT.toUpperCase()
                                                                    }
                                                                    let boardFeeCommission = {
                                                                        typeName: 'BOARD COMMISSION',
                                                                        isIn: 'OUT',
                                                                        amount: (Number(myRoomResult.board) / 100) * Number(process.env[`${NBT}BoardFee`]),
                                                                        txrId: recentTxrId,
                                                                        userId: info.userId,
                                                                        sourceId: info.referralCode,
                                                                        balanceType:  NBT.toUpperCase()
                                                                    }
                                                                    let boardFeeAppCommission = {
                                                                        typeName: 'BOARD COMMISSION',
                                                                        isIn: 'IN',
                                                                        amount: (Number(myRoomResult.board) / 100) * (Number(process.env[`${NBT}BoardFee`]) / 2),
                                                                        txrId: recentTxrId,
                                                                        userId: '999999999999',
                                                                        sourceId: info.userId,
                                                                        balanceType:  NBT.toUpperCase()
                                                                    }
                                                                    let boardFeePartnerCommission = {
                                                                        typeName: 'BOARD COMMISSION',
                                                                        isIn: 'IN',
                                                                        amount: (Number(myRoomResult.board) / 100) * (Number(process.env[`${NBT}BoardFee`]) / 2),
                                                                        txrId: recentTxrId,
                                                                        userId: info.referralCode,
                                                                        sourceId: info.userId,
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
                                                                })
                                                                try {
                                                                    let result = await Transaction.bulkCreate(allUserTransaction);
                                                                    if(result && result.length > 0){
                                                                        try {
                                                                            let resultGetAllConnectedList = await ConnectedList.findAll({attributes: ['socketId']});
                                                                            if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                                let newRoomInfo = {...roomUpdateResult};
                                                                                newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                                    delete playingInfo.card;
                                                                                    return playingInfo;
                                                                                })
                                                                                resultGetAllConnectedList.forEach((info)=>{
                                                                                    io.sockets.in(info.socketId).emit('startMyRoom',{roomId: roomUpdateResult.roomId, roomInfo: newRoomInfo})
                                                                                });
                                                                                res.json({roomId: roomUpdateResult.roomId, roomInfo: newRoomInfo});
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
                                                                next(new Error("Internal server error!"))
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
                                        }else{
                                            next(new Error('Internal server error!'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    } 
                                } catch (error) {
                                    next(new Error(error.message))
                                } 
                            }else{
                                next(new Error('Minimum 2 player need to start this game!'))
                            }
                        }else{
                            next(new Error('Minimum 2 player need to start this game!'))
                        }
                    } catch (error) {
                        next(new Error(error.message))
                    } 
                }else{
                    next(new Error(`Please wait till ${new Date(myRoomResult.cardViewTill).toString().split(' ')[4]}`));
                }
            }else{
                next(new Error('Unauthenticated server requested!'))
            }
        } catch (error) {
            next(new Error(error.message))
        }
    }else{
        next(new Error('Invalid server request'))
    }
});

module.exports = handleStartRoom;