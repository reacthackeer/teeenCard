const ConnectedList = require('../models/ConnectedList');


const socketConnectedRouter = require('express').Router(); 

io.on('connection',(socket) => { 
    socket.on('connected',async(data)=>{
        
        const connectedModel = {
            socketId: socket.id, 
            ...data
        }   
        if(connectedModel && connectedModel.socketId && connectedModel.userId && connectedModel.roomId && connectedModel.inRoom){
            try {
                let result = await ConnectedList.destroy({
                    where: {userId: data.userId}
                });  
                if(result >= 0) { 
                    try {
                        let resultI = await ConnectedList.create(connectedModel);  
                        if(resultI && resultI?.id >= 1){
                            socket.emit('connectedFromServer');
                        }
                    } catch (error) {   
                        // error handle here
                    }
                }
            } catch (error) {    
                // error handle here
            }
            
            
        }
    })
})
module.exports = {
    socketConnectedRouter
}