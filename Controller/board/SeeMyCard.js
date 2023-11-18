const asyncHandler = require('express-async-handler'); 
const Board = require('../../models/Board');
const ConnectedList = require('../../models/ConnectedList');
const jsonConverterUtils = require('../../utils/JsonConverter');

const handleSeeMyCard = asyncHandler(async(req, res, next)=>{
    let {roomId, userId, id} = req.body;
    if(roomId && userId && id){
        try {
            let myRoomResult = await Board.findOne({where: {id, roomId}});
                myRoomResult = jsonConverterUtils.singleBoard(myRoomResult);
            if(myRoomResult && myRoomResult.id > 0 && myRoomResult.accessIdes.indexOf(userId) !== -1 && myRoomResult.isStart === 'true'){
                let newPlaying = [...myRoomResult.playing];
                    newPlaying = newPlaying.map((info)=>{
                        if(info.userId === userId){
                            let newInfo = {...info};
                                newInfo.seen = true;
                                return newInfo;
                        }else{
                            return info;
                        }
                    })
                    try {
                        let boardUpdateResult = await Board.update({
                            playing: newPlaying
                        },{
                            where: {id, roomId}
                        })
                        if(boardUpdateResult && boardUpdateResult[0]){
                            try {
                                let boardUpdateResult = await Board.findOne({where: {id, roomId}});
                                    boardUpdateResult = jsonConverterUtils.singleBoard(boardUpdateResult);
                                if(boardUpdateResult && boardUpdateResult.id){

                                    let currentUser = newPlaying.filter((info)=> info.userId === userId);
                                    let newRoomInfo = {...boardUpdateResult};
                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                        delete playingInfo.card;
                                        return playingInfo;
                                    }) 
                                    try {
                                        let resultGetAllConnectedList = await ConnectedList.findAll({attributes: ['socketId', 'userId']});
                                        if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                            resultGetAllConnectedList.forEach((info)=>{
                                                if(info.userId !== userId){
                                                    io.sockets.in(info.socketId).emit('seeSomeOneCard',{roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo});
                                                }
                                                if(info.userId === userId){
                                                    io.sockets.in(info.socketId).emit('seeMyCard',{roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo, playingInfo: currentUser, userId});
                                                }
                                            });
                                            res.json({userId, roomId, seen: true});
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
});



module.exports = handleSeeMyCard;