const asyncHandler = require('express-async-handler');  
const InRoom = require('../../models/InRoom');
const Board = require('../../models/Board');
const ConnectedList = require('../../models/ConnectedList');
const jsonConverterUtils = require('../../utils/JsonConverter');

const handleLeavePlayerInRoom = asyncHandler(async(req, res, next)=>{
    let {id, userId, roomId} = req.body;
    if(id && userId && roomId){
        try {
            let resultConnectedList = await InRoom.findOne({
                where: {id: 1}
            })
            resultConnectedList = jsonConverterUtils.singleInRoomConverter(resultConnectedList);
            if(resultConnectedList && resultConnectedList?.id > 0 && resultConnectedList.userIdes.indexOf(userId) !== -1 ){
                try {
                    let getMyRoomResult = await Board.findOne({where:{id}});
                        getMyRoomResult = jsonConverterUtils.singleBoard(getMyRoomResult);
                    let myPlayerPosition = getMyRoomResult?.player?.filter((info)=> info?.userId === userId);
                    if(getMyRoomResult && getMyRoomResult?.id > 0 && myPlayerPosition?.length === 1){
                        let newBoardInfo = {...getMyRoomResult};  
                            newBoardInfo.player = [...newBoardInfo.player].filter((info)=> info.userId !== userId); 
                            
                            try {
                                let boardUpdateResult = await Board.update({ 
                                    player: newBoardInfo.player, 
                                },{
                                    where: {id}
                                })
                                if(boardUpdateResult && boardUpdateResult[0]){
                                    
                                    try {
                                        let resultGetAllConnectedList = await ConnectedList.findAll({attributes: ['socketId']});
                                        if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                            resultGetAllConnectedList.forEach((info)=>{
                                                io.sockets.in(info.socketId).emit('leaveSinglePlayerInRoom',{userId, roomId})
                                            });
                                            res.json({id: 3})
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
                next(new Error(`Internal server error!`))
            }
        } catch (error) {
            next(new Error(error.message))
        }
    }else{
        next(new Error('Invalid server request!'))
    }
});



module.exports = handleLeavePlayerInRoom;