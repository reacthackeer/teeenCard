const asyncHandler = require('express-async-handler');  
const Board = require('../../models/Board');
const ConnectedList = require('../../models/ConnectedList');
const InRoom = require('../../models/InRoom');
const jsonConverterUtils = require('../../utils/JsonConverter');

const handleDeleteSingleRoom = asyncHandler(async(req, res, next)=>{
    let {id, userId, roomId} = req.body; 
    if(id && userId){
        try {
            let getTargetedBoard = await Board.findOne({where:{id}});
                getTargetedBoard = jsonConverterUtils.singleBoard(getTargetedBoard);
                if(getTargetedBoard && getTargetedBoard?.accessIdes?.length === 1){
                    try {
                        let deleteResult = await Board.destroy({where: {id}});
                        if(deleteResult && deleteResult > 0){ 
                            try {
                                let updateConnectedList = await ConnectedList.update({roomId: 'false', inRoom: 'false', interested: 'false'},{where: {userId}});
                                if(updateConnectedList && updateConnectedList[0]){
                                    try {
                                        let updatedInRoomResult = await InRoom.findOne({where: {id: 1}});
                                        updatedInRoomResult = jsonConverterUtils.singleInRoomConverter(updatedInRoomResult);
                                        if(updatedInRoomResult && updatedInRoomResult?.id === 1){
                                            let newUserIdes = [...updatedInRoomResult.userIdes].filter((info)=> info !== userId);
                                            let newRoomWithId = [...updatedInRoomResult.roomWithId].filter((info)=> info.adminId !== userId);
                                            try {
                                                let inRoomUpdateResult = await InRoom.update({userIdes: newUserIdes, roomWithId: newRoomWithId},{where: {id: 1}});
                                                if(inRoomUpdateResult && inRoomUpdateResult[0]){
                                                    try {
                                                        let resultGetAllConnectedList = await ConnectedList.findAll({attributes: ['socketId']});
                                                        if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                            resultGetAllConnectedList.forEach((info)=>{ 
                                                                io.sockets.in(info.socketId).emit('removeSingleRoom',{roomId, userId})
                                                            });
                                                            res.json({id, roomId})
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
                                            next(new Error('Invalid delete request'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    }
                                }else{
                                    next(new Error('Invalid delete request!'));
                                }
                            } catch (error) {
                                next(new Error(error.message))
                            }
                        }else{
                            next(new Error('Invalid delete request!'))
                        }
                    } catch (error) {
                        next(new Error(error.message))
                    }
                }else{
                    next(new Error('Invalid delete request!'))
                }
        } catch (error) {
            next(new Error(error.message))
        }
    }else{
        next(new Error('Invalid delete requested!'))
    }
});

module.exports = handleDeleteSingleRoom;