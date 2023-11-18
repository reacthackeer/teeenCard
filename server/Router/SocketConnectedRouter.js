const { PrismaClient } = require('@prisma/client');

const socketConnectedRouter = require('express').Router();
const prisma = new PrismaClient();
io.on('connection',(socket) => { 
    socket.on('connected',async(data)=>{
        
        const connectedModel = {
            socketId: socket.id, 
            ...data
        }   
        if(connectedModel && connectedModel.socketId && connectedModel.userId && connectedModel.roomId && connectedModel.inRoom){
            try {
                let result = await prisma.connectedlist.deleteMany({
                    where: {userId: data.userId}
                });  
                if(result.count >= 0) { 
                    try {
                        let resultI = await prisma.connectedlist.create({
                            data: connectedModel
                        })  
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