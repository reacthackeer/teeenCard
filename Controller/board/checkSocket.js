const asyncHandler = require('express-async-handler');  
const ConnectedList = require('../../models/ConnectedList');

const handleCheckSocket = asyncHandler(async(req, res, next)=>{
    try {
        let resultGetAllConnectedList = await  ConnectedList.findAll({attributes: ['socketId']});
        if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
            resultGetAllConnectedList.forEach((info)=>{
                io.sockets.in(info.socketId).emit('newMessage',{message: 'Hello World'})
            }) 
        }else{
            next(new Error('Socket Check Success'))
        }
    } catch (error) { 
        next(new Error(error.message))
    }
});

module.exports = handleCheckSocket;