const asyncHandler = require('express-async-handler'); 
const Board = require('../../models/Board');
const jsonConverterUtils = require('../../utils/JsonConverter');
const handleGetMyRoom = asyncHandler(async(req, res, next)=>{
    let {roomId, userId} = req.params;
    
    if(roomId && userId){ 
        try {
            let result = await Board.findOne({where:{id: Number(roomId)}});
                result = jsonConverterUtils.singleBoard(result);
            if(result && result?.id > 0){  
                if(result.accessIdes.indexOf(userId) !== -1){
                    let newBoardInfo = {...result};
                    newBoardInfo.playing = newBoardInfo.playing.map((info)=>{
                        delete info.card;
                        return info;
                    })
                    res.json(newBoardInfo)
                }else{
                    next(new Error('Unauthenticated access founded!'))
                }
            }else{
                next(new Error('Board Not Found!'))
            }
        } catch (error) { 
            next(new Error(error.message))
        }
    }else{
        next(new Error('Invalid server request'))
    }
});

module.exports = handleGetMyRoom;