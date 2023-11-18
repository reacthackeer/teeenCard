const asyncHandler = require('express-async-handler');  
const InRoom = require('../../models/InRoom');
const User = require('../../models/User');
const Board = require('../../models/Board');
const ConnectedList = require('../../models/ConnectedList');
const jsonConverterUtils = require('../../utils/JsonConverter');

const handleJoinInRoomPrivatePlayer = asyncHandler(async(req, res, next)=>{

    let {id, userId, roomId} = req.body;
    if(id && userId && roomId){
        try {
            let resultConnectedList = await InRoom.findOne({
                where: {id: 1}
            })
            resultConnectedList = jsonConverterUtils.singleInRoomConverter(resultConnectedList);
            if(resultConnectedList && resultConnectedList?.id > 0 && resultConnectedList.userIdes.indexOf(userId) === -1 ){
                try {  
                    let userInfo = await User.findOne({
                        where: {userId}
                    })
                    if(userInfo && userInfo?.id){ 
                        try {
                            let getMyRoomResult = await Board.findOne({where:{id}});
                                getMyRoomResult = jsonConverterUtils.singleBoard(getMyRoomResult);
                            if(getMyRoomResult && getMyRoomResult?.id > 0 && Number(userInfo[`${getMyRoomResult.balanceType.toLowerCase()}Balance`]) >= Number(getMyRoomResult.join)){
                                if(userInfo.invitation === 'Enable'){
                                    let newBoardInfo = {...getMyRoomResult};
                                    newBoardInfo.accessIdes = [...newBoardInfo.accessIdes, userId];
                                    newBoardInfo.member = [...newBoardInfo.member, userId];
                                    try {
                                        let boardUpdateResult = await Board.update({
                                            accessIdes: newBoardInfo.accessIdes,
                                            member: newBoardInfo.member
                                        },{
                                            where: {id}
                                        })
                                        if(boardUpdateResult && boardUpdateResult[0]){ 
                                            
                                            try {
                                                let updateUserConnectedRoom = await ConnectedList.update({
                                                    roomId,
                                                    inRoom: 'true'
                                                },{
                                                    where: {userId}
                                                })
                                                if(updateUserConnectedRoom && updateUserConnectedRoom[0]){
                                                    
                                                    try {
                                                        let newConnectedUser = await InRoom.update({
                                                            userIdes: [...resultConnectedList.userIdes, userId],
                                                            roomWithId: [...resultConnectedList.roomWithId, {roomId, adminId: userId}]
                                                        },{
                                                            where: {id: 1}
                                                        })
                                                        if(newConnectedUser && newConnectedUser[0] ){
                                                            
                                                            try {
                                                                let resultGetAllConnectedList = await ConnectedList.findAll({attributes: ["socketId"]});
                                                                if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                    resultGetAllConnectedList.forEach((info)=>{
                                                                        io.sockets.in(info.socketId).emit('addNewMemberInRoom',{userId, roomId})
                                                                    });
                                                                    res.json({id: 1})
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
                                    next(new Error('Player invitation system is blocked!'))
                                }
                            }else{
                                next(new Error('Balance low!'))
                            }
                        } catch (error) {
                            next(new Error(error.message))
                        }
                    }else{
                        next(new Error(`Your account does't existed in our database!`))
                    }
                } catch (error) {
                    next(new Error(error.message))
                }
            }else{ 
                next(new Error(`You'r already in a room`))
            }
        } catch (error) {
            next(new Error(error.message))
        }
    }else{
        next(new Error('Invalid server request!'))
    }
});

module.exports = handleJoinInRoomPrivatePlayer;