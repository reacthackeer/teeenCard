const ConnectedList = require('../models/ConnectedList');


const socketDisconnectedRouter = require('express').Router(); 
io.on('connection',(socket)=>{
    socket.on('disconnect', async()=>{ 
        if(socket && socket.id){
            try {
                await ConnectedList.destroy({
                    where: {
                        socketId: socket.id
                    }
                }) 
            } catch (error) { 
                // error handle here
            }
        }
    })
})
module.exports = {
    socketDisconnectedRouter
}