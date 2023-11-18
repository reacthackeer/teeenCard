const asyncHandler = require('express-async-handler');  
const Board = require('../../models/Board');
const InRoom = require('../../models/InRoom');
const jsonConverterUtils = require('../../utils/JsonConverter');

const handleGetAllBoard = asyncHandler(async(req, res, next)=>{
    const page = Number(req.query?.page) || 1; 
    let limit = 20
    let skip = (limit*page) - limit;  
    
    try {
        let result = await Board.findAll({
            offset: skip,
            limit: limit, 
        });
        if(result && result?.length > 0){  
            result = jsonConverterUtils.multipleBoard(result);
            
            let newBoardResult = [];
            result.forEach((roomInfo)=>{
                let newRoomInfo = {...roomInfo}; 
                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                        delete playingInfo.card;
                        return playingInfo;
                    })
                    newBoardResult.push(newRoomInfo);
            })
            try {
                let secondResult = await Board.count({}); 
                if(secondResult && secondResult > 0){  
                    let boardIdes = newBoardResult.map((info)=> info.roomId)
                    try {
                        let connectedWithRoomResult = await InRoom.findOne({
                            where: {id: 1}
                        })
                        connectedWithRoomResult = jsonConverterUtils.singleInRoomConverter(connectedWithRoomResult);
                        if(connectedWithRoomResult && connectedWithRoomResult?.id > 0){
                            let resResult = {boards: newBoardResult, currentPage: page, boardIdes: boardIdes, pages: Math.ceil(secondResult/limit),  userIdes: connectedWithRoomResult.userIdes, roomWithId: connectedWithRoomResult.roomWithId}; 
                            res.json(resResult);
                        }else{
                            res.json({boards: [], boardIdes: [], pages: 1, currentPage:page, userIdes: [], roomWithId: []})
                        }
                    } catch (error) {
                        next(new Error(error.message))
                    }
                }else{
                    res.json({boards: [], boardIdes: [], pages: 1, currentPage:page, userIdes: [], roomWithId: []})
                }
            } catch (error) {
                next(new Error(error.message))
            }
        }else{
            res.json({boards: [], boardIdes: [], currentPage:page, pages: 1, userIdes: [], roomWithId: []})
        }
    } catch (error) { 
        next(new Error(error.message))
    }
})

module.exports = handleGetAllBoard;