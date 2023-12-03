const asyncHandler = require('express-async-handler');  
const InRoom = require('../../models/InRoom');
const User = require('../../models/User');
const Board = require('../../models/Board');
const ConnectedList = require('../../models/ConnectedList');
const jsonConverterUtils = require('../../utils/JsonConverter');
const Currency = require('../../models/Currency');


const handleCreateNewBoard = asyncHandler(async(req, res, next)=>{
    
    let {name,  join,  board,  chaal,  blind,  increase,  compare,  type,  isSchedule,  startTime, balanceType, adminId, roomId, maxBlindHit , maxChaalHit , minBlindHit , minChaalHit , maxPlayer, currency} = req.body;  
    if(name && join && board && chaal && blind  && type && balanceType && adminId && roomId && maxPlayer && maxBlindHit && maxChaalHit && minBlindHit && minChaalHit){
        if((increase === true || increase === false) && (compare === true || compare === false) && (isSchedule === true || isSchedule === false)){
            try {
                let currencyResult = await Currency.findOne({where: {
                    name: currency
                }});
                if(currencyResult && currencyResult.id){

                    let joinConvertToDollar = Number(join) / Number(currencyResult.currencyRate);
                    let boardConvertToDollar = Number(board) / Number(currencyResult.currencyRate);
                    let chaalConvertToDollar = Number(chaal) / Number(currencyResult.currencyRate);
                    let blindConvertToDollar = Number(blind) / Number(currencyResult.currencyRate);
                    
                    try {
                        let resultConnectedList = await InRoom.findOne({
                            where: {id: 1}
                        }) 
                        resultConnectedList = jsonConverterUtils.singleInRoomConverter(resultConnectedList)
                        if(resultConnectedList && resultConnectedList?.id > 0 && resultConnectedList.userIdes.indexOf(adminId) === -1 ){
                            
                            try {  
                                let userInfo = await User.findOne({
                                    where: {userId: adminId}
                                })
                                if(userInfo && userInfo?.id){ 
                                    if(Number(userInfo[`${balanceType}Balance`]) >= Number(joinConvertToDollar)){
                                        let postData = req.body; 
                                        delete postData.currency;
                                        try {
                                            let boardInfo = await Board.create({ 
                                                    rootBlind: Number(blindConvertToDollar),
                                                    rootChaal: Number(chaalConvertToDollar),
                                                    ...postData,
                                                    join: joinConvertToDollar,
                                                    chaal: chaalConvertToDollar,
                                                    blind: blindConvertToDollar,
                                                    board: boardConvertToDollar,
                                                    accessIdes: [adminId],
                                                    member: [adminId],
                                                    player: [],
                                                    playing: [],
                                                    currentBalance: 0,
                                                    totalBalance: 0,
                                                    increase: `${postData.increase}`,
                                                    compare: `${postData.compare}`,
                                                    isSchedule: `${postData.isSchedule}`,
                                                    currentCommission: 0,
                                                    startTime: postData.isSchedule ? new Date(postData.startTime).toISOString() : new Date(),
                                                    
                                                })
                                            if(boardInfo && boardInfo.id){
                                                try {
                                                    let updateUserConnectedRoom = await ConnectedList.update({
                                                        roomId: boardInfo.roomId,
                                                        inRoom: 'true'
                                                    },{
                                                        where: {userId: adminId}
                                                    })
                                                    if(updateUserConnectedRoom && updateUserConnectedRoom[0]){
                                                        
                                                        try {
                                                            let newConnectedUser = await InRoom.update({
                                                                userIdes: [...resultConnectedList.userIdes, adminId],
                                                                roomWithId: [...resultConnectedList.roomWithId, {roomId: boardInfo.roomId, adminId}]
                                                            },{
                                                                where: {id: 1}
                                                            })
                                                            if(newConnectedUser && newConnectedUser[0]){
                                                                
                                                                try {
                                                                    let resultGetAllConnectedList = await ConnectedList.findAll({attributes: ['socketId']});
                                                                    if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                        resultGetAllConnectedList.forEach((info)=>{
                                                                            io.sockets.in(info.socketId).emit('addNewRoom',{boardInfo, roomId})
                                                                        });
                                                                        res.json(boardInfo)
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
                                                next(new Error("Internal server error!"))
                                            }
                                        } catch (error) { 
                                            next(new Error(error.message))
                                        }
                                    }else{
                                        next(new Error('You do not have enough real balance'))
                                    }
                                }else{
                                    next(new Error(`Your account does't existed in our database!`))
                                }
                            } catch (error) {
                                next(new Error(error.message))
                            }
                        }else{ 
                            next(new Error(`You'r already in a room line 5`))
                        }
                    } catch (error) {
                        next(new Error(error.message))
                    }
                }else{
                    next(new Error('Currency not found!'))
                }
            } catch (error) {
                next(new Error(error.message))
            }
        }else{
            next(new Error('Invalid server request!'));
        }
    }else{
        next(new Error('Invalid server request!'));
    }
})

module.exports = handleCreateNewBoard;