const asyncHandler = require('express-async-handler');  
const InRoom = require('../../models/InRoom');
const User = require('../../models/User');
const Board = require('../../models/Board');
const ConnectedList = require('../../models/ConnectedList');
const jsonConverterUtils = require('../../utils/JsonConverter');

const handleEnterPlayerInRoom = asyncHandler(async(req, res, next)=>{
    let {id, userId, roomId} = req.body;
    if(id && userId && roomId){
        try {
            let resultConnectedList = await InRoom.findOne({
                where: {id: 1}
            })
            resultConnectedList = jsonConverterUtils.singleInRoomConverter(resultConnectedList);
            if(resultConnectedList && resultConnectedList?.id > 0 && resultConnectedList.userIdes.indexOf(userId) !== -1 ){
                try {  
                    let userInfo = await User.findOne({
                        where: {userId}
                    })
                    let newUserInfo = { 
                        name: userInfo.name,
                        email: userInfo.email,
                        phone: userInfo.phone,
                        userId: userInfo.userId,
                        referralCode: userInfo.referralCode,
                        id: userInfo.id
                    }
                    if(userInfo && userInfo?.id && userInfo.isDisabled === 'false' && userInfo.isJail === 'false'){ 
                        try {
                            let getMyRoomResult = await Board.findOne({where:{id}});
                                getMyRoomResult = jsonConverterUtils.singleBoard(getMyRoomResult);
                            let myPosition = getMyRoomResult?.player?.filter((info)=> info?.userId === userId);

                            if(getMyRoomResult && getMyRoomResult?.id > 0 && myPosition.length === 0){
                                let newBoardInfo = {...getMyRoomResult}; 
                                    newBoardInfo.player = [...newBoardInfo.player, {...newUserInfo}]
                                    let newRoomInfo = {...newBoardInfo};
                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                        delete playingInfo.card;
                                        return playingInfo;
                                    }) 
                                    try {
                                        let boardUpdateResult = await Board.update({ 
                                            player: newBoardInfo.player
                                        },{
                                            where: {id}
                                        })
                                        if(boardUpdateResult && boardUpdateResult[0]){
                                            try {
                                                let resultGetAllConnectedList = await ConnectedList.findAll({attributes: ['socketId']});
                                                if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                    resultGetAllConnectedList.forEach((info)=>{
                                                        io.sockets.in(info.socketId).emit('addNewPlayerInRoom',{userId, roomId, userInfo:newUserInfo})
                                                    });
                                                    res.json(newRoomInfo)
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
                next(new Error(`Invalid server request!`))
            }
        } catch (error) {
            next(new Error(error.message))
        }
    }else{
        next(new Error('Invalid server request!'))
    }


});

module.exports = handleEnterPlayerInRoom;