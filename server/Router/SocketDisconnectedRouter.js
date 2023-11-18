const { PrismaClient } = require('@prisma/client');

const socketDisconnectedRouter = require('express').Router();
const prisma = new PrismaClient();
io.on('connection',(socket)=>{
    socket.on('disconnect', async()=>{ 
        if(socket && socket.id){
            try {
                await prisma.connectedlist.deleteMany({
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