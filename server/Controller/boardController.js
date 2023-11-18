const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('express-async-handler'); 
const { handleGetCardByPlayer, handleGetMyCardsByRandomly, cardUtils } = require('../utils/cardUtils');
const { uid } = require('uid');
const prisma = new PrismaClient();

const handleCreateNewBoard = asyncHandler(async(req, res, next)=>{
    let {name,  join,  board,  chaal,  blind,  increase,  compare,  type,  isSchedule,  startTime, balanceType, adminId, roomId, maxBlindHit , maxChaalHit , minBlindHit , minChaalHit , maxPlayer} = req.body;
    if(name && join && board && chaal && blind  && type && balanceType && adminId && roomId && maxPlayer && maxBlindHit && maxChaalHit && minBlindHit && minChaalHit){
        if((increase === true || increase === false) && (compare === true || compare === false) && (isSchedule === true || isSchedule === false)){
            try {
                let resultConnectedList = await prisma.inroom.findUnique({
                    where: {id: 1}
                })
                if(resultConnectedList && resultConnectedList?.id > 0 && resultConnectedList.userIdes.indexOf(adminId) === -1 ){
                    
                    try {  
                        let userInfo = await prisma.user.findUnique({
                            where: {userId: adminId}
                        })
                        if(userInfo && userInfo?.id){ 
                            if(Number(userInfo[`${balanceType}Balance`]) >= Number(join)){
                                let postData = req.body; 
                                try {
                                    let boardInfo = await prisma.board.create({
                                        data: { 
                                            rootBlind: Number(postData.blind),
                                            rootChaal: Number(postData.chaal),
                                            ...postData,
                                            accessIdes: [adminId],
                                            member: [adminId],
                                            player: [],
                                            playing: [],
                                            currentBalance: 0,
                                            totalBalance: 0,
                                            increase: `${postData.increase}`,
                                            compare: `${postData.compare}`,
                                            isSchedule: `${postData.isSchedule}`,
                                            currentCommission: 0,
                                            startTime: postData.isSchedule ? new Date(postData.startTime).toISOString() : new Date(),
                                            
                                        }
                                    })
                                    if(boardInfo && boardInfo.id){
                                        try {
                                            let updateUserConnectedRoom = await prisma.connectedlist.update({
                                                where: {userId: adminId},
                                                data: {
                                                    roomId: boardInfo.roomId,
                                                    inRoom: 'true'
                                                }
                                            })
                                            if(updateUserConnectedRoom && updateUserConnectedRoom?.id){
                                                
                                                try {
                                                    let newConnectedUser = await prisma.inroom.update({
                                                        where: {id: 1},
                                                        data: {
                                                            userIdes: [...resultConnectedList.userIdes, adminId],
                                                            roomWithId: [...resultConnectedList.roomWithId, {roomId: boardInfo.roomId, adminId}]
                                                        }
                                                    })
                                                    if(newConnectedUser && newConnectedUser?.id > 0 ){
                                                        
                                                        try {
                                                            let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                            if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                resultGetAllConnectedList.forEach((info)=>{
                                                                    io.sockets.in(info.socketId).emit('addNewRoom',{boardInfo, roomId})
                                                                });
                                                                res.json(boardInfo)
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
                                        next(new Error("Internal server error!"))
                                    }
                                } catch (error) { 
                                    next(new Error(error.message))
                                }
                            }else{
                                next(new Error('You do not have enough real balance'))
                            }
                        }else{
                            next(new Error(`Your account does't existed in our database!`))
                        }
                    } catch (error) {
                        next(new Error(error.message))
                    }
                }else{ 
                    next(new Error(`You'r already in a room line 5`))
                }
            } catch (error) {
                next(new Error(error.message))
            }
        }else{
            next(new Error('Invalid server request!'));
        }
    }else{
        next(new Error('Invalid server request!'));
    }
})
const handleGetAllBoard = asyncHandler(async(req, res, next)=>{
    const page = Number(req.query?.page) || 1; 
    let limit = 20
    let skip = (limit*page) - limit;  
    
    try {
        let result = await prisma.board.findMany({
            skip,
            take: limit,
        });
        
        if(result && result?.length > 0){
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
                let secondResult = await prisma.board.count({});
                if(secondResult && secondResult > 0){  
                    let boardIdes = newBoardResult.map((info)=> info.roomId)
                    try {
                        let connectedWithRoomResult = await prisma.inroom.findUnique({
                            where: {id: 1}
                        })
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
const handleDeleteSingleRoom = asyncHandler(async(req, res, next)=>{
    let {id, userId} = req.body;
    if(id && userId){
        try {
            let getTargetedBoard = await prisma.board.findUnique({where:{id}});
                if(getTargetedBoard && getTargetedBoard?.accessIdes?.length === 1){
                    try {
                        let deleteResult = await prisma.board.delete({where: {id}});
                        if(deleteResult && deleteResult?.id > 0){
                            try {
                                let updateConnectedList = await prisma.connectedlist.update({where: {userId},data:{roomId: 'false', inRoom: 'false', interested: 'false'}});
                                if(updateConnectedList && updateConnectedList?.id > 0){
                                    try {
                                        let updatedInRoomResult = await prisma.inroom.findUnique({where: {id: 1}});
                                        if(updatedInRoomResult && updatedInRoomResult?.id === 1){
                                            let newUserIdes = [...updatedInRoomResult.userIdes].filter((info)=> info !== userId);
                                            let newRoomWithId = [...updatedInRoomResult.roomWithId].filter((info)=> info.adminId !== userId);
                                            try {
                                                let inRoomUpdateResult = await prisma.inroom.update({where: {id: 1}, data: {userIdes: newUserIdes, roomWithId: newRoomWithId}});
                                                if(inRoomUpdateResult && inRoomUpdateResult?.id > 0){
                                                    try {
                                                        let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                        if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                            resultGetAllConnectedList.forEach((info)=>{
                                                                io.sockets.in(info.socketId).emit('removeSingleRoom',{roomId: deleteResult.roomId, userId: userId})
                                                            });
                                                            res.json(deleteResult)
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
})
const handleJoinInRoom = asyncHandler(async(req, res, next)=>{
    let {id, userId, roomId} = req.body;
    if(id && userId && roomId){
        try {
            let resultConnectedList = await prisma.inroom.findUnique({
                where: {id: 1}
            })
            if(resultConnectedList && resultConnectedList?.id > 0 && resultConnectedList.userIdes.indexOf(userId) === -1 ){
                try {  
                    let userInfo = await prisma.user.findUnique({
                        where: {userId}
                    })
                    if(userInfo && userInfo?.id){ 
                        try {
                            let getMyRoomResult = await prisma.board.findUnique({where:{id}});
                            if(getMyRoomResult && getMyRoomResult?.id > 0 && Number(userInfo[`${getMyRoomResult.balanceType.toLowerCase()}Balance`]) >= Number(getMyRoomResult.join)){
                                let newBoardInfo = {...getMyRoomResult};
                                    newBoardInfo.accessIdes = [...newBoardInfo.accessIdes, userId];
                                    newBoardInfo.member = [...newBoardInfo.member, userId];
                                    try {
                                        let boardUpdateResult = await prisma.board.update({
                                            where: {id},
                                            data: {
                                                accessIdes: newBoardInfo.accessIdes,
                                                member: newBoardInfo.member
                                            }
                                        })
                                        if(boardUpdateResult && boardUpdateResult?.id){ 
                                                let newRoomInfo = {...boardUpdateResult};
                                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                        delete playingInfo.card;
                                                        return playingInfo;
                                                    }) 
                                            try {
                                                let updateUserConnectedRoom = await prisma.connectedlist.update({
                                                    where: {userId},
                                                    data: {
                                                        roomId,
                                                        inRoom: 'true'
                                                    }
                                                })
                                                if(updateUserConnectedRoom && updateUserConnectedRoom?.id){
                                                    
                                                    try {
                                                        let newConnectedUser = await prisma.inroom.update({
                                                            where: {id: 1},
                                                            data: {
                                                                userIdes: [...resultConnectedList.userIdes, userId],
                                                                roomWithId: [...resultConnectedList.roomWithId, {roomId, adminId: userId}]
                                                            }
                                                        })
                                                        if(newConnectedUser && newConnectedUser?.id > 0 ){
                                                            
                                                            try {
                                                                let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                                if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                    resultGetAllConnectedList.forEach((info)=>{
                                                                        io.sockets.in(info.socketId).emit('addNewMemberInRoom',{userId, roomId})
                                                                    });
                                                                    res.json(newRoomInfo)
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
                                next(new Error('Balance low!'))
                            }
                        } catch (error) {
                            next(new Error(error.message))
                        }
                    }else{
                        next(new Error(`Your account does't existed in our database!`))
                    }
                } catch (error) {
                    next(new Error(error.message))
                }
            }else{ 
                next(new Error(`You'r already in a room`))
            }
        } catch (error) {
            next(new Error(error.message))
        }
    }else{
        next(new Error('Invalid server request!'))
    }
})
const handleJoinInRoomPrivatePlayer = asyncHandler(async(req, res, next)=>{
    let {id, userId, roomId} = req.body;
    if(id && userId && roomId){
        try {
            let resultConnectedList = await prisma.inroom.findUnique({
                where: {id: 1}
            })
            if(resultConnectedList && resultConnectedList?.id > 0 && resultConnectedList.userIdes.indexOf(userId) === -1 ){
                try {  
                    let userInfo = await prisma.user.findUnique({
                        where: {userId}
                    })
                    if(userInfo && userInfo?.id){ 
                        try {
                            let getMyRoomResult = await prisma.board.findUnique({where:{id}});
                            if(getMyRoomResult && getMyRoomResult?.id > 0 && Number(userInfo[`${getMyRoomResult.balanceType.toLowerCase()}Balance`]) >= Number(getMyRoomResult.join)){
                                if(userInfo.invitation === 'Enable'){
                                    let newBoardInfo = {...getMyRoomResult};
                                    newBoardInfo.accessIdes = [...newBoardInfo.accessIdes, userId];
                                    newBoardInfo.member = [...newBoardInfo.member, userId];
                                    try {
                                        let boardUpdateResult = await prisma.board.update({
                                            where: {id},
                                            data: {
                                                accessIdes: newBoardInfo.accessIdes,
                                                member: newBoardInfo.member
                                            }
                                        })
                                        if(boardUpdateResult && boardUpdateResult?.id){ 
                                                let newRoomInfo = {...boardUpdateResult};
                                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                        delete playingInfo.card;
                                                        return playingInfo;
                                                    }) 
                                            try {
                                                let updateUserConnectedRoom = await prisma.connectedlist.update({
                                                    where: {userId},
                                                    data: {
                                                        roomId,
                                                        inRoom: 'true'
                                                    }
                                                })
                                                if(updateUserConnectedRoom && updateUserConnectedRoom?.id){
                                                    
                                                    try {
                                                        let newConnectedUser = await prisma.inroom.update({
                                                            where: {id: 1},
                                                            data: {
                                                                userIdes: [...resultConnectedList.userIdes, userId],
                                                                roomWithId: [...resultConnectedList.roomWithId, {roomId, adminId: userId}]
                                                            }
                                                        })
                                                        if(newConnectedUser && newConnectedUser?.id > 0 ){
                                                            
                                                            try {
                                                                let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                                if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                    resultGetAllConnectedList.forEach((info)=>{
                                                                        io.sockets.in(info.socketId).emit('addNewMemberInRoom',{userId, roomId})
                                                                    });
                                                                    res.json(newRoomInfo)
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
                                    next(new Error('Player invitation system is blocked!'))
                                }
                            }else{
                                next(new Error('Balance low!'))
                            }
                        } catch (error) {
                            next(new Error(error.message))
                        }
                    }else{
                        next(new Error(`Your account does't existed in our database!`))
                    }
                } catch (error) {
                    next(new Error(error.message))
                }
            }else{ 
                next(new Error(`You'r already in a room`))
            }
        } catch (error) {
            next(new Error(error.message))
        }
    }else{
        next(new Error('Invalid server request!'))
    }
})
const handleEnterPlayerInRoom = asyncHandler(async(req, res, next)=>{
    let {id, userId, roomId} = req.body;
    if(id && userId && roomId){
        try {
            let resultConnectedList = await prisma.inroom.findUnique({
                where: {id: 1}
            })
            if(resultConnectedList && resultConnectedList?.id > 0 && resultConnectedList.userIdes.indexOf(userId) !== -1 ){
                try {  
                    let userInfo = await prisma.user.findUnique({
                        where: {userId}
                    })
                    let newUserInfo = { 
                        name: userInfo.name,
                        email: userInfo.email,
                        phone: userInfo.phone,
                        userId: userInfo.userId,
                        referralCode: userInfo.referralCode,
                        id: userInfo.id
                    }
                    if(userInfo && userInfo?.id && userInfo.isDisabled === 'false' && userInfo.isJail === 'false'){ 
                        try {
                            let getMyRoomResult = await prisma.board.findUnique({where:{id}});
                            
                            let myPosition = getMyRoomResult?.player?.filter((info)=> info?.userId === userId);
                            if(getMyRoomResult && getMyRoomResult?.id > 0 && myPosition.length === 0){
                                let newBoardInfo = {...getMyRoomResult}; 
                                    newBoardInfo.player = [...newBoardInfo.player, {...newUserInfo}]
                                    let newRoomInfo = {...newBoardInfo};
                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                        delete playingInfo.card;
                                        return playingInfo;
                                    }) 
                                    try {
                                        let boardUpdateResult = await prisma.board.update({
                                            where: {id},
                                            data: { 
                                                player: newBoardInfo.player
                                            }
                                        })
                                        if(boardUpdateResult && boardUpdateResult?.id){
                                            try {
                                                let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                    resultGetAllConnectedList.forEach((info)=>{
                                                        io.sockets.in(info.socketId).emit('addNewPlayerInRoom',{userId, roomId, userInfo:newUserInfo})
                                                    });
                                                    res.json(newRoomInfo)
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
                        next(new Error(`Your account does't existed in our database!`))
                    }
                } catch (error) {
                    next(new Error(error.message))
                }
            }else{ 
                next(new Error(`Invalid server request!`))
            }
        } catch (error) {
            next(new Error(error.message))
        }
    }else{
        next(new Error('Invalid server request!'))
    }
}) 
const handleLeavePlayerInRoom = asyncHandler(async(req, res, next)=>{
    let {id, userId, roomId} = req.body;
    if(id && userId && roomId){
        try {
            let resultConnectedList = await prisma.inroom.findUnique({
                where: {id: 1}
            })
            if(resultConnectedList && resultConnectedList?.id > 0 && resultConnectedList.userIdes.indexOf(userId) !== -1 ){
                try {
                    let getMyRoomResult = await prisma.board.findUnique({where:{id}});
                    let myPlayerPosition = getMyRoomResult?.player?.filter((info)=> info?.userId === userId);
                    if(getMyRoomResult && getMyRoomResult?.id > 0 && myPlayerPosition?.length === 1){
                        let newBoardInfo = {...getMyRoomResult};  
                            newBoardInfo.player = [...newBoardInfo.player].filter((info)=> info.userId !== userId); 
                            
                            try {
                                let boardUpdateResult = await prisma.board.update({
                                    where: {id},
                                    data: { 
                                        player: newBoardInfo.player, 
                                    }
                                })
                                if(boardUpdateResult && boardUpdateResult?.id){
                                    let newRoomInfo = {...boardUpdateResult};
                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                        delete playingInfo.card;
                                        return playingInfo;
                                    }) 
                                    try {
                                        let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                        if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                            resultGetAllConnectedList.forEach((info)=>{
                                                io.sockets.in(info.socketId).emit('leaveSinglePlayerInRoom',{userId, roomId})
                                            });
                                            res.json(newRoomInfo)
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
const handleLeaveInRoomInRoom = asyncHandler(async(req, res, next)=>{
    
    let {roomId, userId, id} = req.body;
    if(roomId && userId && id){ 
        try {
            let myRoomResult = await prisma.board.findUnique({where: {id, roomId}});
            if(myRoomResult && myRoomResult.id > 0 && myRoomResult.accessIdes.indexOf(userId) !== -1){
  
                if(myRoomResult.isStart === 'true'){
                    if(myRoomResult.currentId === userId){
                        let newPlaying = [...myRoomResult.playing];
                        let newPlayer = [...myRoomResult.player];
                            newPlayer = newPlayer.filter((info)=> info.userId !== userId);
                        let newMember = [...myRoomResult.member];
                            newMember = newMember.filter((info)=> info !== userId);
                        let newAccessIdes = [...myRoomResult.accessIdes];
                            newAccessIdes = newAccessIdes.filter((info)=> info !== userId);
                            newPlaying = newPlaying.map((info)=>{
                                if(info.userId === userId){
                                    let newInfo = {...info};
                                        newInfo.packed = true;
                                        newInfo.packedReasonMess.push({
                                            bangla: 'তুমি নিজেই খেলা থেকে বের হয়েছো ',
                                            english: `You're out of the game yourself`
                                        });
                                        newInfo.isTurn = false;
                                        newInfo.timeUp = new Date()
                                        return newInfo;
                                }else{
                                    return info;
                                }
                            }) 
                            let resetPlaying = newPlaying.filter((info)=> info.packed === false); 
                            let myRoomNewRound = myRoomResult.round;
                            if(resetPlaying.length > 1){
                                let currentPlayingIndex = resetPlaying.findIndex((info)=> info.userId === myRoomResult.nextId);
                                let currentPlaying = resetPlaying[currentPlayingIndex];
                                let nextPlaying = resetPlaying[currentPlayingIndex+1] ? resetPlaying[currentPlayingIndex+1] : resetPlaying[0]
                                if(currentPlayingIndex === 0){
                                    myRoomNewRound = myRoomNewRound + 1
                                }
                                newPlaying = newPlaying.map((info)=>{
                                    if(info.userId === currentPlaying.userId){
                                        let newInfo = {...info};
                                            newInfo.isTurn = true;
                                            newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                            if(newInfo.seen === false && myRoomResult.maxBlindHit === newInfo.blindRound){
                                                newInfo.seen = true
                                            }
                                            return newInfo
                                    }else{
                                        return info;
                                    }
                                })
                                try {
                                    let boardUpdateResult = await prisma.board.update({
                                        where: {roomId, id},
                                        data: {
                                            playing: newPlaying,
                                            player: newPlayer,
                                            accessIdes: newAccessIdes,
                                            member: newMember,
                                            currentId: currentPlaying.userId,
                                            nextId: nextPlaying.userId,
                                            round: myRoomNewRound
                                        }
                                    });
                                    if(boardUpdateResult && boardUpdateResult.id > 0){
                                        try {
                                            let updateUserConnectedRoom = await prisma.connectedlist.update({
                                                where: {userId},
                                                data: {
                                                    roomId: 'false',
                                                    inRoom: 'false'
                                                }
                                            })
                                            if(updateUserConnectedRoom && updateUserConnectedRoom?.id){
                                                try {
                                                    let resultConnectedList = await prisma.inroom.findUnique({where:{id: 1}});
                                                    if(resultConnectedList && resultConnectedList.id > 0){
                                                        try {
                                                            let newConnectedUser = await prisma.inroom.update({
                                                                where: {id: 1},
                                                                data: {
                                                                    userIdes: [...resultConnectedList.userIdes].filter((info)=> info !== userId),
                                                                    roomWithId: [...resultConnectedList.roomWithId].filter((info)=> info.adminId !== userId)
                                                                }
                                                            })
                                                            if(newConnectedUser && newConnectedUser?.id > 0 ){
                                                                try {
                                                                    let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                                    if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                        let newRoomInfo = {...boardUpdateResult};
                                                                        newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                            delete playingInfo.card;
                                                                            return playingInfo;
                                                                        })
                                                                        resultGetAllConnectedList.forEach((info)=>{
                                                                            io.sockets.in(info.socketId).emit('packUpSingleUser',{roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo, connectedInfo: {roomWithId: newConnectedUser.roomWithId, userIdes: newConnectedUser.userIdes}})
                                                                        });
                                                                        res.json({roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo, connectedInfo: {roomWithId: newConnectedUser.roomWithId, userIdes: newConnectedUser.userIdes}}); 
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
                                } catch (error) { 
                                    next(new Error(error.message))
                                }
                            }else{
                                let winnerPlaying = resetPlaying[0];
                                newPlaying = newPlaying.map((info)=>{
                                    if(info.userId === winnerPlaying.userId){
                                        let newInfo = {...info};
                                            newInfo.isTurn = false;
                                            newInfo.packed = true; 
                                            newInfo.packedReasonMess.push({
                                                bengali: `আপনি খেলার প্রধান বিজয়ী `,
                                                english: `You are the main winner of the game`
                                            });
                                            return newInfo;
                                    }else{
                                        return info;
                                    }
                                })
                                try {
                                    let userBalanceUpdateResult = await prisma.user.update({
                                        where:{userId: winnerPlaying.userId},
                                        data: {
                                            [`${myRoomResult.balanceType.toLowerCase()}Balance`]: {increment: myRoomResult.currentBalance}
                                        }
                                    })
                                    if(userBalanceUpdateResult && userBalanceUpdateResult?.id > 0){
                                            let recentTxrId = uid(8); 
                                            let boardTransaction = {
                                                typeName: 'GAME WIN',
                                                isIn: 'IN',
                                                amount: myRoomResult.currentBalance,
                                                txrId: recentTxrId,
                                                userId: winnerPlaying.userId,
                                                sourceId: winnerPlaying.referralCode,
                                                balanceType: myRoomResult.balanceType.toUpperCase()
                                            }
                                            try {
                                                let transactionCreateResult = await prisma.transaction.create({
                                                    data: boardTransaction
                                                })
                                                if(transactionCreateResult && transactionCreateResult?.id > 0){
                                                    let myRoomUpdateResult = await prisma.board.update({
                                                        where:{roomId, id},
                                                        data:{
                                                            playing: [],
                                                            totalBalance: 0,
                                                            currentBalance: 0,
                                                            currentCommission: 0,
                                                            round: 0,
                                                            currentId: 'false',
                                                            nextId: 'false',
                                                            previousId: 'false',
                                                            isStart: 'false',
                                                            blind: myRoomResult.rootBlind,
                                                            chaal: myRoomResult.rootChaal,
                                                            rootBlind: 0,
                                                            rootChaal: 0,
                                                            cardViewTill: new Date(new Date().setMilliseconds(40000)),
                                                        }
                                                    });
                                                    if(myRoomUpdateResult && myRoomUpdateResult.id > 0){
                                                        try {
                                                            let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                            if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                resultGetAllConnectedList.forEach((info)=>{
                                                                    io.sockets.in(info.socketId).emit('boardFinish',{roomId: myRoomUpdateResult.roomId, roomInfo: myRoomUpdateResult, playingInfo: newPlaying, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance)})
                                                                });
                                                                res.json({roomId: myRoomUpdateResult.roomId, roomInfo: myRoomUpdateResult, playingInfo: newPlaying, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance)});
                                                            }else{
                                                                next(new Error('Internal server error!'))
                                                            }
                                                        } catch (error) {  
                                                            next(new Error(error.message))
                                                        }
                                                    }else{
                                                        next(new Error('Internal server error while updating my board'))
                                                    }
                                                }else{
                                                    next( new Error('Internal server error while create transaction'))
                                                }
                                            } catch (error) { 
                                                next(new Error(error.message))
                                            }
                                    }else{
                                        next(new Error('Internal server error while user balance update'))
                                    }
                                } catch (error) { 
                                    next(new Error(error.message))
                                }
                            } 
                    }else{
                        let newPlaying = [...myRoomResult.playing];
                        let newPlayer = [...myRoomResult.player];
                        let newMember = [...myRoomResult.member];
                        let newAccessIdes = [...myRoomResult.accessIdes];
                            newMember = newMember.filter((info)=> info !== userId);
                            newAccessIdes = newAccessIdes.filter((info)=> info !== userId);
                            newPlayer = newPlayer.filter((info)=> info.userId !== userId); 
                            newPlaying = newPlaying.map((info)=>{
                                if(info.userId === userId){
                                    let newInfo = {...info};
                                        newInfo.packed = true;
                                        newInfo.packedReasonMess.push({
                                            bengali: 'তুমি নিজেই খেলা থেকে বের হয়েছো ',
                                            english: `You're out of the game yourself`
                                        });
                                        newInfo.isTurn = false;
                                        newInfo.timeUp = new Date()
                                        return newInfo;
                                }else{
                                    return info;
                                }
                            }) 
                            let resetPlaying = newPlaying.filter((info)=> info.packed === false); 
                            let myRoomNewRound = myRoomResult.round;
                            if(resetPlaying.length > 1){
                                let currentPlayingIndex = resetPlaying.findIndex((info)=> info.userId === myRoomResult.currentId);
                                let currentPlaying = resetPlaying[currentPlayingIndex];
                                let nextPlaying = resetPlaying[currentPlayingIndex+1] ? resetPlaying[currentPlayingIndex+1] : resetPlaying[0]
                                newPlaying = newPlaying.map((info)=>{
                                    if(info.userId === currentPlaying.userId){
                                        let newInfo = {...info};
                                            newInfo.isTurn = true;
                                            newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                            if(newInfo.seen === false && myRoomResult.maxBlindHit === newInfo.blindRound){
                                                newInfo.seen = true
                                            }
                                            return newInfo
                                    }else{
                                        return info;
                                    }
                                })
                                try {
                                    let boardUpdateResult = await prisma.board.update({
                                        where: {roomId, id},
                                        data: {
                                            playing: newPlaying,
                                            player: newPlayer,
                                            accessIdes: newAccessIdes,
                                            member: newMember,
                                            currentId: currentPlaying.userId,
                                            nextId: nextPlaying.userId, 
                                        }
                                    });
                                    if(boardUpdateResult && boardUpdateResult.id > 0){
                                        try {
                                            let updateUserConnectedRoom = await prisma.connectedlist.update({
                                                where: {userId},
                                                data: {
                                                    roomId: 'false',
                                                    inRoom: 'false'
                                                }
                                            })
                                            if(updateUserConnectedRoom && updateUserConnectedRoom?.id){
                                                try {
                                                    let resultConnectedList = await prisma.inroom.findUnique({where:{id: 1}});
                                                    if(resultConnectedList && resultConnectedList.id > 0){
                                                        try {
                                                            let newConnectedUser = await prisma.inroom.update({
                                                                where: {id: 1},
                                                                data: {
                                                                    userIdes: [...resultConnectedList.userIdes].filter((info)=> info !== userId),
                                                                    roomWithId: [...resultConnectedList.roomWithId].filter((info)=> info.adminId !== userId)
                                                                }
                                                            })
                                                            if(newConnectedUser && newConnectedUser?.id > 0 ){
                                                                try {
                                                                    let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                                    if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                        let newRoomInfo = {...boardUpdateResult};
                                                                        newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                            delete playingInfo.card;
                                                                            return playingInfo;
                                                                        })
                                                                        resultGetAllConnectedList.forEach((info)=>{
                                                                            io.sockets.in(info.socketId).emit('packUpSingleUser',{roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo, connectedInfo: {roomWithId: newConnectedUser.roomWithId, userIdes: newConnectedUser.userIdes}})
                                                                        });
                                                                        res.json({roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo, connectedInfo: {roomWithId: newConnectedUser.roomWithId, userIdes: newConnectedUser.userIdes}}); 
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
                                } catch (error) { 
                                    next(new Error(error.message))
                                }
                            }else{
                                let winnerPlaying = resetPlaying[0];
                                newPlaying = newPlaying.map((info)=>{
                                    if(info.userId === winnerPlaying.userId){
                                        let newInfo = {...info};
                                            newInfo.isTurn = false;
                                            newInfo.packed = true; 
                                            newInfo.packedReasonMess.push({
                                                bengali: `আপনি খেলার প্রধান বিজয়ী `,
                                                english: `You are the main winner of the game`
                                            });
                                            return newInfo;
                                    }else{
                                        return info;
                                    }
                                })
                                try {
                                    let userBalanceUpdateResult = await prisma.user.update({
                                        where:{userId: winnerPlaying.userId},
                                        data: {
                                            [`${myRoomResult.balanceType.toLowerCase()}Balance`]: {increment: myRoomResult.currentBalance}
                                        }
                                    })
                                    if(userBalanceUpdateResult && userBalanceUpdateResult?.id > 0){
                                            let recentTxrId = uid(8); 
                                            let boardTransaction = {
                                                typeName: 'GAME WIN',
                                                isIn: 'IN',
                                                amount: myRoomResult.currentBalance,
                                                txrId: recentTxrId,
                                                userId: winnerPlaying.userId,
                                                sourceId: winnerPlaying.referralCode,
                                                balanceType: myRoomResult.balanceType.toUpperCase()
                                            }
                                            try {
                                                let transactionCreateResult = await prisma.transaction.create({
                                                    data: boardTransaction
                                                })
                                                if(transactionCreateResult && transactionCreateResult?.id > 0){
                                                    let myRoomUpdateResult = await prisma.board.update({
                                                        where:{roomId, id},
                                                        data:{
                                                            playing: [],
                                                            totalBalance: 0,
                                                            currentBalance: 0,
                                                            currentCommission: 0,
                                                            round: 0,
                                                            currentId: 'false',
                                                            nextId: 'false',
                                                            previousId: 'false',
                                                            isStart: 'false',
                                                            blind: myRoomResult.rootBlind,
                                                            chaal: myRoomResult.rootChaal,
                                                            rootBlind: 0,
                                                            rootChaal: 0,
                                                            cardViewTill: new Date(new Date().setMilliseconds(40000)),
                                                        }
                                                    });
                                                    if(myRoomUpdateResult && myRoomUpdateResult.id > 0){
                                                        try {
                                                            let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                            if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                resultGetAllConnectedList.forEach((info)=>{
                                                                    io.sockets.in(info.socketId).emit('boardFinish',{roomId: myRoomUpdateResult.roomId, roomInfo: myRoomUpdateResult, playingInfo: newPlaying, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance)})
                                                                });
                                                                res.json({roomId: myRoomUpdateResult.roomId, roomInfo: myRoomUpdateResult, playingInfo: newPlaying, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance)});
                                                            }else{
                                                                next(new Error('Internal server error!'))
                                                            }
                                                        } catch (error) {  
                                                            next(new Error(error.message))
                                                        }
                                                    }else{
                                                        next(new Error('Internal server error while updating my board'))
                                                    }
                                                }else{
                                                    next( new Error('Internal server error while create transaction'))
                                                }
                                            } catch (error) { 
                                                next(new Error(error.message))
                                            }
                                    }else{
                                        next(new Error('Internal server error while user balance update'))
                                    }
                                } catch (error) { 
                                    next(new Error(error.message))
                                }
                            } 
                    }
                }else{
                    let newPlaying = [...myRoomResult.playing];
                    let newPlayer = [...myRoomResult.player];
                    let newMember = [...myRoomResult.member];
                    let newAccessIdes = [...myRoomResult.accessIdes];
                        newMember = newMember.filter((info)=> info !== userId);
                        newAccessIdes = newAccessIdes.filter((info)=> info !== userId);
                        newPlayer = newPlayer.filter((info)=> info.userId !== userId);
                        newPlaying = newPlaying.filter((info)=> info.userId !== userId);
                        try {
                            let boardUpdateResult = await prisma.board.update({
                                where: {roomId, id},
                                data: {
                                    playing: newPlaying,
                                    player: newPlayer,
                                    accessIdes: newAccessIdes,
                                    member: newMember,   
                                }
                            });
                            if(boardUpdateResult && boardUpdateResult.id > 0){
                                try {
                                    let updateUserConnectedRoom = await prisma.connectedlist.update({
                                        where: {userId},
                                        data: {
                                            roomId: 'false',
                                            inRoom: 'false'
                                        }
                                    })
                                    if(updateUserConnectedRoom && updateUserConnectedRoom?.id){
                                        try {
                                            let resultConnectedList = await prisma.inroom.findUnique({where:{id: 1}});
                                            if(resultConnectedList && resultConnectedList.id > 0){
                                                try {
                                                    let newConnectedUser = await prisma.inroom.update({
                                                        where: {id: 1},
                                                        data: {
                                                            userIdes: [...resultConnectedList.userIdes].filter((info)=> info !== userId),
                                                            roomWithId: [...resultConnectedList.roomWithId].filter((info)=> info.adminId !== userId)
                                                        }
                                                    })
                                                    if(newConnectedUser && newConnectedUser?.id > 0 ){
                                                        try {
                                                            let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                            if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                let newRoomInfo = {...boardUpdateResult};
                                                                newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                    delete playingInfo.card;
                                                                    return playingInfo;
                                                                })
                                                                resultGetAllConnectedList.forEach((info)=>{
                                                                    io.sockets.in(info.socketId).emit('packUpSingleUser',{roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo, connectedInfo: {roomWithId: newConnectedUser.roomWithId, userIdes: newConnectedUser.userIdes}})
                                                                });
                                                                res.json({roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo, connectedInfo: {roomWithId: newConnectedUser.roomWithId, userIdes: newConnectedUser.userIdes}}); 
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
                        } catch (error) { 
                            next(new Error(error.message))
                        }
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
})
const handleGetMyRoom = asyncHandler(async(req, res, next)=>{
    let {roomId, userId} = req.params;
    
    if(roomId && userId){ 
        try {
            let result = await prisma.board.findUnique({where:{id: Number(roomId)}});
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
})
const handleCheckSocket = asyncHandler(async(req, res, next)=>{
    try {
        let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
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
const handleStartRoom = asyncHandler(async(req, res, next)=>{
    let {roomId, userId, id} = req.body;
    if(roomId && userId && id){
        try {
            let myRoomResult = await prisma.board.findUnique({where: {id: id}});
            let myPlayerPosition = myRoomResult?.player?.filter((info)=> info?.userId === userId);
            let nowTime = new Date().getTime();
            let prevDate = new Date(myRoomResult?.cardViewTill).getTime();
            if(
                myRoomResult && 
                myRoomResult.id > 0 && 
                myRoomResult.accessIdes.indexOf(userId) !== -1 && 
                myPlayerPosition.length === 1 && 
                myRoomResult.isStart === 'false' && 
                myRoomResult.playing.length === 0 
            ){
                if(prevDate <= nowTime){
                    let playerIdes = myRoomResult.player.map((info)=> info.userId);
                    try {
                        let playerUserResult = await prisma.user.findMany({
                            where: {
                                userId: {in: playerIdes}
                            }
                        })
                        let NBT = myRoomResult.balanceType.toLowerCase(); // new balance type
                        if(playerUserResult && playerUserResult?.length > 1){

                            let getRandomUser = handleGetMyCardsByRandomly(playerUserResult);
                            let pureRandomUser = [];
                            getRandomUser.forEach((info)=>{ 
                                if(Number(info[`${NBT}Balance`]) >= Number(myRoomResult.board)){
                                    pureRandomUser.push(info) 
                                }
                            }) 

                            let cards = handleGetCardByPlayer(pureRandomUser.length);
                            let getCardsRandomly = handleGetMyCardsByRandomly(cards);
                            pureRandomUser = pureRandomUser.slice(0, myRoomResult.maxPlayer);
                            if(pureRandomUser.length > 1 && pureRandomUser.length < 18){
                                let AllUserWithCards = [];
                                pureRandomUser.forEach((userInfo, index)=>{
                                    let newUserInfo = {
                                        index,
                                        src: userInfo.src,
                                        name: userInfo.name,
                                        email: userInfo.email,
                                        phone: userInfo.phone,
                                        userId: userInfo.userId,
                                        referralCode: userInfo.referralCode,
                                        id: userInfo.id,
                                        card: getCardsRandomly.splice(Math.floor(Math.random()*getCardsRandomly.length), 1)[0],
                                        seen: false,
                                        packed: false,
                                        packedReasonMess: [],
                                        seenRound: 0,
                                        blindRound: 0,
                                        side: false,  
                                        isTurn: false,
                                        timeUp: new Date()
                                    }
                                    AllUserWithCards.push(newUserInfo)
                                })
                                try {   
                                    AllUserWithCards = AllUserWithCards.slice(0,13)
                                    let totalBalance = Number(myRoomResult.board) * AllUserWithCards.length;
                                    let currentCommission = (totalBalance / 100) * Number(process.env[`${NBT}BoardFee`]);
                                    let currentBalance = (totalBalance / 100) * (100 - Number(process.env[`${NBT}BoardFee`]));
                                    let totalAppCommission = currentCommission / 2;
                                    let totalPartnerCommission = currentCommission / 2;
                                    try {
                                        
                                        let rootAssetUpdateResult = await prisma.rootasset.update({
                                            where:{id: 1},
                                            data:{   
                                                [`${NBT}TotalCommission`]: {increment: currentCommission},
                                                [`${NBT}TotalAppCommission`]: {increment: totalAppCommission},
                                                [`${NBT}TotalPartnerCommission`]: {increment: totalPartnerCommission}
                                            }
                                        })
                                        if(rootAssetUpdateResult && rootAssetUpdateResult?.id > 0){
                                            AllUserWithCards[0].isTurn = true;
                                            AllUserWithCards[0].timeUp = new Date(new Date().setMilliseconds(40000));
                                            let roomUpdateResult = await prisma.board.update({
                                                where: {id},
                                                data: {
                                                    playing: AllUserWithCards,
                                                    totalBalance: {increment: totalBalance},
                                                    currentBalance: {increment: currentBalance},
                                                    currentCommission: {increment: currentCommission},
                                                    currentId: AllUserWithCards[0].userId,
                                                    rootBlind: myRoomResult.blind,
                                                    rootChaal: myRoomResult.chaal,
                                                    nextId: AllUserWithCards[1].userId,
                                                    isStart: 'true'
                                                }
                                            })
                                            if(roomUpdateResult && roomUpdateResult?.id > 0){
                                                let playingUserIdes = AllUserWithCards.map((info)=> info.userId);
                                                let allUserBalanceUpdateResult = await prisma.user.updateMany({
                                                    where: {userId: {in: playingUserIdes}},
                                                    data: {
                                                        [`${NBT}Balance`]: {decrement: Number(myRoomResult.board)}
                                                    }
                                                })
    
                                                if(allUserBalanceUpdateResult && allUserBalanceUpdateResult?.count > 0){
                                                    let allUserTransaction = [];
                                                    AllUserWithCards.forEach((info)=>{
                                                        let recentTxrId = uid(8); 
                                                        let boardTransaction = {
                                                            typeName: 'BOARD FEE',
                                                            isIn: 'OUT',
                                                            amount: (Number(myRoomResult.board) / 100) * (100 - Number(process.env[`${NBT}BoardFee`])),
                                                            txrId: recentTxrId,
                                                            userId: info.userId,
                                                            sourceId: info.referralCode,
                                                            balanceType:  NBT.toUpperCase()
                                                        }
                                                        let boardFeeCommission = {
                                                            typeName: 'BOARD COMMISSION',
                                                            isIn: 'OUT',
                                                            amount: (Number(myRoomResult.board) / 100) * Number(process.env[`${NBT}BoardFee`]),
                                                            txrId: recentTxrId,
                                                            userId: info.userId,
                                                            sourceId: info.referralCode,
                                                            balanceType:  NBT.toUpperCase()
                                                        }
                                                        let boardFeeAppCommission = {
                                                            typeName: 'BOARD COMMISSION',
                                                            isIn: 'IN',
                                                            amount: (Number(myRoomResult.board) / 100) * (Number(process.env[`${NBT}BoardFee`]) / 2),
                                                            txrId: recentTxrId,
                                                            userId: '999999999999',
                                                            sourceId: info.userId,
                                                            balanceType:  NBT.toUpperCase()
                                                        }
                                                        let boardFeePartnerCommission = {
                                                            typeName: 'BOARD COMMISSION',
                                                            isIn: 'IN',
                                                            amount: (Number(myRoomResult.board) / 100) * (Number(process.env[`${NBT}BoardFee`]) / 2),
                                                            txrId: recentTxrId,
                                                            userId: info.referralCode,
                                                            sourceId: info.userId,
                                                            balanceType:  NBT.toUpperCase()
                                                        }
                                                        if(boardTransaction.amount > 0){
                                                            allUserTransaction.push(boardTransaction);
                                                        }
                                                        if(boardFeeCommission.amount > 0){
                                                            allUserTransaction.push(boardFeeCommission)
                                                        }
                                                        if(boardFeeAppCommission.amount > 0){
                                                            allUserTransaction.push(boardFeeAppCommission)
                                                        }   
                                                        if(boardFeePartnerCommission.amount > 0){
                                                            allUserTransaction.push(boardFeePartnerCommission)
                                                        }
                                                    })
                                                    try {
                                                        let result = await prisma.transaction.createMany({
                                                            data: allUserTransaction
                                                        })
                                                        if(result && result.count > 0){
                                                            try {
                                                                let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                                if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                    let newRoomInfo = {...roomUpdateResult};
                                                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                        delete playingInfo.card;
                                                                        return playingInfo;
                                                                    })
                                                                    resultGetAllConnectedList.forEach((info)=>{
                                                                        io.sockets.in(info.socketId).emit('startMyRoom',{roomId: roomUpdateResult.roomId, roomInfo: newRoomInfo})
                                                                    });
                                                                    res.json({roomId: roomUpdateResult.roomId, roomInfo: newRoomInfo});
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
                                                    next(new Error("Internal server error!"))
                                                }
                                            }else{
                                                next(new Error('Internal server error!'))
                                            }
                                        }else{
                                            next(new Error('Internal server error!'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    } 
                                } catch (error) {
                                    next(new Error(error.message))
                                } 
                            }else{
                                next(new Error('Minimum 2 player need to start this game!'))
                            }
                        }else{
                            next(new Error('Minimum 2 player need to start this game!'))
                        }
                    } catch (error) {
                        next(new Error(error.message))
                    } 
                }else{
                    next(new Error(`Please wait till ${new Date(myRoomResult.cardViewTill).toString().split(' ')[4]}`));
                }
            }else{
                next(new Error('Unauthenticated server requested!'))
            }
        } catch (error) {
            next(new Error(error.message))
        }
    }else{
        next(new Error('Invalid server request'))
    }
});
const handleSeeMyCard = asyncHandler(async(req, res, next)=>{
    let {roomId, userId, id} = req.body;
    if(roomId && userId && id){
        try {
            let myRoomResult = await prisma.board.findUnique({where: {id, roomId}});
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
                    // let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                    // let currentPlayingIndex = resetPlaying.findIndex((info)=> info.userId === userId);
                    // let thirdPlayingUserId = '';
                    // if(resetPlaying[currentPlayingIndex].seen && resetPlaying.length > 3){
                    //     let allLength = resetPlaying.length - 1;
                    //     if(allLength === currentPlayingIndex){
                    //         thirdPlayingUserId = resetPlaying[1].userId
                    //     } else if (allLength - 1 === currentPlayingIndex){
                    //         thirdPlayingUserId = resetPlaying[0].userId
                    //     }else{
                    //         thirdPlayingUserId = resetPlaying[currentPlayingIndex+2].userId
                    //     }
                    // }
                    // if(resetPlaying[currentPlayingIndex].seen && resetPlaying.length === 3){
                    //     if(currentPlayingIndex === 1){
                    //         thirdPlayingUserId = resetPlaying[0].userId
                    //     } else if (currentPlayingIndex === 2){
                    //         thirdPlayingUserId = resetPlaying[1].userId
                    //     } else if (currentPlayingIndex === 0){
                    //         thirdPlayingUserId = resetPlaying[2].userId
                    //     }
                    // }
                    // newPlaying = newPlaying.map((info)=> {
                    //     if(info.userId === thirdPlayingUserId){
                    //         let newInfo = {...info};
                    //             newInfo.seen = true;
                    //             return newInfo;
                    //     }else{
                    //         return info;
                    //     }
                    // })
                    try {
                        let boardUpdateResult = await prisma.board.update({
                            where: {id, roomId},
                            data: {
                                playing: newPlaying
                            }
                        })
                        if(boardUpdateResult && boardUpdateResult?.id > 0){
                            let currentUser = newPlaying.filter((info)=> info.userId === userId);
                            let newRoomInfo = {...boardUpdateResult};
                            newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                delete playingInfo.card;
                                return playingInfo;
                            }) 
                            try {
                                let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true, userId: true}});
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
});
const handlePackUpMyCard = asyncHandler(async(req, res, next)=>{
    let {roomId, userId, id} = req.body;
    if(roomId && userId && id){
        try {
            let myRoomResult = await prisma.board.findUnique({where: {id, roomId}});
            if(myRoomResult && myRoomResult.id > 0 && myRoomResult.accessIdes.indexOf(userId) !== -1 && myRoomResult.isStart === 'true'){
                let newPlaying = [...myRoomResult.playing];
                    newPlaying = newPlaying.map((info)=>{
                        if(info.userId === userId){
                            let newInfo = {...info};
                                newInfo.packed = true;
                                newInfo.packedReasonMess.push({
                                    bengali: `তুমি নিজেই তোমার কার্ড প্যাক করেছো`,
                                    english: `You packed your card yourself`
                                });
                                newInfo.isTurn = false;
                                newInfo.timeUp = new Date()
                                return newInfo;
                        }else{
                            return info;
                        }
                    }) 

                    let resetPlaying = newPlaying.filter((info)=> info.packed === false); 

                    let myRoomNewRound = myRoomResult.round;
                    if(resetPlaying.length > 1){
                        let currentPlayingIndex = resetPlaying.findIndex((info)=> info.userId === myRoomResult.nextId);
                        let currentPlaying = resetPlaying[currentPlayingIndex];
                        let nextPlaying = resetPlaying[currentPlayingIndex+1] ? resetPlaying[currentPlayingIndex+1] : resetPlaying[0]
                        if(currentPlayingIndex === 0){
                            myRoomNewRound = myRoomNewRound + 1
                        }
                        newPlaying = newPlaying.map((info)=>{
                            if(info.userId === currentPlaying.userId){
                                let newInfo = {...info};
                                    newInfo.isTurn = true;
                                    newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                    if(newInfo.seen === false && myRoomResult.maxBlindHit === newInfo.blindRound){
                                        newInfo.seen = true
                                    }
                                    return newInfo
                            }else{
                                return info;
                            }
                        })
                        try {
                            let boardUpdateResult = await prisma.board.update({
                                where: {roomId, id},
                                data: {
                                    playing: newPlaying,
                                    currentId: currentPlaying.userId,
                                    nextId: nextPlaying.userId,
                                    round: myRoomNewRound
                                }
                            });
                            if(boardUpdateResult && boardUpdateResult.id > 0){
                                try {
                                    let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                    if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                        let newRoomInfo = {...boardUpdateResult};
                                        newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                            delete playingInfo.card;
                                            return playingInfo;
                                        })
                                        resultGetAllConnectedList.forEach((info)=>{
                                            io.sockets.in(info.socketId).emit('packUpSingleUser',{roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo})
                                        });
                                        res.json({roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo}); 
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
                        let winnerPlaying = resetPlaying[0];
                        newPlaying = newPlaying.map((info)=>{
                            if(info.userId === winnerPlaying.userId){
                                let newInfo = {...info};
                                    newInfo.isTurn = false;
                                    newInfo.packed = true; 
                                    newInfo.packedReasonMess.push({
                                        bengali: `আপনি খেলার প্রধান বিজয়ী `,
                                        english: `You are the main winner of the game`
                                    });
                                    return newInfo;
                            }else{
                                return info;
                            }
                        })
                        try {
                            let userBalanceUpdateResult = await prisma.user.update({
                                where:{userId: winnerPlaying.userId},
                                data: {
                                    [`${myRoomResult.balanceType.toLowerCase()}Balance`]: {increment: myRoomResult.currentBalance}
                                }
                            })
                            if(userBalanceUpdateResult && userBalanceUpdateResult?.id > 0){
                                    let recentTxrId = uid(8); 
                                    let boardTransaction = {
                                        typeName: 'GAME WIN',
                                        isIn: 'IN',
                                        amount: myRoomResult.currentBalance,
                                        txrId: recentTxrId,
                                        userId: winnerPlaying.userId,
                                        sourceId: winnerPlaying.referralCode,
                                        balanceType: myRoomResult.balanceType.toUpperCase()
                                    }
                                    try {
                                        let transactionCreateResult = await prisma.transaction.create({
                                            data: boardTransaction
                                        })
                                        if(transactionCreateResult && transactionCreateResult?.id > 0){
                                            let myRoomUpdateResult = await prisma.board.update({
                                                where:{roomId, id},
                                                data:{
                                                    playing: [],
                                                    totalBalance: 0,
                                                    currentBalance: 0,
                                                    currentCommission: 0,
                                                    round: 0,
                                                    currentId: 'false',
                                                    nextId: 'false',
                                                    previousId: 'false',
                                                    isStart: 'false',
                                                    blind: myRoomResult.rootBlind,
                                                    chaal: myRoomResult.rootChaal,
                                                    rootBlind: 0,
                                                    rootChaal: 0,
                                                    cardViewTill: new Date(new Date().setMilliseconds(40000)),
                                                }
                                            });
                                            if(myRoomUpdateResult && myRoomUpdateResult.id > 0){
                                                try {
                                                    let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                    if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                        resultGetAllConnectedList.forEach((info)=>{
                                                            io.sockets.in(info.socketId).emit('boardFinish',{roomId: myRoomUpdateResult.roomId, roomInfo: myRoomUpdateResult, playingInfo: newPlaying, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance)})
                                                        });
                                                        res.json({roomId: myRoomUpdateResult.roomId, roomInfo: myRoomUpdateResult, playingInfo: newPlaying, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance)});
                                                    }else{
                                                        next(new Error('Internal server error!'))
                                                    }
                                                } catch (error) {  
                                                    next(new Error(error.message))
                                                }
                                            }else{
                                                next(new Error('Internal server error while updating my board'))
                                            }
                                        }else{
                                            next( new Error('Internal server error while create transaction'))
                                        }
                                    } catch (error) { 
                                        next(new Error(error.message))
                                    }
                            }else{
                                next(new Error('Internal server error while user balance update'))
                            }
                        } catch (error) { 
                            next(new Error(error.message))
                        }
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
const handleBlindOneExe = asyncHandler(async(req, res, next)=>{
    let {roomId, userId, id} = req.body;
    if(roomId && userId && id){
        try {
            let myRoomResult = await prisma.board.findUnique({
                where: {roomId}
            })
            if(myRoomResult && myRoomResult?.id > 0 && myRoomResult.isStart === 'true' && myRoomResult.currentId === userId){
                try {
                    let myUserInfo = await prisma.user.findUnique({
                        where: {userId}
                    })
                    if(myUserInfo && myUserInfo?.id > 0){
                        if(Number(myRoomResult.blind) <= Number(myUserInfo[`${myRoomResult.balanceType.toLowerCase()}Balance`])){
                            let myUserUpdateResult = await prisma.user.update({
                                where: {userId},
                                data: {
                                    [`${myRoomResult.balanceType.toLowerCase()}Balance`]: {decrement: Number(myRoomResult.blind)}
                                }
                            })
                            if(myUserUpdateResult && myUserUpdateResult?.id > 0){
                                let newPlaying = [...myRoomResult.playing];
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === userId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = false;
                                                newInfo.blindRound = Number(newInfo.blindRound) + 1;
                                                newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                if(myRoomResult.maxBlindHit === newInfo.blindRound){
                                                    newInfo.seen = true;
                                                }
                                                return newInfo
                                        }else{
                                            return info
                                        }
                                    });
                                let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                let myRoomNewRound = myRoomResult.round;
                                let currentPlayingIndex = resetPlaying.findIndex((info)=> info.userId === myRoomResult.nextId);
                                if(currentPlayingIndex === 0){
                                    myRoomNewRound = myRoomNewRound + 1
                                }
                                let currentPlaying = resetPlaying[currentPlayingIndex];
                                let nextPlaying = resetPlaying[currentPlayingIndex+1] ? resetPlaying[currentPlayingIndex+1] : resetPlaying[0];
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === currentPlaying.userId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = true;
                                                newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                return newInfo;
                                        }else{
                                            return info;
                                        }
                                    })
                                try {
                                    let NBT = myRoomResult.balanceType.toLowerCase();
  
                                    // commission calculating start
                                    let totalBalance = Number(myRoomResult.blind)
                                    let currentCommission = (totalBalance / 100) * Number(process.env[`${NBT}BoardFee`]);
                                    let currentBalance = (totalBalance / 100) * (100 - Number(process.env[`${NBT}BoardFee`]));
                                    let totalAppCommission = currentCommission / 2;
                                    let totalPartnerCommission = currentCommission / 2;
                                    // commission calculating end
  
                                    let allUserTransaction = [];
                                    let recentTxrId = uid(8); 
                                    let boardTransaction = {
                                        typeName: 'BLIND 1X',
                                        isIn: 'OUT',
                                        amount: (Number(myRoomResult.blind) / 100) * (100 - Number(process.env[`${NBT}BoardFee`])),
                                        txrId: recentTxrId,
                                        userId: myUserInfo.userId,
                                        sourceId: myUserInfo.referralCode,
                                        balanceType:  NBT.toUpperCase()
                                    }
                                    let boardFeeCommission = {
                                        typeName: 'BLIND 1X COMMISSION',
                                        isIn: 'OUT',
                                        amount: (Number(myRoomResult.blind) / 100) * Number(process.env[`${NBT}BoardFee`]),
                                        txrId: recentTxrId,
                                        userId: myUserInfo.userId,
                                        sourceId: myUserInfo.referralCode,
                                        balanceType:  NBT.toUpperCase()
                                    }
                                    let boardFeeAppCommission = {
                                        typeName: 'BLIND 1X COMMISSION',
                                        isIn: 'IN',
                                        amount: (Number(myRoomResult.blind) / 100) * (Number(process.env[`${NBT}BoardFee`]) / 2),
                                        txrId: recentTxrId,
                                        userId: '999999999999',
                                        sourceId: myUserInfo.userId,
                                        balanceType:  NBT.toUpperCase()
                                    }
                                    let boardFeePartnerCommission = {
                                        typeName: 'BLIND 1X COMMISSION',
                                        isIn: 'IN',
                                        amount: (Number(myRoomResult.blind) / 100) * (Number(process.env[`${NBT}BoardFee`]) / 2),
                                        txrId: recentTxrId,
                                        userId: myUserInfo.referralCode,
                                        sourceId: myUserInfo.userId,
                                        balanceType:  NBT.toUpperCase()
                                    }
                                    if(boardTransaction.amount > 0){
                                        allUserTransaction.push(boardTransaction);
                                    }
                                    if(boardFeeCommission.amount > 0){
                                        allUserTransaction.push(boardFeeCommission)
                                    }
                                    if(boardFeeAppCommission.amount > 0){
                                        allUserTransaction.push(boardFeeAppCommission)
                                    }   
                                    if(boardFeePartnerCommission.amount > 0){
                                        allUserTransaction.push(boardFeePartnerCommission)
                                    }
                                    let myTransactionCreateResult = await prisma.transaction.createMany({data: allUserTransaction});
                                    if(myTransactionCreateResult && myTransactionCreateResult.count > 0){
                                        let rootAssetUpdateResult = await prisma.rootasset.update({
                                            where:{id: 1},
                                            data:{   
                                                [`${NBT}TotalCommission`]: {increment: currentCommission},
                                                [`${NBT}TotalAppCommission`]: {increment: totalAppCommission},
                                                [`${NBT}TotalPartnerCommission`]: {increment: totalPartnerCommission}
                                            }
                                        }) 
                                        if(rootAssetUpdateResult && rootAssetUpdateResult?.id > 0){
  
                                            let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                            if(resetPlaying.length > 2){
                                                let prevPlayer = resetPlaying.filter((info)=> info.userId === userId)[0]; 
                                                let prevPlayerIndex = resetPlaying.findIndex((info)=> info.userId === userId);
                                                let prevPrevPlayer = resetPlaying[prevPlayerIndex-1] ? resetPlaying[prevPlayerIndex-1] : resetPlaying[resetPlaying.length-1]; 
                                                let currentPlayer = resetPlaying.filter((info)=> info.userId === currentPlaying.userId)[0]; 
                                                if(prevPrevPlayer.seen && prevPlayer.seen === false && currentPlayer.seen === false){
                                                    newPlaying = newPlaying.map((info)=>{
                                                        if(info.userId === currentPlayer.userId){
                                                            return {...info, seen: true}
                                                        }else{
                                                            return info;
                                                        }
                                                    })
                                                }
                                            }
  
                                            try {
                                                let myRoomUpdateResult = await prisma.board.update({
                                                    where: {roomId, id},
                                                    data: {
                                                        playing: newPlaying,
                                                        totalBalance: {increment: totalBalance},
                                                        currentBalance: {increment: currentBalance},
                                                        currentCommission: {increment: currentCommission},
                                                        currentId: currentPlaying.userId,
                                                        nextId: nextPlaying.userId,
                                                        round: myRoomNewRound
                                                    }
                                                })
                                                if(myRoomUpdateResult && myRoomUpdateResult?.id > 0){
                                                    try {
                                                        let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                        if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                            let newRoomInfo = {...myRoomUpdateResult};
                                                            newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                delete playingInfo.card;
                                                                return playingInfo;
                                                            })
                                                            resultGetAllConnectedList.forEach((info)=>{
                                                                io.sockets.in(info.socketId).emit('anyoneHitSuccess',{roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.blind)})
                                                            });
                                                            res.json({roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.blind)});
                                                        }else{
                                                            next(new Error('Internal server error!'))
                                                        }
                                                    } catch (error) { 
                                                        next(new Error(error.message))
                                                    }
                                                }else{
                                                    next(new Error('Internal server error while updating board info'))
                                                }
                                            } catch (error) {
                                                next(new Error(error.message))
                                            }
                                        }else{
                                            next(new Error('Internal server error while updating root asset'))
                                        }
                                    }else{
                                        next(new Error('Internal server error while creating my transaction'))
                                    }
                                } catch (error) {
                                    next(new Error(error.message))
                                }
                            }else{
                                next(new Error('Internal server error while decrementing user balance'))
                            }
                        }else{ 
                            let currentUser = myRoomResult.playing.filter((info)=> info.userId === userId)[0];
                            let winnerResult = cardUtils.cardCompareHandler(myRoomResult, currentUser);
                            if(myRoomResult.compare === 'true' && winnerResult){
                                let newPlaying = [...myRoomResult.playing];
                                newPlaying = newPlaying.map((info)=>{
                                    if(info.userId === userId){
                                        let newInfo = {...info};
                                            newInfo.isTurn = false;
                                            newInfo.packed = true; 
                                            newInfo.packedReasonMess.push({
                                                bengali: `আপনি যখন না দেখে হিট দেন (১x ব্লাইন্ড) । তখন আপনার একাউন্ট এ পর্যাপ্ত ব্যালান্স ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি বিজয়ী হন। `,
                                                english: `Hit when you don't see (1x blind). Then your account did not have sufficient balance. As the comparison is on in the game. Your card is compared to everyone else. And you win.`
                                            });
                                            return newInfo;
                                    }else{
                                        return info;
                                    }
                                })
                                let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                if(resetPlaying.length > 1){
                                    // checking passed
                                    let myRoomNewRound = myRoomResult.round;
                                    let currentPlayingIndex = resetPlaying.findIndex((info)=> info.userId === myRoomResult.nextId);
                                    if(currentPlayingIndex === 0){
                                        myRoomNewRound = myRoomNewRound + 1
                                    }
                                    let currentPlaying = resetPlaying[currentPlayingIndex];
                                    let nextPlaying = resetPlaying[currentPlayingIndex+1] ? resetPlaying[currentPlayingIndex+1] : resetPlaying[0];
                                        newPlaying = newPlaying.map((info)=>{
                                            if(info.userId === currentPlaying.userId){
                                                let newInfo = {...info};
                                                    newInfo.isTurn = true;
                                                    newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                    if(newInfo.seen === false && myRoomResult.maxBlindHit === newInfo.blindRound){
                                                        newInfo.seen = true
                                                    }
                                                    return newInfo;
                                            }else{
                                                return info;
                                            }
                                        })
  
                                        let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                        if(resetPlaying.length > 2){
                                            let currentPlayer = resetPlaying.filter((info)=> info.userId === currentPlaying.userId)[0]; 
                                            let currentPlayerIndex = resetPlaying.findIndex((info)=> info.userId === currentPlayer.userId); 
                                            let prevPlayer = resetPlaying[currentPlayerIndex-1] ? resetPlaying[currentPlayerIndex-1] : resetPlaying[resetPlaying.length - 1];
                                            let prevPlayerIndex = resetPlaying.findIndex((info)=> info.userId === prevPlayer.userId);
                                            let prevPrevPlayer = resetPlaying[prevPlayerIndex-1] ? resetPlaying[prevPlayerIndex-1] : resetPlaying[resetPlaying.length-1]; 
                                            if(prevPrevPlayer.seen && prevPlayer.seen === false && currentPlayer.seen === false){
                                                newPlaying = newPlaying.map((info)=>{
                                                    if(info.userId === currentPlayer.userId){
                                                        return {...info, seen: true}
                                                    }else{
                                                        return info;
                                                    }
                                                })
                                            }
                                        }
  
                                    try {
                                        let boardUpdateResult = await prisma.board.update({
                                            where: {roomId, id},
                                            data: {
                                                playing: newPlaying,
                                                round: myRoomNewRound,
                                                currentId: currentPlaying.userId,
                                                nextId: nextPlaying.userId,
                                                currentBalance: 0,
                                                currentCommission: 0,
                                                totalBalance: 0
                                            }
                                        })
                                        if(boardUpdateResult && boardUpdateResult?.id > 0){
                                            try {
                                                let myUserUpdateResult = await prisma.user.update({
                                                    where: {userId},
                                                    data: {
                                                        [`${myRoomResult.balanceType.toLowerCase()}Balance`]: {increment: Number(myRoomResult.currentBalance)}
                                                    }
                                                })
                                                if(myUserUpdateResult && myUserUpdateResult?.id > 0){
                                                    let recentTxrId = uid(8); 
                                                    let userWinTransaction = {
                                                        typeName: 'GAME WIN BY BLIND 1X COMPARE WIN',
                                                        isIn: 'IN',
                                                        amount: myRoomResult.currentBalance,
                                                        txrId: recentTxrId,
                                                        userId: currentUser.userId,
                                                        sourceId: currentUser.referralCode,
                                                        balanceType: myRoomResult.balanceType.toUpperCase()
                                                    }
                                                    try {
                                                        let userTransactionUpdate = await prisma.transaction.create({
                                                            data: userWinTransaction
                                                        })
                                                        if(userTransactionUpdate && userTransactionUpdate.id > 0){
                                                            try {
                                                                let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                                if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                    let newRoomInfo = {...boardUpdateResult};
                                                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                        delete playingInfo.card;
                                                                        return playingInfo;
                                                                    })
                                                                    resultGetAllConnectedList.forEach((info)=>{
                                                                        io.sockets.in(info.socketId).emit('anyoneHitFailButCompareWin',{roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.currentBalance)})
                                                                    });
                                                                    res.json({roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.currentBalance)});
                                                                }else{
                                                                    next(new Error('Internal server error!'))
                                                                }
                                                            } catch (error) { 
                                                                next(new Error(error.message))
                                                            }
                                                        }else{
                                                            next(new Error('Internal server error while creating user win transaction!'))
                                                        }
                                                    } catch (error) {
                                                        next(new Error(error.message))
                                                    }
                                                }else{
                                                    next(new Error('Internal server error while updating my winning account balance!'))
                                                }
                                            } catch (error) {
                                                next(new Error(error.message))
                                            } 
                                        }else{
                                            next(new Error('Internal server error while updating board'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    }
                                }else{
                                    // check passed
                                    let winnerPlaying = newPlaying.filter((info)=> info.userId === userId)[0];
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === winnerPlaying.userId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = false;
                                                newInfo.packed = true; 
                                                newInfo.packedReasonMess.push({
                                                    bengali: `আপনি খেলার প্রধান বিজয়ী `,
                                                    english: `You are the main winner of the game`
                                                });
                                                return newInfo;
                                        }else{
                                            return info;
                                        }
                                    })
                                    try {
                                        let userBalanceUpdateResult = await prisma.user.update({
                                            where:{userId: winnerPlaying.userId},
                                            data: {
                                                [`${myRoomResult.balanceType.toLowerCase()}Balance`]: {increment: myRoomResult.currentBalance}
                                            }
                                        })
                                        if(userBalanceUpdateResult && userBalanceUpdateResult?.id > 0){
                                                let recentTxrId = uid(8); 
                                                let boardTransaction = {
                                                    typeName: 'GAME WIN BY BLIND 1X COMPARE WIN',
                                                    isIn: 'IN',
                                                    amount: myRoomResult.currentBalance,
                                                    txrId: recentTxrId,
                                                    userId: winnerPlaying.userId,
                                                    sourceId: winnerPlaying.referralCode,
                                                    balanceType: myRoomResult.balanceType.toUpperCase()
                                                }
                                                try {
                                                    let transactionCreateResult = await prisma.transaction.create({
                                                        data: boardTransaction
                                                    })
                                                    if(transactionCreateResult && transactionCreateResult?.id > 0){
                                                        let myRoomUpdateResult = await prisma.board.update({
                                                            where:{roomId, id},
                                                            data:{
                                                                playing: [],
                                                                totalBalance: 0,
                                                                currentBalance: 0,
                                                                currentCommission: 0,
                                                                round: 0,
                                                                currentId: 'false',
                                                                nextId: 'false',
                                                                previousId: 'false',
                                                                isStart: 'false',
                                                                blind: myRoomResult.rootBlind,
                                                                chaal: myRoomResult.rootChaal,
                                                                rootBlind: 0,
                                                                rootChaal: 0,
                                                                cardViewTill: new Date(new Date().setMilliseconds(40000)),
                                                            }
                                                        });
                                                        if(myRoomUpdateResult && myRoomUpdateResult.id > 0){
                                                            try {
                                                                let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                                if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                    let newRoomInfo = {...myRoomUpdateResult};
                                                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                        delete playingInfo.card;
                                                                        return playingInfo;
                                                                    })
                                                                    resultGetAllConnectedList.forEach((info)=>{
                                                                        io.sockets.in(info.socketId).emit('boardFinish',{roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.currentBalance), playingInfo: newPlaying})
                                                                    });
                                                                    res.json({roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.currentBalance), playingInfo: newPlaying});
                                                                }else{
                                                                    next(new Error('Internal server error!'))
                                                                }
                                                            } catch (error) { 
                                                                next(new Error(error.message))
                                                            }
                                                        }else{
                                                            next(new Error('Internal server error while updating my board'))
                                                        }
                                                    }else{
                                                        next( new Error('Internal server error while create transaction'))
                                                    }
                                                } catch (error) {
                                                    next(new Error(error.message))
                                                }
                                        }else{
                                            next(new Error('Internal server error while user balance update'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    }
                                }
                            }else{
                                let newPlaying = [...myRoomResult.playing];
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === userId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = false;
                                                newInfo.packed = true; 
                                                newInfo.packedReasonMess.push({
                                                    bengali: `আপনি যখন না দেখে হিট দেন (১x ব্লাইন্ড) । তখন আপনার একাউন্ট এ পর্যাপ্ত ব্যালান্স ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি পরাজিত হন।`,
                                                    english: `Hit when you don't see (1x blind). Then your account did not have sufficient balance. As the comparison is on in the game. Your card is compared to everyone else. And you lose.`
                                                });
                                                return newInfo;
                                        }else{
                                            return info;
                                        }
                                    })
                                let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                if(resetPlaying.length > 1){
                                    //check passed
                                    let myRoomNewRound = myRoomResult.round;
                                    let currentPlayingIndex = resetPlaying.findIndex((info)=> info.userId === myRoomResult.nextId);
                                    if(currentPlayingIndex === 0){
                                        myRoomNewRound = myRoomNewRound + 1
                                    }
                                    let currentPlaying = resetPlaying[currentPlayingIndex];
                                    let nextPlaying = resetPlaying[currentPlayingIndex+1] ? resetPlaying[currentPlayingIndex+1] : resetPlaying[0];
                                        newPlaying = newPlaying.map((info)=>{
                                            if(info.userId === currentPlaying.userId){
                                                let newInfo = {...info};
                                                    newInfo.isTurn = true;
                                                    newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                    if(newInfo.seen === false && myRoomResult.maxBlindHit === newInfo.blindRound){
                                                        newInfo.seen = true
                                                    }
                                                    return newInfo;
                                            }else{
                                                return info;
                                            }
                                        })
  
                                        let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                        if(resetPlaying.length > 2){
                                            let currentPlayer = resetPlaying.filter((info)=> info.userId === currentPlaying.userId)[0]; 
                                            let currentPlayerIndex = resetPlaying.findIndex((info)=> info.userId === currentPlayer.userId); 
                                            let prevPlayer = resetPlaying[currentPlayerIndex-1] ? resetPlaying[currentPlayerIndex-1] : resetPlaying[resetPlaying.length - 1];
                                            let prevPlayerIndex = resetPlaying.findIndex((info)=> info.userId === prevPlayer.userId);
                                            let prevPrevPlayer = resetPlaying[prevPlayerIndex-1] ? resetPlaying[prevPlayerIndex-1] : resetPlaying[resetPlaying.length-1]; 
                                            if(prevPrevPlayer.seen && prevPlayer.seen === false && currentPlayer.seen === false){
                                                newPlaying = newPlaying.map((info)=>{
                                                    if(info.userId === currentPlayer.userId){
                                                        return {...info, seen: true}
                                                    }else{
                                                        return info;
                                                    }
                                                })
                                            }
                                        }
  
                                    try {
                                        let boardUpdateResult = await prisma.board.update({
                                            where: {roomId, id},
                                            data: {
                                                playing: newPlaying,
                                                round: myRoomNewRound,
                                                currentId: currentPlaying.userId,
                                                nextId: nextPlaying.userId
                                            }
                                        })
                                        if(boardUpdateResult && boardUpdateResult?.id > 0){
                                            try {
                                                let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                    let newRoomInfo = {...boardUpdateResult};
                                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                        delete playingInfo.card;
                                                        return playingInfo;
                                                    })
                                                    resultGetAllConnectedList.forEach((info)=>{
                                                        io.sockets.in(info.socketId).emit('anyoneHitFailButCompareFail',{roomId: myRoomResult.roomId, roomInfo: newRoomInfo })
                                                    });
                                                    res.json({roomId: myRoomResult.roomId, roomInfo: newRoomInfo });
                                                }else{
                                                    next(new Error('Internal server error!'))
                                                }
                                            } catch (error) { 
                                                next(new Error(error.message))
                                            }
                                        }else{
                                            next(new Error('Internal server error while updating board'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    }
                                }else{
                                    // check passed
                                    let winnerPlaying = resetPlaying[0];
                                        newPlaying = newPlaying.map((info)=>{
                                            if(info.userId === winnerPlaying.userId){
                                                let newInfo = {...info};
                                                    newInfo.isTurn = false;
                                                    newInfo.packed = true; 
                                                    newInfo.packedReasonMess.push({
                                                    bengali: `আপনি খেলার প্রধান বিজয়ী `,
                                                    english: `You are the main winner of the game`
                                                });
                                                    return newInfo;
                                            }else{
                                                return info;
                                            }
                                        })
                                    try {
                                        let userBalanceUpdateResult = await prisma.user.update({
                                            where:{userId: winnerPlaying.userId},
                                            data: {
                                                [`${myRoomResult.balanceType.toLowerCase()}Balance`]: {increment: myRoomResult.currentBalance}
                                            }
                                        })
                                        if(userBalanceUpdateResult && userBalanceUpdateResult?.id > 0){
                                                let recentTxrId = uid(8); 
                                                let boardTransaction = {
                                                    typeName: 'GAME WIN BY BLIND 1X COMPARE WIN',
                                                    isIn: 'IN',
                                                    amount: myRoomResult.currentBalance,
                                                    txrId: recentTxrId,
                                                    userId: winnerPlaying.userId,
                                                    sourceId: winnerPlaying.referralCode,
                                                    balanceType: myRoomResult.balanceType.toUpperCase()
                                                }
                                                try {
                                                    let transactionCreateResult = await prisma.transaction.create({
                                                        data: boardTransaction
                                                    })
                                                    if(transactionCreateResult && transactionCreateResult?.id > 0){
                                                        let myRoomUpdateResult = await prisma.board.update({
                                                            where:{roomId, id},
                                                            data:{
                                                                playing: [],
                                                                totalBalance: 0,
                                                                currentBalance: 0,
                                                                currentCommission: 0,
                                                                round: 0,
                                                                currentId: 'false',
                                                                nextId: 'false',
                                                                previousId: 'false',
                                                                isStart: 'false',
                                                                blind: myRoomResult.rootBlind,
                                                                chaal: myRoomResult.rootChaal,
                                                                rootBlind: 0,
                                                                rootChaal: 0,
                                                                cardViewTill: new Date(new Date().setMilliseconds(40000)),
                                                            }
                                                        });
                                                        if(myRoomUpdateResult && myRoomUpdateResult.id > 0){
                                                            try {
                                                                let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                                if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                    let newRoomInfo = {...myRoomUpdateResult};
                                                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                        delete playingInfo.card;
                                                                        return playingInfo;
                                                                    })
                                                                    resultGetAllConnectedList.forEach((info)=>{
                                                                        io.sockets.in(info.socketId).emit('boardFinish',{roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance), playingInfo: newPlaying})
                                                                    });
                                                                    res.json({roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance), playingInfo: newPlaying});
                                                                }else{
                                                                    next(new Error('Internal server error!'))
                                                                }
                                                            } catch (error) { 
                                                                next(new Error(error.message))
                                                            }
                                                        }else{
                                                            next(new Error('Internal server error while updating my board'))
                                                        }
                                                    }else{
                                                        next( new Error('Internal server error while create transaction'))
                                                    }
                                                } catch (error) {
                                                    next(new Error(error.message))
                                                }
                                        }else{
                                            next(new Error('Internal server error while user balance update'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    }
                                }
                            }
                        }
                    }else{
                        next(new Error('Internal server error while finding my user data'))
                    }
                } catch (error) {
                    next(new Error(error.message))
                }
            }else{
                next(new Error('Internal server error while find my room'))
            }
        } catch (error) {
            next(new Error(error.message))
        }
    }else{
        next(new Error('Internal server error!'))
    }
});
const handleBlindTwoExe = asyncHandler(async(req, res, next)=>{
    let {roomId, userId, id} = req.body;
    if(roomId && userId && id){
        try {
            let myRoomResult = await prisma.board.findUnique({
                where: {roomId}
            })
            if(myRoomResult && myRoomResult?.id > 0 && myRoomResult.increase === 'true' && myRoomResult.isStart === 'true' && myRoomResult.currentId === userId){
                try {
                    let myUserInfo = await prisma.user.findUnique({
                        where: {userId}
                    })
                    if(myUserInfo && myUserInfo?.id > 0){
                        if(Number(myRoomResult.blind) * 2 <= Number(myUserInfo[`${myRoomResult.balanceType.toLowerCase()}Balance`])){
                            let myUserUpdateResult = await prisma.user.update({
                                where: {userId},
                                data: {
                                    [`${myRoomResult.balanceType.toLowerCase()}Balance`]: {decrement: Number(myRoomResult.blind) * 2}
                                }
                            })
                            if(myUserUpdateResult && myUserUpdateResult?.id > 0){
                                let newPlaying = [...myRoomResult.playing];
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === userId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = false;
                                                newInfo.blindRound = Number(newInfo.blindRound) + 1;
                                                newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                if(myRoomResult.maxBlindHit === newInfo.blindRound){
                                                    newInfo.seen = true;
                                                }
                                                return newInfo
                                        }else{
                                            return info
                                        }
                                    });
                                let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                let myRoomNewRound = myRoomResult.round;
                                let currentPlayingIndex = resetPlaying.findIndex((info)=> info.userId === myRoomResult.nextId);
                                if(currentPlayingIndex === 0){
                                    myRoomNewRound = myRoomNewRound + 1
                                }
                                let currentPlaying = resetPlaying[currentPlayingIndex];
                                let nextPlaying = resetPlaying[currentPlayingIndex+1] ? resetPlaying[currentPlayingIndex+1] : resetPlaying[0];
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === currentPlaying.userId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = true;
                                                newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                return newInfo;
                                        }else{
                                            return info;
                                        }
                                    })
                                try {
                                    let NBT = myRoomResult.balanceType.toLowerCase();

                                    // commission calculating start
                                    let totalBalance = Number(myRoomResult.blind) * 2
                                    let currentCommission = (totalBalance / 100) * Number(process.env[`${NBT}BoardFee`]);
                                    let currentBalance = (totalBalance / 100) * (100 - Number(process.env[`${NBT}BoardFee`]));
                                    let totalAppCommission = currentCommission / 2;
                                    let totalPartnerCommission = currentCommission / 2;
                                    // commission calculating end

                                    let allUserTransaction = [];
                                    let recentTxrId = uid(8); 
                                    let boardTransaction = {
                                        typeName: 'BLIND 2X',
                                        isIn: 'OUT',
                                        amount: ((Number(myRoomResult.blind) * 2) / 100) * (100 - Number(process.env[`${NBT}BoardFee`])),
                                        txrId: recentTxrId,
                                        userId: myUserInfo.userId,
                                        sourceId: myUserInfo.referralCode,
                                        balanceType:  NBT.toUpperCase()
                                    }
                                    let boardFeeCommission = {
                                        typeName: 'BLIND 2X COMMISSION',
                                        isIn: 'OUT',
                                        amount: ((Number(myRoomResult.blind) * 2) / 100) * Number(process.env[`${NBT}BoardFee`]),
                                        txrId: recentTxrId,
                                        userId: myUserInfo.userId,
                                        sourceId: myUserInfo.referralCode,
                                        balanceType:  NBT.toUpperCase()
                                    }
                                    let boardFeeAppCommission = {
                                        typeName: 'BLIND 2X COMMISSION',
                                        isIn: 'IN',
                                        amount: ((Number(myRoomResult.blind) * 2) / 100) * (Number(process.env[`${NBT}BoardFee`]) / 2),
                                        txrId: recentTxrId,
                                        userId: '999999999999',
                                        sourceId: myUserInfo.userId,
                                        balanceType:  NBT.toUpperCase()
                                    }
                                    let boardFeePartnerCommission = {
                                        typeName: 'BLIND 2X COMMISSION',
                                        isIn: 'IN',
                                        amount: ((Number(myRoomResult.blind) * 2) / 100) * (Number(process.env[`${NBT}BoardFee`]) / 2),
                                        txrId: recentTxrId,
                                        userId: myUserInfo.referralCode,
                                        sourceId: myUserInfo.userId,
                                        balanceType:  NBT.toUpperCase()
                                    }
                                    if(boardTransaction.amount > 0){
                                        allUserTransaction.push(boardTransaction);
                                    }
                                    if(boardFeeCommission.amount > 0){
                                        allUserTransaction.push(boardFeeCommission)
                                    }
                                    if(boardFeeAppCommission.amount > 0){
                                        allUserTransaction.push(boardFeeAppCommission)
                                    }   
                                    if(boardFeePartnerCommission.amount > 0){
                                        allUserTransaction.push(boardFeePartnerCommission)
                                    }
                                    let myTransactionCreateResult = await prisma.transaction.createMany({data: allUserTransaction});
                                    if(myTransactionCreateResult && myTransactionCreateResult.count > 0){
                                        let rootAssetUpdateResult = await prisma.rootasset.update({
                                            where:{id: 1},
                                            data:{   
                                                [`${NBT}TotalCommission`]: {increment: currentCommission},
                                                [`${NBT}TotalAppCommission`]: {increment: totalAppCommission},
                                                [`${NBT}TotalPartnerCommission`]: {increment: totalPartnerCommission}
                                            }
                                        }) 
                                        if(rootAssetUpdateResult && rootAssetUpdateResult?.id > 0){

                                            let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                            if(resetPlaying.length > 2){
                                                let prevPlayer = resetPlaying.filter((info)=> info.userId === userId)[0]; 
                                                let prevPlayerIndex = resetPlaying.findIndex((info)=> info.userId === userId);
                                                let prevPrevPlayer = resetPlaying[prevPlayerIndex-1] ? resetPlaying[prevPlayerIndex-1] : resetPlaying[resetPlaying.length-1]; 
                                                let currentPlayer = resetPlaying.filter((info)=> info.userId === currentPlaying.userId)[0]; 
                                                if(prevPrevPlayer.seen && prevPlayer.seen === false && currentPlayer.seen === false){
                                                    newPlaying = newPlaying.map((info)=>{
                                                        if(info.userId === currentPlayer.userId){
                                                            return {...info, seen: true}
                                                        }else{
                                                            return info;
                                                        }
                                                    })
                                                }
                                            }

                                            try {
                                                let myRoomUpdateResult = await prisma.board.update({
                                                    where: {roomId, id},
                                                    data: {
                                                        playing: newPlaying,
                                                        totalBalance: {increment: totalBalance},
                                                        currentBalance: {increment: currentBalance},
                                                        currentCommission: {increment: currentCommission},
                                                        currentId: currentPlaying.userId,
                                                        nextId: nextPlaying.userId,
                                                        round: myRoomNewRound,
                                                        blind: Number(myRoomResult.blind) * 2,
                                                        chaal: Number(myRoomResult.chaal) * 2
                                                    }
                                                })
                                                if(myRoomUpdateResult && myRoomUpdateResult?.id > 0){
                                                    try {
                                                        let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                        if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                            let newRoomInfo = {...myRoomUpdateResult};
                                                            newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                delete playingInfo.card;
                                                                return playingInfo;
                                                            })
                                                            resultGetAllConnectedList.forEach((info)=>{
                                                                io.sockets.in(info.socketId).emit('anyoneHitSuccess',{roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.blind) *2})
                                                            });
                                                            res.json({roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.blind)*2});
                                                        }else{
                                                            next(new Error('Internal server error!'))
                                                        }
                                                    } catch (error) { 
                                                        next(new Error(error.message))
                                                    }
                                                }else{
                                                    next(new Error('Internal server error while updating board info'))
                                                }
                                            } catch (error) {
                                                next(new Error(error.message))
                                            }
                                        }else{
                                            next(new Error('Internal server error while updating root asset'))
                                        }
                                    }else{
                                        next(new Error('Internal server error while creating my transaction'))
                                    }
                                } catch (error) {
                                    next(new Error(error.message))
                                }
                            }else{
                                next(new Error('Internal server error while decrementing user balance'))
                            }
                        }else{ 
                            let currentUser = myRoomResult.playing.filter((info)=> info.userId === userId)[0];
                            let winnerResult = cardUtils.cardCompareHandler(myRoomResult, currentUser);
                            if(myRoomResult.compare === 'true' && winnerResult){
                                let newPlaying = [...myRoomResult.playing];
                                newPlaying = newPlaying.map((info)=>{
                                    if(info.userId === userId){
                                        let newInfo = {...info};
                                            newInfo.isTurn = false;
                                            newInfo.packed = true;
                                            newInfo.packedReasonMess.push({
                                                bengali: `আপনি যখন না দেখে দ্বিগুন  হিট দেন (২x ব্লাইন্ড) । তখন আপনার একাউন্ট এ পর্যাপ্ত ব্যালান্স ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি বিজয়ী হন। `,
                                                english: `Double hits when you are blind (2x blind). Then your account did not have sufficient balance. As the comparison is on in the game. Your card is compared to everyone else. And you win.`
                                            });
                                            return newInfo;
                                    }else{
                                        return info;
                                    }
                                })
                                let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                if(resetPlaying.length > 1){
                                    // checking passed
                                    let myRoomNewRound = myRoomResult.round;
                                    let currentPlayingIndex = resetPlaying.findIndex((info)=> info.userId === myRoomResult.nextId);
                                    if(currentPlayingIndex === 0){
                                        myRoomNewRound = myRoomNewRound + 1
                                    }
                                    let currentPlaying = resetPlaying[currentPlayingIndex];
                                    let nextPlaying = resetPlaying[currentPlayingIndex+1] ? resetPlaying[currentPlayingIndex+1] : resetPlaying[0];
                                        newPlaying = newPlaying.map((info)=>{
                                            if(info.userId === currentPlaying.userId){
                                                let newInfo = {...info};
                                                    newInfo.isTurn = true;
                                                    newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                    if(newInfo.seen === false && myRoomResult.maxBlindHit === newInfo.blindRound){
                                                        newInfo.seen = true
                                                    }
                                                    return newInfo;
                                            }else{
                                                return info;
                                            }
                                        })


                                        let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                        if(resetPlaying.length > 2){
                                            let currentPlayer = resetPlaying.filter((info)=> info.userId === currentPlaying.userId)[0]; 
                                            let currentPlayerIndex = resetPlaying.findIndex((info)=> info.userId === currentPlayer.userId); 
                                            let prevPlayer = resetPlaying[currentPlayerIndex-1] ? resetPlaying[currentPlayerIndex-1] : resetPlaying[resetPlaying.length - 1];
                                            let prevPlayerIndex = resetPlaying.findIndex((info)=> info.userId === prevPlayer.userId);
                                            let prevPrevPlayer = resetPlaying[prevPlayerIndex-1] ? resetPlaying[prevPlayerIndex-1] : resetPlaying[resetPlaying.length-1]; 
                                            if(prevPrevPlayer.seen && prevPlayer.seen === false && currentPlayer.seen === false){
                                                newPlaying = newPlaying.map((info)=>{
                                                    if(info.userId === currentPlayer.userId){
                                                        return {...info, seen: true}
                                                    }else{
                                                        return info;
                                                    }
                                                })
                                            }
                                        }


                                    try {
                                        let boardUpdateResult = await prisma.board.update({
                                            where: {roomId, id},
                                            data: {
                                                playing: newPlaying,
                                                round: myRoomNewRound,
                                                currentId: currentPlaying.userId,
                                                nextId: nextPlaying.userId,
                                                currentBalance: 0,
                                                currentCommission: 0,
                                                totalBalance: 0
                                            }
                                        })
                                        if(boardUpdateResult && boardUpdateResult?.id > 0){
                                            try {
                                                let myUserUpdateResult = await prisma.user.update({
                                                    where: {userId},
                                                    data: {
                                                        [`${myRoomResult.balanceType.toLowerCase()}Balance`]: {increment: Number(myRoomResult.currentBalance)}
                                                    }
                                                })
                                                if(myUserUpdateResult && myUserUpdateResult?.id > 0){
                                                    let recentTxrId = uid(8); 
                                                    let userWinTransaction = {
                                                        typeName: 'GAME WIN BY BLIND 2X COMPARE WIN',
                                                        isIn: 'IN',
                                                        amount: myRoomResult.currentBalance,
                                                        txrId: recentTxrId,
                                                        userId: currentUser.userId,
                                                        sourceId: currentUser.referralCode,
                                                        balanceType: myRoomResult.balanceType.toUpperCase()
                                                    }
                                                    try {
                                                        let userTransactionUpdate = await prisma.transaction.create({
                                                            data: userWinTransaction
                                                        })
                                                        if(userTransactionUpdate && userTransactionUpdate.id > 0){
                                                            try {
                                                                let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                                if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                    let newRoomInfo = {...boardUpdateResult};
                                                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                        delete playingInfo.card;
                                                                        return playingInfo;
                                                                    })
                                                                    resultGetAllConnectedList.forEach((info)=>{
                                                                        io.sockets.in(info.socketId).emit('anyoneHitFailButCompareWin',{roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.currentBalance)})
                                                                    });
                                                                    res.json({roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.currentBalance)});
                                                                }else{
                                                                    next(new Error('Internal server error!'))
                                                                }
                                                            } catch (error) { 
                                                                next(new Error(error.message))
                                                            }
                                                        }else{
                                                            next(new Error('Internal server error while creating user win transaction!'))
                                                        }
                                                    } catch (error) {
                                                        next(new Error(error.message))
                                                    }
                                                }else{
                                                    next(new Error('Internal server error while updating my winning account balance!'))
                                                }
                                            } catch (error) {
                                                next(new Error(error.message))
                                            } 
                                        }else{
                                            next(new Error('Internal server error while updating board'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    }
                                }else{
                                    // checking
                                    let winnerPlaying = newPlaying.filter((info)=> info.userId === userId)[0];
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === winnerPlaying.userId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = false;
                                                newInfo.packed = true; 
                                                newInfo.packedReasonMess.push({
                                                    bengali: `আপনি খেলার প্রধান বিজয়ী `,
                                                    english: `You are the main winner of the game`
                                                });
                                                return newInfo;
                                        }else{
                                            return info;
                                        }
                                    })
                                    try {
                                        let userBalanceUpdateResult = await prisma.user.update({
                                            where:{userId: winnerPlaying.userId},
                                            data: {
                                                [`${myRoomResult.balanceType.toLowerCase()}Balance`]: {increment: myRoomResult.currentBalance}
                                            }
                                        })
                                        if(userBalanceUpdateResult && userBalanceUpdateResult?.id > 0){
                                                let recentTxrId = uid(8); 
                                                let boardTransaction = {
                                                    typeName: 'GAME WIN BY BLIND 2X COMPARE WIN',
                                                    isIn: 'IN',
                                                    amount: myRoomResult.currentBalance,
                                                    txrId: recentTxrId,
                                                    userId: winnerPlaying.userId,
                                                    sourceId: winnerPlaying.referralCode,
                                                    balanceType: myRoomResult.balanceType.toUpperCase()
                                                }
                                                try {
                                                    let transactionCreateResult = await prisma.transaction.create({
                                                        data: boardTransaction
                                                    })
                                                    if(transactionCreateResult && transactionCreateResult?.id > 0){
                                                        let myRoomUpdateResult = await prisma.board.update({
                                                            where:{roomId, id},
                                                            data:{
                                                                playing: [],
                                                                totalBalance: 0,
                                                                currentBalance: 0,
                                                                currentCommission: 0,
                                                                round: 0,
                                                                currentId: 'false',
                                                                nextId: 'false',
                                                                previousId: 'false',
                                                                isStart: 'false',
                                                                blind: myRoomResult.rootBlind,
                                                                chaal: myRoomResult.rootChaal,
                                                                rootBlind: 0,
                                                                rootChaal: 0,
                                                                cardViewTill: new Date(new Date().setMilliseconds(40000)),
                                                            }
                                                        });
                                                        if(myRoomUpdateResult && myRoomUpdateResult.id > 0){
                                                            try {
                                                                let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                                if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                    let newRoomInfo = {...myRoomUpdateResult};
                                                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                        delete playingInfo.card;
                                                                        return playingInfo;
                                                                    })
                                                                    resultGetAllConnectedList.forEach((info)=>{
                                                                        io.sockets.in(info.socketId).emit('boardFinish',{roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.currentBalance), playingInfo: newPlaying})
                                                                    });
                                                                    res.json({roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.currentBalance), playingInfo: newPlaying});
                                                                }else{
                                                                    next(new Error('Internal server error!'))
                                                                }
                                                            } catch (error) { 
                                                                next(new Error(error.message))
                                                            }
                                                        }else{
                                                            next(new Error('Internal server error while updating my board'))
                                                        }
                                                    }else{
                                                        next( new Error('Internal server error while create transaction'))
                                                    }
                                                } catch (error) {
                                                    next(new Error(error.message))
                                                }
                                        }else{
                                            next(new Error('Internal server error while user balance update'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    }
                                }
                            }else{
                                let newPlaying = [...myRoomResult.playing];
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === userId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = false;
                                                newInfo.packed = true;
                                                newInfo.packedReasonMess.push({
                                                    bengali: `আপনি যখন না দেখে দ্বিগুন  হিট দেন (২x ব্লাইন্ড) । তখন আপনার একাউন্ট এ পর্যাপ্ত ব্যালান্স ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি পরাজিত হন। `,
                                                    english: `Double hits when you are blind (1x blind). Then your account did not have sufficient balance. As the comparison is on in the game. Your card is compared to everyone else. And you lose.`
                                                });
                                                return newInfo;
                                        }else{
                                            return info;
                                        }
                                    })
                                let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                if(resetPlaying.length > 1){
                                    // checking passed
                                    let myRoomNewRound = myRoomResult.round;
                                    let currentPlayingIndex = resetPlaying.findIndex((info)=> info.userId === myRoomResult.nextId);
                                    if(currentPlayingIndex === 0){
                                        myRoomNewRound = myRoomNewRound + 1
                                    }
                                    let currentPlaying = resetPlaying[currentPlayingIndex];
                                    let nextPlaying = resetPlaying[currentPlayingIndex+1] ? resetPlaying[currentPlayingIndex+1] : resetPlaying[0];
                                        newPlaying = newPlaying.map((info)=>{
                                            if(info.userId === currentPlaying.userId){
                                                let newInfo = {...info};
                                                    newInfo.isTurn = true;
                                                    newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                    if(newInfo.seen === false && myRoomResult.maxBlindHit === newInfo.blindRound){
                                                        newInfo.seen = true
                                                    }
                                                    return newInfo;
                                            }else{
                                                return info;
                                            }
                                        })
                                        let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                        if(resetPlaying.length > 2){
                                            let currentPlayer = resetPlaying.filter((info)=> info.userId === currentPlaying.userId)[0]; 
                                            let currentPlayerIndex = resetPlaying.findIndex((info)=> info.userId === currentPlayer.userId); 
                                            let prevPlayer = resetPlaying[currentPlayerIndex-1] ? resetPlaying[currentPlayerIndex-1] : resetPlaying[resetPlaying.length - 1];
                                            let prevPlayerIndex = resetPlaying.findIndex((info)=> info.userId === prevPlayer.userId);
                                            let prevPrevPlayer = resetPlaying[prevPlayerIndex-1] ? resetPlaying[prevPlayerIndex-1] : resetPlaying[resetPlaying.length-1]; 
                                            if(prevPrevPlayer.seen && prevPlayer.seen === false && currentPlayer.seen === false){
                                                newPlaying = newPlaying.map((info)=>{
                                                    if(info.userId === currentPlayer.userId){
                                                        return {...info, seen: true}
                                                    }else{
                                                        return info;
                                                    }
                                                })
                                            }
                                        }


                                    try {
                                        let boardUpdateResult = await prisma.board.update({
                                            where: {roomId, id},
                                            data: {
                                                playing: newPlaying,
                                                round: myRoomNewRound,
                                                currentId: currentPlaying.userId,
                                                nextId: nextPlaying.userId
                                            }
                                        })
                                        if(boardUpdateResult && boardUpdateResult?.id > 0){
                                            try {
                                                let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 

                                                    let newRoomInfo = {...boardUpdateResult};
                                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                        delete playingInfo.card;
                                                        return playingInfo;
                                                    });

                                                    resultGetAllConnectedList.forEach((info)=>{
                                                        io.sockets.in(info.socketId).emit('anyoneHitFailButCompareFail',{roomId: myRoomResult.roomId, roomInfo: newRoomInfo })
                                                    });
                                                    res.json({roomId: myRoomResult.roomId, roomInfo: newRoomInfo });
                                                }else{
                                                    next(new Error('Internal server error!'))
                                                }
                                            } catch (error) { 
                                                next(new Error(error.message))
                                            }
                                        }else{
                                            next(new Error('Internal server error while updating board'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    }
                                }else{
                                    // checking passed
                                    let winnerPlaying = resetPlaying[0];
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === winnerPlaying.userId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = false;
                                                newInfo.packed = true; 
                                                newInfo.packedReasonMess.push({
                                                    bengali: `আপনি খেলার প্রধান বিজয়ী `,
                                                    english: `You are the main winner of the game`
                                                });
                                                return newInfo;
                                        }else{
                                            return info;
                                        }
                                    });
                                    try {
                                        let userBalanceUpdateResult = await prisma.user.update({
                                            where:{userId: winnerPlaying.userId},
                                            data: {
                                                [`${myRoomResult.balanceType.toLowerCase()}Balance`]: {increment: myRoomResult.currentBalance}
                                            }
                                        })
                                        if(userBalanceUpdateResult && userBalanceUpdateResult?.id > 0){
                                                let recentTxrId = uid(8); 
                                                let boardTransaction = {
                                                    typeName: 'GAME WIN BY BLIND 2X COMPARE WIN',
                                                    isIn: 'IN',
                                                    amount: myRoomResult.currentBalance,
                                                    txrId: recentTxrId,
                                                    userId: winnerPlaying.userId,
                                                    sourceId: winnerPlaying.referralCode,
                                                    balanceType: myRoomResult.balanceType.toUpperCase()
                                                }
                                                try {
                                                    let transactionCreateResult = await prisma.transaction.create({
                                                        data: boardTransaction
                                                    })
                                                    if(transactionCreateResult && transactionCreateResult?.id > 0){
                                                        let myRoomUpdateResult = await prisma.board.update({
                                                            where:{roomId, id},
                                                            data:{
                                                                playing: [],
                                                                totalBalance: 0,
                                                                currentBalance: 0,
                                                                currentCommission: 0,
                                                                round: 0,
                                                                currentId: 'false',
                                                                nextId: 'false',
                                                                previousId: 'false',
                                                                isStart: 'false',
                                                                blind: myRoomResult.rootBlind,
                                                                chaal: myRoomResult.rootChaal,
                                                                rootBlind: 0,
                                                                rootChaal: 0,
                                                                cardViewTill: new Date(new Date().setMilliseconds(40000)),
                                                            }
                                                        });
                                                        if(myRoomUpdateResult && myRoomUpdateResult.id > 0){
                                                            try {
                                                                let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                                if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                    let newRoomInfo = {...myRoomUpdateResult};
                                                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                        delete playingInfo.card;
                                                                        return playingInfo;
                                                                    });
                                                                    resultGetAllConnectedList.forEach((info)=>{
                                                                        io.sockets.in(info.socketId).emit('boardFinish',{roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance), playingInfo: newPlaying})
                                                                    });
                                                                    res.json({roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance), playingInfo: newPlaying});
                                                                }else{
                                                                    next(new Error('Internal server error!'))
                                                                }
                                                            } catch (error) { 
                                                                next(new Error(error.message))
                                                            }
                                                        }else{
                                                            next(new Error('Internal server error while updating my board'))
                                                        }
                                                    }else{
                                                        next( new Error('Internal server error while create transaction'))
                                                    }
                                                } catch (error) {
                                                    next(new Error(error.message))
                                                }
                                        }else{
                                            next(new Error('Internal server error while user balance update'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    }
                                }
                            }
                        }
                    }else{
                        next(new Error('Internal server error while finding my user data'))
                    }
                } catch (error) {
                    next(new Error(error.message))
                }
            }else{
                next(new Error('Internal server error while find my room'))
            }
        } catch (error) {
            next(new Error(error.message))
        }
    }else{
        next(new Error('Internal server error!'))
    }
});
const handleChaalOneExe = asyncHandler(async(req, res, next)=>{
    let {roomId, userId, id} = req.body;
    if(roomId && userId && id){
        try {
            let myRoomResult = await prisma.board.findUnique({
                where: {roomId}
            })
            if(myRoomResult && myRoomResult?.id > 0 && myRoomResult.isStart === 'true' && myRoomResult.currentId === userId){
                try {
                    let myUserInfo = await prisma.user.findUnique({
                        where: {userId}
                    })
                    if(myUserInfo && myUserInfo?.id > 0){
                        if(Number(myRoomResult.chaal) <= Number(myUserInfo[`${myRoomResult.balanceType.toLowerCase()}Balance`])){
                            let myUserUpdateResult = await prisma.user.update({
                                where: {userId},
                                data: {
                                    [`${myRoomResult.balanceType.toLowerCase()}Balance`]: {decrement: Number(myRoomResult.chaal)}
                                }
                            })
                            if(myUserUpdateResult && myUserUpdateResult?.id > 0){
                                let newPlaying = [...myRoomResult.playing];
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === userId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = false;
                                                newInfo.seenRound = Number(newInfo.seenRound) + 1;
                                                newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                if(myRoomResult.maxChaalHit === newInfo.seenRound){
                                                    newInfo.side = true;
                                                }
                                                return newInfo
                                        }else{
                                            return info
                                        }
                                    });
                                let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                let myRoomNewRound = myRoomResult.round;
                                let currentPlayingIndex = resetPlaying.findIndex((info)=> info.userId === myRoomResult.nextId);
                                if(currentPlayingIndex === 0){
                                    myRoomNewRound = myRoomNewRound + 1
                                }
                                let currentPlaying = resetPlaying[currentPlayingIndex];
                                let nextPlaying = resetPlaying[currentPlayingIndex+1] ? resetPlaying[currentPlayingIndex+1] : resetPlaying[0];
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === currentPlaying.userId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = true;
                                                newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                return newInfo;
                                        }else{
                                            return info;
                                        }
                                    })
                                try {
                                    let NBT = myRoomResult.balanceType.toLowerCase();

                                    // commission calculating start
                                    let totalBalance = Number(myRoomResult.chaal)
                                    let currentCommission = (totalBalance / 100) * Number(process.env[`${NBT}BoardFee`]);
                                    let currentBalance = (totalBalance / 100) * (100 - Number(process.env[`${NBT}BoardFee`]));
                                    let totalAppCommission = currentCommission / 2;
                                    let totalPartnerCommission = currentCommission / 2;
                                    // commission calculating end

                                    let allUserTransaction = [];
                                    let recentTxrId = uid(8); 
                                    let boardTransaction = {
                                        typeName: 'CHAAL 1X',
                                        isIn: 'OUT',
                                        amount: (Number(myRoomResult.chaal) / 100) * (100 - Number(process.env[`${NBT}BoardFee`])),
                                        txrId: recentTxrId,
                                        userId: myUserInfo.userId,
                                        sourceId: myUserInfo.referralCode,
                                        balanceType:  NBT.toUpperCase()
                                    }
                                    let boardFeeCommission = {
                                        typeName: 'CHAAL 1X COMMISSION',
                                        isIn: 'OUT',
                                        amount: (Number(myRoomResult.chaal) / 100) * Number(process.env[`${NBT}BoardFee`]),
                                        txrId: recentTxrId,
                                        userId: myUserInfo.userId,
                                        sourceId: myUserInfo.referralCode,
                                        balanceType:  NBT.toUpperCase()
                                    }
                                    let boardFeeAppCommission = {
                                        typeName: 'CHAAL 1X COMMISSION',
                                        isIn: 'IN',
                                        amount: (Number(myRoomResult.chaal) / 100) * (Number(process.env[`${NBT}BoardFee`]) / 2),
                                        txrId: recentTxrId,
                                        userId: '999999999999',
                                        sourceId: myUserInfo.userId,
                                        balanceType:  NBT.toUpperCase()
                                    }
                                    let boardFeePartnerCommission = {
                                        typeName: 'CHAAL 1X COMMISSION',
                                        isIn: 'IN',
                                        amount: (Number(myRoomResult.chaal) / 100) * (Number(process.env[`${NBT}BoardFee`]) / 2),
                                        txrId: recentTxrId,
                                        userId: myUserInfo.referralCode,
                                        sourceId: myUserInfo.userId,
                                        balanceType:  NBT.toUpperCase()
                                    }
                                    if(boardTransaction.amount > 0){
                                        allUserTransaction.push(boardTransaction);
                                    }
                                    if(boardFeeCommission.amount > 0){
                                        allUserTransaction.push(boardFeeCommission)
                                    }
                                    if(boardFeeAppCommission.amount > 0){
                                        allUserTransaction.push(boardFeeAppCommission)
                                    }   
                                    if(boardFeePartnerCommission.amount > 0){
                                        allUserTransaction.push(boardFeePartnerCommission)
                                    }
                                    let myTransactionCreateResult = await prisma.transaction.createMany({data: allUserTransaction});
                                    if(myTransactionCreateResult && myTransactionCreateResult.count > 0){
                                        let rootAssetUpdateResult = await prisma.rootasset.update({
                                            where:{id: 1},
                                            data:{   
                                                [`${NBT}TotalCommission`]: {increment: currentCommission},
                                                [`${NBT}TotalAppCommission`]: {increment: totalAppCommission},
                                                [`${NBT}TotalPartnerCommission`]: {increment: totalPartnerCommission}
                                            }
                                        }) 
                                        if(rootAssetUpdateResult && rootAssetUpdateResult?.id > 0){
                                            
                                            try {
                                                let myRoomUpdateResult = await prisma.board.update({
                                                    where: {roomId, id},
                                                    data: {
                                                        playing: newPlaying,
                                                        totalBalance: {increment: totalBalance},
                                                        currentBalance: {increment: currentBalance},
                                                        currentCommission: {increment: currentCommission},
                                                        currentId: currentPlaying.userId,
                                                        nextId: nextPlaying.userId,
                                                        round: myRoomNewRound
                                                    }
                                                })
                                                if(myRoomUpdateResult && myRoomUpdateResult?.id > 0){
                                                    try {
                                                        let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                        if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                            let newRoomInfo = {...myRoomUpdateResult};
                                                            newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                delete playingInfo.card;
                                                                return playingInfo;
                                                            });
                                                            resultGetAllConnectedList.forEach((info)=>{
                                                                io.sockets.in(info.socketId).emit('anyoneHitSuccess',{roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.chaal)})
                                                            });
                                                            res.json({roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.chaal)});
                                                        }else{
                                                            next(new Error('Internal server error!'))
                                                        }
                                                    } catch (error) { 
                                                        next(new Error(error.message))
                                                    }
                                                }else{
                                                    next(new Error('Internal server error while updating board info'))
                                                }
                                            } catch (error) {
                                                next(new Error(error.message))
                                            }
                                        }else{
                                            next(new Error('Internal server error while updating root asset'))
                                        }
                                    }else{
                                        next(new Error('Internal server error while creating my transaction'))
                                    }
                                } catch (error) {
                                    next(new Error(error.message))
                                }
                            }else{
                                next(new Error('Internal server error while decrementing user balance'))
                            }
                        }else{ 
                            let currentUser = myRoomResult.playing.filter((info)=> info.userId === userId)[0];
                            let winnerResult = cardUtils.cardCompareHandler(myRoomResult, currentUser);
                            if(myRoomResult.compare === 'true' && winnerResult){
                                let newPlaying = [...myRoomResult.playing];
                                newPlaying = newPlaying.map((info)=>{
                                    if(info.userId === userId){
                                        let newInfo = {...info};
                                            newInfo.isTurn = false;
                                            newInfo.packed = true;
                                            newInfo.packedReasonMess.push({
                                                bengali: `আপনি যখন দেখে হিট দেন (১x chaal ) । তখন আপনার একাউন্ট এ পর্যাপ্ত ব্যালান্স ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি বিজয়ী হন। `,
                                                english: `Hit when you see (1x chaal). Then your account did not have sufficient balance. As the comparison is on in the game. Your card is compared to everyone else. And you win.`
                                            });
                                            return newInfo;
                                    }else{
                                        return info;
                                    }
                                })
                                let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                if(resetPlaying.length > 1){
                                    // checking passed
                                    let myRoomNewRound = myRoomResult.round;
                                    let currentPlayingIndex = resetPlaying.findIndex((info)=> info.userId === myRoomResult.nextId);
                                    if(currentPlayingIndex === 0){
                                        myRoomNewRound = myRoomNewRound + 1
                                    }
                                    let currentPlaying = resetPlaying[currentPlayingIndex];
                                    let nextPlaying = resetPlaying[currentPlayingIndex+1] ? resetPlaying[currentPlayingIndex+1] : resetPlaying[0];
                                        newPlaying = newPlaying.map((info)=>{
                                            if(info.userId === currentPlaying.userId){
                                                let newInfo = {...info};
                                                    newInfo.isTurn = true;
                                                    newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                    if(myRoomResult.maxChaalHit === newInfo.seenRound){
                                                        newInfo.side = true
                                                    }
                                                    return newInfo;
                                            }else{
                                                return info;
                                            }
                                        })
                                    try {
                                        let boardUpdateResult = await prisma.board.update({
                                            where: {roomId, id},
                                            data: {
                                                playing: newPlaying,
                                                round: myRoomNewRound,
                                                currentId: currentPlaying.userId,
                                                nextId: nextPlaying.userId,
                                                currentBalance: 0,
                                                currentCommission: 0,
                                                totalBalance: 0
                                            }
                                        })
                                        if(boardUpdateResult && boardUpdateResult?.id > 0){
                                            try {
                                                let myUserUpdateResult = await prisma.user.update({
                                                    where: {userId},
                                                    data: {
                                                        [`${myRoomResult.balanceType.toLowerCase()}Balance`]: {increment: Number(myRoomResult.currentBalance)}
                                                    }
                                                })
                                                if(myUserUpdateResult && myUserUpdateResult?.id > 0){
                                                    let recentTxrId = uid(8); 
                                                    let userWinTransaction = {
                                                        typeName: 'GAME WIN BY CHAAL 1X COMPARE WIN',
                                                        isIn: 'IN',
                                                        amount: myRoomResult.currentBalance,
                                                        txrId: recentTxrId,
                                                        userId: currentUser.userId,
                                                        sourceId: currentUser.referralCode,
                                                        balanceType: myRoomResult.balanceType.toUpperCase()
                                                    }
                                                    try {
                                                        let userTransactionUpdate = await prisma.transaction.create({
                                                            data: userWinTransaction
                                                        })
                                                        if(userTransactionUpdate && userTransactionUpdate.id > 0){
                                                            try {
                                                                let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                                if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                    let newRoomInfo = {...boardUpdateResult};
                                                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                        delete playingInfo.card;
                                                                        return playingInfo;
                                                                    });
                                                                    resultGetAllConnectedList.forEach((info)=>{
                                                                        io.sockets.in(info.socketId).emit('anyoneHitFailButCompareWin',{roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.currentBalance)})
                                                                    });
                                                                    res.json({roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.currentBalance)});
                                                                }else{
                                                                    next(new Error('Internal server error!'))
                                                                }
                                                            } catch (error) { 
                                                                next(new Error(error.message))
                                                            }
                                                        }else{
                                                            next(new Error('Internal server error while creating user win transaction!'))
                                                        }
                                                    } catch (error) {
                                                        next(new Error(error.message))
                                                    }
                                                }else{
                                                    next(new Error('Internal server error while updating my winning account balance!'))
                                                }
                                            } catch (error) {
                                                next(new Error(error.message))
                                            } 
                                        }else{
                                            next(new Error('Internal server error while updating board'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    }
                                }else{
                                    // checking passed
                                    let winnerPlaying = newPlaying.filter((info)=> info.userId === userId)[0];
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === winnerPlaying.userId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = false;
                                                newInfo.packed = true; 
                                                newInfo.packedReasonMess.push({
                                                    bengali: `আপনি খেলার প্রধান বিজয়ী `,
                                                    english: `You are the main winner of the game`
                                                });
                                                return newInfo;
                                        }else{
                                            return info;
                                        }
                                    })
                                    try {
                                        let userBalanceUpdateResult = await prisma.user.update({
                                            where:{userId: winnerPlaying.userId},
                                            data: {
                                                [`${myRoomResult.balanceType.toLowerCase()}Balance`]: {increment: myRoomResult.currentBalance}
                                            }
                                        })
                                        if(userBalanceUpdateResult && userBalanceUpdateResult?.id > 0){
                                                let recentTxrId = uid(8); 
                                                let boardTransaction = {
                                                    typeName: 'GAME WIN BY CHAAL 1X COMPARE WIN',
                                                    isIn: 'IN',
                                                    amount: myRoomResult.currentBalance,
                                                    txrId: recentTxrId,
                                                    userId: winnerPlaying.userId,
                                                    sourceId: winnerPlaying.referralCode,
                                                    balanceType: myRoomResult.balanceType.toUpperCase()
                                                }
                                                try {
                                                    let transactionCreateResult = await prisma.transaction.create({
                                                        data: boardTransaction
                                                    })
                                                    if(transactionCreateResult && transactionCreateResult?.id > 0){
                                                        let myRoomUpdateResult = await prisma.board.update({
                                                            where:{roomId, id},
                                                            data:{
                                                                playing: [],
                                                                totalBalance: 0,
                                                                currentBalance: 0,
                                                                currentCommission: 0,
                                                                round: 0,
                                                                currentId: 'false',
                                                                nextId: 'false',
                                                                previousId: 'false',
                                                                isStart: 'false',
                                                                blind: myRoomResult.rootBlind,
                                                                chaal: myRoomResult.rootChaal,
                                                                rootBlind: 0,
                                                                rootChaal: 0,
                                                                cardViewTill: new Date(new Date().setMilliseconds(40000)),
                                                            }
                                                        });
                                                        if(myRoomUpdateResult && myRoomUpdateResult.id > 0){
                                                            try {
                                                                let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                                if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                                    let newRoomInfo = {...myRoomUpdateResult};
                                                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                        delete playingInfo.card;
                                                                        return playingInfo;
                                                                    });
                                                                    resultGetAllConnectedList.forEach((info)=>{
                                                                        io.sockets.in(info.socketId).emit('boardFinish',{roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.currentBalance), playingInfo: newPlaying})
                                                                    });
                                                                    res.json({roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.currentBalance), playingInfo: newPlaying});
                                                                }else{
                                                                    next(new Error('Internal server error!'))
                                                                }
                                                            } catch (error) { 
                                                                next(new Error(error.message))
                                                            }
                                                        }else{
                                                            next(new Error('Internal server error while updating my board'))
                                                        }
                                                    }else{
                                                        next( new Error('Internal server error while create transaction'))
                                                    }
                                                } catch (error) {
                                                    next(new Error(error.message))
                                                }
                                        }else{
                                            next(new Error('Internal server error while user balance update'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    }
                                }
                            }else{
                                let newPlaying = [...myRoomResult.playing];
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === userId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = false;
                                                newInfo.packed = true;
                                                newInfo.packedReasonMess.push({
                                                    bengali: `আপনি যখন দেখে হিট দেন (১x chaal ) । তখন আপনার একাউন্ট এ পর্যাপ্ত ব্যালান্স ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি পরাজিত হন। `,
                                                    english: `Hit when you see (1x chaal). Then your account did not have sufficient balance. As the comparison is on in the game. Your card is compared to everyone else. And you lose.`
                                                });
                                                return newInfo;
                                        }else{
                                            return info;
                                        }
                                    })
                                let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                if(resetPlaying.length > 1){
                                    // checking passed
                                    let myRoomNewRound = myRoomResult.round;
                                    let currentPlayingIndex = resetPlaying.findIndex((info)=> info.userId === myRoomResult.nextId);
                                    if(currentPlayingIndex === 0){
                                        myRoomNewRound = myRoomNewRound + 1
                                    }
                                    let currentPlaying = resetPlaying[currentPlayingIndex];
                                    let nextPlaying = resetPlaying[currentPlayingIndex+1] ? resetPlaying[currentPlayingIndex+1] : resetPlaying[0];
                                        newPlaying = newPlaying.map((info)=>{
                                            if(info.userId === currentPlaying.userId){
                                                let newInfo = {...info};
                                                    newInfo.isTurn = true;
                                                    newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                    if(myRoomResult.maxChaalHit === newInfo.seenRound){
                                                        newInfo.side = true
                                                    }
                                                    return newInfo;
                                            }else{
                                                return info;
                                            }
                                        })
                                    try {
                                        let boardUpdateResult = await prisma.board.update({
                                            where: {roomId, id},
                                            data: {
                                                playing: newPlaying,
                                                round: myRoomNewRound,
                                                currentId: currentPlaying.userId,
                                                nextId: nextPlaying.userId
                                            }
                                        })
                                        if(boardUpdateResult && boardUpdateResult?.id > 0){
                                            try {
                                                let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 

                                                    let newRoomInfo = {...boardUpdateResult};
                                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                        delete playingInfo.card;
                                                        return playingInfo;
                                                    });

                                                    resultGetAllConnectedList.forEach((info)=>{
                                                        io.sockets.in(info.socketId).emit('anyoneHitFailButCompareFail',{roomId: myRoomResult.roomId, roomInfo: newRoomInfo })
                                                    });
                                                    res.json({roomId: myRoomResult.roomId, roomInfo: newRoomInfo });
                                                }else{
                                                    next(new Error('Internal server error!'))
                                                }
                                            } catch (error) { 
                                                next(new Error(error.message))
                                            }
                                        }else{
                                            next(new Error('Internal server error while updating board'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    }
                                }else{
                                    // checking passed
                                    let winnerPlaying = resetPlaying[0];
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === winnerPlaying.userId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = false;
                                                newInfo.packed = true; 
                                                newInfo.packedReasonMess.push({
                                                    bengali: `আপনি খেলার প্রধান বিজয়ী `,
                                                    english: `You are the main winner of the game`
                                                });
                                                return newInfo;
                                        }else{
                                            return info;
                                        }
                                    })
                                    try {
                                        let userBalanceUpdateResult = await prisma.user.update({
                                            where:{userId: winnerPlaying.userId},
                                            data: {
                                                [`${myRoomResult.balanceType.toLowerCase()}Balance`]: {increment: myRoomResult.currentBalance}
                                            }
                                        })
                                        if(userBalanceUpdateResult && userBalanceUpdateResult?.id > 0){
                                                let recentTxrId = uid(8); 
                                                let boardTransaction = {
                                                    typeName: 'GAME WIN BY CHAAL 1X COMPARE WIN',
                                                    isIn: 'IN',
                                                    amount: myRoomResult.currentBalance,
                                                    txrId: recentTxrId,
                                                    userId: winnerPlaying.userId,
                                                    sourceId: winnerPlaying.referralCode,
                                                    balanceType: myRoomResult.balanceType.toUpperCase()
                                                }
                                                try {
                                                    let transactionCreateResult = await prisma.transaction.create({
                                                        data: boardTransaction
                                                    })
                                                    if(transactionCreateResult && transactionCreateResult?.id > 0){
                                                        let myRoomUpdateResult = await prisma.board.update({
                                                            where:{roomId, id},
                                                            data:{
                                                                playing: [],
                                                                totalBalance: 0,
                                                                currentBalance: 0,
                                                                currentCommission: 0,
                                                                round: 0,
                                                                currentId: 'false',
                                                                nextId: 'false',
                                                                previousId: 'false',
                                                                isStart: 'false',
                                                                blind: myRoomResult.rootBlind,
                                                                chaal: myRoomResult.rootChaal,
                                                                rootBlind: 0,
                                                                rootChaal: 0,
                                                                cardViewTill: new Date(new Date().setMilliseconds(40000)),
                                                            }
                                                        });
                                                        if(myRoomUpdateResult && myRoomUpdateResult.id > 0){
                                                            try {
                                                                let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                                if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 

                                                                    let newRoomInfo = {...myRoomUpdateResult};
                                                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                        delete playingInfo.card;
                                                                        return playingInfo;
                                                                    });

                                                                    resultGetAllConnectedList.forEach((info)=>{
                                                                        io.sockets.in(info.socketId).emit('boardFinish',{roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance), playingInfo: newPlaying})
                                                                    });
                                                                    res.json({roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance), playingInfo: newPlaying});
                                                                }else{
                                                                    next(new Error('Internal server error!'))
                                                                }
                                                            } catch (error) { 
                                                                next(new Error(error.message))
                                                            }
                                                        }else{
                                                            next(new Error('Internal server error while updating my board'))
                                                        }
                                                    }else{
                                                        next( new Error('Internal server error while create transaction'))
                                                    }
                                                } catch (error) {
                                                    next(new Error(error.message))
                                                }
                                        }else{
                                            next(new Error('Internal server error while user balance update'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    }
                                }
                            }
                        }
                    }else{
                        next(new Error('Internal server error while finding my user data'))
                    }
                } catch (error) {
                    next(new Error(error.message))
                }
            }else{
                next(new Error('Internal server error while find my room'))
            }
        } catch (error) {
            next(new Error(error.message))
        }
    }else{
        next(new Error('Internal server error!'))
    }
});
const handleChaalTwoExe = asyncHandler(async(req, res, next)=>{
    let {roomId, userId, id} = req.body;
    if(roomId && userId && id){
        try {
            let myRoomResult = await prisma.board.findUnique({
                where: {roomId}
            })
            if(myRoomResult && myRoomResult?.id > 0 && myRoomResult.increase === 'true' && myRoomResult.isStart === 'true' && myRoomResult.currentId === userId){
                try {
                    let myUserInfo = await prisma.user.findUnique({
                        where: {userId}
                    })
                    if(myUserInfo && myUserInfo?.id > 0){
                        if(Number(myRoomResult.chaal) * 2 <= Number(myUserInfo[`${myRoomResult.balanceType.toLowerCase()}Balance`])){
                            let myUserUpdateResult = await prisma.user.update({
                                where: {userId},
                                data: {
                                    [`${myRoomResult.balanceType.toLowerCase()}Balance`]: {decrement: Number(myRoomResult.chaal) * 2}
                                }
                            })
                            if(myUserUpdateResult && myUserUpdateResult?.id > 0){
                                let newPlaying = [...myRoomResult.playing];
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === userId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = false;
                                                newInfo.seenRound = Number(newInfo.seenRound) + 1;
                                                newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                if(myRoomResult.maxChaalHit === newInfo.seenRound){
                                                    newInfo.side = true;
                                                }
                                                return newInfo
                                        }else{
                                            return info
                                        }
                                    });
                                let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                let myRoomNewRound = myRoomResult.round;
                                let currentPlayingIndex = resetPlaying.findIndex((info)=> info.userId === myRoomResult.nextId);
                                if(currentPlayingIndex === 0){
                                    myRoomNewRound = myRoomNewRound + 1
                                }
                                let currentPlaying = resetPlaying[currentPlayingIndex];
                                let nextPlaying = resetPlaying[currentPlayingIndex+1] ? resetPlaying[currentPlayingIndex+1] : resetPlaying[0];
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === currentPlaying.userId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = true;
                                                newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                return newInfo;
                                        }else{
                                            return info;
                                        }
                                    })
                                try {
                                    let NBT = myRoomResult.balanceType.toLowerCase();

                                    // commission calculating start
                                    let totalBalance = Number(myRoomResult.chaal) * 2
                                    let currentCommission = (totalBalance / 100) * Number(process.env[`${NBT}BoardFee`]);
                                    let currentBalance = (totalBalance / 100) * (100 - Number(process.env[`${NBT}BoardFee`]));
                                    let totalAppCommission = currentCommission / 2;
                                    let totalPartnerCommission = currentCommission / 2;
                                    // commission calculating end

                                    let allUserTransaction = [];
                                    let recentTxrId = uid(8); 
                                    let boardTransaction = {
                                        typeName: 'CHAAL 2X',
                                        isIn: 'OUT',
                                        amount: ((Number(myRoomResult.chaal) * 2) / 100) * (100 - Number(process.env[`${NBT}BoardFee`])),
                                        txrId: recentTxrId,
                                        userId: myUserInfo.userId,
                                        sourceId: myUserInfo.referralCode,
                                        balanceType:  NBT.toUpperCase()
                                    }
                                    let boardFeeCommission = {
                                        typeName: 'CHAAL 2X COMMISSION',
                                        isIn: 'OUT',
                                        amount: ((Number(myRoomResult.chaal) * 2) / 100) * Number(process.env[`${NBT}BoardFee`]),
                                        txrId: recentTxrId,
                                        userId: myUserInfo.userId,
                                        sourceId: myUserInfo.referralCode,
                                        balanceType:  NBT.toUpperCase()
                                    }
                                    let boardFeeAppCommission = {
                                        typeName: 'CHAAL 2X COMMISSION',
                                        isIn: 'IN',
                                        amount: ((Number(myRoomResult.chaal) * 2) / 100) * (Number(process.env[`${NBT}BoardFee`]) / 2),
                                        txrId: recentTxrId,
                                        userId: '999999999999',
                                        sourceId: myUserInfo.userId,
                                        balanceType:  NBT.toUpperCase()
                                    }
                                    let boardFeePartnerCommission = {
                                        typeName: 'CHAAL 2X COMMISSION',
                                        isIn: 'IN',
                                        amount: ((Number(myRoomResult.chaal) * 2) / 100) * (Number(process.env[`${NBT}BoardFee`]) / 2),
                                        txrId: recentTxrId,
                                        userId: myUserInfo.referralCode,
                                        sourceId: myUserInfo.userId,
                                        balanceType:  NBT.toUpperCase()
                                    }
                                    if(boardTransaction.amount > 0){
                                        allUserTransaction.push(boardTransaction);
                                    }
                                    if(boardFeeCommission.amount > 0){
                                        allUserTransaction.push(boardFeeCommission)
                                    }
                                    if(boardFeeAppCommission.amount > 0){
                                        allUserTransaction.push(boardFeeAppCommission)
                                    }   
                                    if(boardFeePartnerCommission.amount > 0){
                                        allUserTransaction.push(boardFeePartnerCommission)
                                    }
                                    let myTransactionCreateResult = await prisma.transaction.createMany({data: allUserTransaction});
                                    if(myTransactionCreateResult && myTransactionCreateResult.count > 0){
                                        let rootAssetUpdateResult = await prisma.rootasset.update({
                                            where:{id: 1},
                                            data:{   
                                                [`${NBT}TotalCommission`]: {increment: currentCommission},
                                                [`${NBT}TotalAppCommission`]: {increment: totalAppCommission},
                                                [`${NBT}TotalPartnerCommission`]: {increment: totalPartnerCommission}
                                            }
                                        }) 
                                        if(rootAssetUpdateResult && rootAssetUpdateResult?.id > 0){
                                            try {
                                                let myRoomUpdateResult = await prisma.board.update({
                                                    where: {roomId, id},
                                                    data: {
                                                        playing: newPlaying,
                                                        totalBalance: {increment: totalBalance},
                                                        currentBalance: {increment: currentBalance},
                                                        currentCommission: {increment: currentCommission},
                                                        currentId: currentPlaying.userId,
                                                        nextId: nextPlaying.userId,
                                                        round: myRoomNewRound,
                                                        blind: Number(myRoomResult.blind) * 2,
                                                        chaal: Number(myRoomResult.chaal) * 2
                                                    }
                                                })
                                                if(myRoomUpdateResult && myRoomUpdateResult?.id > 0){
                                                    try {
                                                        let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                        if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 

                                                            let newRoomInfo = {...myRoomUpdateResult};
                                                            newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                delete playingInfo.card;
                                                                return playingInfo;
                                                            })

                                                            resultGetAllConnectedList.forEach((info)=>{
                                                                io.sockets.in(info.socketId).emit('anyoneHitSuccess',{roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.chaal)*2})
                                                            });
                                                            res.json({roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.chaal)*2});
                                                        }else{
                                                            next(new Error('Internal server error!'))
                                                        }
                                                    } catch (error) { 
                                                        next(new Error(error.message))
                                                    }
                                                }else{
                                                    next(new Error('Internal server error while updating board info'))
                                                }
                                            } catch (error) {
                                                next(new Error(error.message))
                                            }
                                        }else{
                                            next(new Error('Internal server error while updating root asset'))
                                        }
                                    }else{
                                        next(new Error('Internal server error while creating my transaction'))
                                    }
                                } catch (error) {
                                    next(new Error(error.message))
                                }
                            }else{
                                next(new Error('Internal server error while decrementing user balance'))
                            }
                        }else{ 
                            let currentUser = myRoomResult.playing.filter((info)=> info.userId === userId)[0];
                            let winnerResult = cardUtils.cardCompareHandler(myRoomResult, currentUser);
                            if(myRoomResult.compare === 'true' && winnerResult){
                                let newPlaying = [...myRoomResult.playing];
                                newPlaying = newPlaying.map((info)=>{
                                    if(info.userId === userId){
                                        let newInfo = {...info};
                                            newInfo.isTurn = false;
                                            newInfo.packed = true;
                                            newInfo.packedReasonMess.push({
                                                bengali: `আপনি যখন দেখে দ্বিগুন  হিট দেন (২x chaal ) । তখন আপনার একাউন্ট এ পর্যাপ্ত ব্যালান্স ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি বিজয়ী হন। `,
                                                english: `Give double hit when you see (2x chaal). Then your account did not have sufficient balance. As the comparison is on in the game. Your card is compared to everyone else. And you win.`
                                            });
                                            return newInfo;
                                    }else{
                                        return info;
                                    }
                                })
                                let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                if(resetPlaying.length > 1){
                                    // checking passed
                                    let myRoomNewRound = myRoomResult.round;
                                    let currentPlayingIndex = resetPlaying.findIndex((info)=> info.userId === myRoomResult.nextId);
                                    if(currentPlayingIndex === 0){
                                        myRoomNewRound = myRoomNewRound + 1
                                    }
                                    let currentPlaying = resetPlaying[currentPlayingIndex];
                                    let nextPlaying = resetPlaying[currentPlayingIndex+1] ? resetPlaying[currentPlayingIndex+1] : resetPlaying[0];
                                        newPlaying = newPlaying.map((info)=>{
                                            if(info.userId === currentPlaying.userId){
                                                let newInfo = {...info};
                                                    newInfo.isTurn = true;
                                                    newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                    if(myRoomResult.maxChaalHit === newInfo.seenRound){
                                                        newInfo.side = true
                                                    }
                                                    return newInfo;
                                            }else{
                                                return info;
                                            }
                                        })
                                    try {
                                        let boardUpdateResult = await prisma.board.update({
                                            where: {roomId, id},
                                            data: {
                                                playing: newPlaying,
                                                round: myRoomNewRound,
                                                currentId: currentPlaying.userId,
                                                nextId: nextPlaying.userId,
                                                currentBalance: 0,
                                                currentCommission: 0,
                                                totalBalance: 0
                                            }
                                        })
                                        if(boardUpdateResult && boardUpdateResult?.id > 0){
                                            try {
                                                let myUserUpdateResult = await prisma.user.update({
                                                    where: {userId},
                                                    data: {
                                                        [`${myRoomResult.balanceType.toLowerCase()}Balance`]: {increment: Number(myRoomResult.currentBalance)}
                                                    }
                                                })
                                                if(myUserUpdateResult && myUserUpdateResult?.id > 0){
                                                    let recentTxrId = uid(8); 
                                                    let userWinTransaction = {
                                                        typeName: 'GAME WIN BY CHAAL 2X COMPARE WIN',
                                                        isIn: 'IN',
                                                        amount: myRoomResult.currentBalance,
                                                        txrId: recentTxrId,
                                                        userId: currentUser.userId,
                                                        sourceId: currentUser.referralCode,
                                                        balanceType: myRoomResult.balanceType.toUpperCase()
                                                    }
                                                    try {
                                                        let userTransactionUpdate = await prisma.transaction.create({
                                                            data: userWinTransaction
                                                        })
                                                        if(userTransactionUpdate && userTransactionUpdate.id > 0){
                                                            try {
                                                                let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                                if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 

                                                                    let newRoomInfo = {...boardUpdateResult};
                                                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                        delete playingInfo.card;
                                                                        return playingInfo;
                                                                    })

                                                                    resultGetAllConnectedList.forEach((info)=>{
                                                                        io.sockets.in(info.socketId).emit('anyoneHitFailButCompareWin',{roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.currentBalance)})
                                                                    });
                                                                    res.json({roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.currentBalance)});
                                                                }else{
                                                                    next(new Error('Internal server error!'))
                                                                }
                                                            } catch (error) { 
                                                                next(new Error(error.message))
                                                            }
                                                        }else{
                                                            next(new Error('Internal server error while creating user win transaction!'))
                                                        }
                                                    } catch (error) {
                                                        next(new Error(error.message))
                                                    }
                                                }else{
                                                    next(new Error('Internal server error while updating my winning account balance!'))
                                                }
                                            } catch (error) {
                                                next(new Error(error.message))
                                            } 
                                        }else{
                                            next(new Error('Internal server error while updating board'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    }
                                }else{
                                    // checking passed
                                    let winnerPlaying = newPlaying.filter((info)=> info.userId === userId)[0];
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === winnerPlaying.userId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = false;
                                                newInfo.packed = true; 
                                                newInfo.packedReasonMess.push({
                                                    bengali: `আপনি খেলার প্রধান বিজয়ী `,
                                                    english: `You are the main winner of the game`
                                                });
                                                return newInfo;
                                        }else{
                                            return info;
                                        }
                                    })
                                    try {
                                        let userBalanceUpdateResult = await prisma.user.update({
                                            where:{userId: winnerPlaying.userId},
                                            data: {
                                                [`${myRoomResult.balanceType.toLowerCase()}Balance`]: {increment: myRoomResult.currentBalance}
                                            }
                                        })
                                        if(userBalanceUpdateResult && userBalanceUpdateResult?.id > 0){
                                                let recentTxrId = uid(8); 
                                                let boardTransaction = {
                                                    typeName: 'GAME WIN BY CHAAL 2X COMPARE WIN',
                                                    isIn: 'IN',
                                                    amount: myRoomResult.currentBalance,
                                                    txrId: recentTxrId,
                                                    userId: winnerPlaying.userId,
                                                    sourceId: winnerPlaying.referralCode,
                                                    balanceType: myRoomResult.balanceType.toUpperCase()
                                                }
                                                try {
                                                    let transactionCreateResult = await prisma.transaction.create({
                                                        data: boardTransaction
                                                    })
                                                    if(transactionCreateResult && transactionCreateResult?.id > 0){
                                                        let myRoomUpdateResult = await prisma.board.update({
                                                            where:{roomId, id},
                                                            data:{
                                                                playing: [],
                                                                totalBalance: 0,
                                                                currentBalance: 0,
                                                                currentCommission: 0,
                                                                round: 0,
                                                                currentId: 'false',
                                                                nextId: 'false',
                                                                previousId: 'false',
                                                                isStart: 'false',
                                                                blind: myRoomResult.rootBlind,
                                                                chaal: myRoomResult.rootChaal,
                                                                rootBlind: 0,
                                                                rootChaal: 0,
                                                                cardViewTill: new Date(new Date().setMilliseconds(40000)),
                                                            }
                                                        });
                                                        if(myRoomUpdateResult && myRoomUpdateResult.id > 0){
                                                            try {
                                                                let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                                if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 

                                                                    let newRoomInfo = {...myRoomUpdateResult};
                                                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                        delete playingInfo.card;
                                                                        return playingInfo;
                                                                    })

                                                                    resultGetAllConnectedList.forEach((info)=>{
                                                                        io.sockets.in(info.socketId).emit('boardFinish',{roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.currentBalance), playingInfo: newPlaying})
                                                                    });
                                                                    res.json({roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.currentBalance), playingInfo: newPlaying});
                                                                }else{
                                                                    next(new Error('Internal server error!'))
                                                                }
                                                            } catch (error) { 
                                                                next(new Error(error.message))
                                                            }
                                                        }else{
                                                            next(new Error('Internal server error while updating my board'))
                                                        }
                                                    }else{
                                                        next( new Error('Internal server error while create transaction'))
                                                    }
                                                } catch (error) {
                                                    next(new Error(error.message))
                                                }
                                        }else{
                                            next(new Error('Internal server error while user balance update'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    }
                                }
                            }else{
                                let newPlaying = [...myRoomResult.playing];
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === userId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = false;
                                                newInfo.packed = true;
                                                newInfo.packedReasonMess.push({
                                                    bengali: `আপনি যখন দেখে দ্বিগুন  হিট দেন (২x chaal ) । তখন আপনার একাউন্ট এ পর্যাপ্ত ব্যালান্স ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি পরাজিত হন। `,
                                                    english: `Give double hit when you see (2x chaal). Then your account did not have sufficient balance. As the comparison is on in the game. Your card is compared to everyone else. And you lose.`
                                                });
                                                return newInfo;
                                        }else{
                                            return info;
                                        }
                                    })
                                let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                if(resetPlaying.length > 1){
                                    // checking passed
                                    let myRoomNewRound = myRoomResult.round;
                                    let currentPlayingIndex = resetPlaying.findIndex((info)=> info.userId === myRoomResult.nextId);
                                    if(currentPlayingIndex === 0){
                                        myRoomNewRound = myRoomNewRound + 1
                                    }
                                    let currentPlaying = resetPlaying[currentPlayingIndex];
                                    let nextPlaying = resetPlaying[currentPlayingIndex+1] ? resetPlaying[currentPlayingIndex+1] : resetPlaying[0];
                                        newPlaying = newPlaying.map((info)=>{
                                            if(info.userId === currentPlaying.userId){
                                                let newInfo = {...info};
                                                    newInfo.isTurn = true;
                                                    newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                    if(myRoomResult.maxChaalHit === newInfo.seenRound){
                                                        newInfo.side = true
                                                    }
                                                    return newInfo;
                                            }else{
                                                return info;
                                            }
                                        })
                                    try {
                                        let boardUpdateResult = await prisma.board.update({
                                            where: {roomId, id},
                                            data: {
                                                playing: newPlaying,
                                                round: myRoomNewRound,
                                                currentId: currentPlaying.userId,
                                                nextId: nextPlaying.userId
                                            }
                                        })
                                        if(boardUpdateResult && boardUpdateResult?.id > 0){
                                            try {
                                                let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 

                                                    let newRoomInfo = {...boardUpdateResult};
                                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                        delete playingInfo.card;
                                                        return playingInfo;
                                                    })

                                                    resultGetAllConnectedList.forEach((info)=>{
                                                        io.sockets.in(info.socketId).emit('anyoneHitFailButCompareFail',{roomId: myRoomResult.roomId, roomInfo: newRoomInfo })
                                                    });
                                                    res.json({roomId: myRoomResult.roomId, roomInfo: newRoomInfo });
                                                }else{
                                                    next(new Error('Internal server error!'))
                                                }
                                            } catch (error) { 
                                                next(new Error(error.message))
                                            }
                                        }else{
                                            next(new Error('Internal server error while updating board'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    }
                                }else{
                                    // checking passed
                                    let winnerPlaying = resetPlaying[0];
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === winnerPlaying.userId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = false;
                                                newInfo.packed = true; 
                                                newInfo.packedReasonMess.push({
                                                    bengali: `আপনি খেলার প্রধান বিজয়ী `,
                                                    english: `You are the main winner of the game`
                                                });
                                                return newInfo;
                                        }else{
                                            return info;
                                        }
                                    })
                                    try {
                                        let userBalanceUpdateResult = await prisma.user.update({
                                            where:{userId: winnerPlaying.userId},
                                            data: {
                                                [`${myRoomResult.balanceType.toLowerCase()}Balance`]: {increment: myRoomResult.currentBalance}
                                            }
                                        })
                                        if(userBalanceUpdateResult && userBalanceUpdateResult?.id > 0){
                                                let recentTxrId = uid(8); 
                                                let boardTransaction = {
                                                    typeName: 'GAME WIN BY CHAAL 2X COMPARE WIN',
                                                    isIn: 'IN',
                                                    amount: myRoomResult.currentBalance,
                                                    txrId: recentTxrId,
                                                    userId: winnerPlaying.userId,
                                                    sourceId: winnerPlaying.referralCode,
                                                    balanceType: myRoomResult.balanceType.toUpperCase()
                                                }
                                                try {
                                                    let transactionCreateResult = await prisma.transaction.create({
                                                        data: boardTransaction
                                                    })
                                                    if(transactionCreateResult && transactionCreateResult?.id > 0){
                                                        let myRoomUpdateResult = await prisma.board.update({
                                                            where:{roomId, id},
                                                            data:{
                                                                playing: [],
                                                                totalBalance: 0,
                                                                currentBalance: 0,
                                                                currentCommission: 0,
                                                                round: 0,
                                                                currentId: 'false',
                                                                nextId: 'false',
                                                                previousId: 'false',
                                                                isStart: 'false',
                                                                blind: myRoomResult.rootBlind,
                                                                chaal: myRoomResult.rootChaal,
                                                                rootBlind: 0,
                                                                rootChaal: 0,
                                                                cardViewTill: new Date(new Date().setMilliseconds(40000)),
                                                            }
                                                        });
                                                        if(myRoomUpdateResult && myRoomUpdateResult.id > 0){
                                                            try {
                                                                let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                                if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 

                                                                    let newRoomInfo = {...myRoomUpdateResult};
                                                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                        delete playingInfo.card;
                                                                        return playingInfo;
                                                                    })

                                                                    resultGetAllConnectedList.forEach((info)=>{
                                                                        io.sockets.in(info.socketId).emit('boardFinish',{roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance), playingInfo: newPlaying})
                                                                    });
                                                                    res.json({roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance), playingInfo: newPlaying});
                                                                }else{
                                                                    next(new Error('Internal server error!'))
                                                                }
                                                            } catch (error) { 
                                                                next(new Error(error.message))
                                                            }
                                                        }else{
                                                            next(new Error('Internal server error while updating my board'))
                                                        }
                                                    }else{
                                                        next( new Error('Internal server error while create transaction'))
                                                    }
                                                } catch (error) {
                                                    next(new Error(error.message))
                                                }
                                        }else{
                                            next(new Error('Internal server error while user balance update'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    }
                                }
                            }
                        }
                    }else{
                        next(new Error('Internal server error while finding my user data'))
                    }
                } catch (error) {
                    next(new Error(error.message))
                }
            }else{
                next(new Error('Internal server error while find my room'))
            }
        } catch (error) {
            next(new Error(error.message))
        }
    }else{
        next(new Error('Internal server error!'))
    }
});
const handleSideMyCard = asyncHandler(async(req, res, next)=>{
    let {roomId, userId, id} = req.body;
    if(roomId && userId && id){
        try {
            let myRoomResult = await prisma.board.findUnique({
                where: {roomId}
            })
            if(myRoomResult && myRoomResult?.id > 0 && myRoomResult.isStart === 'true' && myRoomResult.currentId === userId){
                try {
                    let myUserInfo = await prisma.user.findUnique({
                        where: {userId}
                    })
                    if(myUserInfo && myUserInfo?.id > 0){
                        if(Number(myRoomResult.blind) <= Number(myUserInfo[`${myRoomResult.balanceType.toLowerCase()}Balance`])){
                            try {
                                let myUserUpdateResult = await prisma.user.update({
                                    where: {userId},
                                    data: {
                                        [`${myRoomResult.balanceType.toLowerCase()}Balance`]: {decrement: Number(myRoomResult.blind)}
                                    }
                                })
                                
                                if(myUserUpdateResult && myUserUpdateResult?.id > 0){
                                    let NBT = myRoomResult.balanceType.toLowerCase();

                                    // commission calculating start
                                    let totalBalance = Number(myRoomResult.blind)
                                    let currentCommission = (totalBalance / 100) * Number(process.env[`${NBT}BoardFee`]);
                                    let currentBalance = (totalBalance / 100) * (100 - Number(process.env[`${NBT}BoardFee`]));
                                    let totalAppCommission = currentCommission / 2;
                                    let totalPartnerCommission = currentCommission / 2;
                                    // commission calculating end

                                    let allUserTransaction = [];
                                    let recentTxrId = uid(8); 
                                    let boardTransaction = {
                                        typeName: 'SIDE CARD',
                                        isIn: 'OUT',
                                        amount:  currentBalance,
                                        txrId: recentTxrId,
                                        userId: myUserInfo.userId,
                                        sourceId: myUserInfo.referralCode,
                                        balanceType:  NBT.toUpperCase()
                                    }
                                    let boardFeeCommission = {
                                        typeName: 'SIDE CARD COMMISSION',
                                        isIn: 'OUT',
                                        amount: currentCommission,
                                        txrId: recentTxrId,
                                        userId: myUserInfo.userId,
                                        sourceId: myUserInfo.referralCode,
                                        balanceType:  NBT.toUpperCase()
                                    }
                                    let boardFeeAppCommission = {
                                        typeName: 'SIDE CARD COMMISSION',
                                        isIn: 'IN',
                                        amount: totalAppCommission,
                                        txrId: recentTxrId,
                                        userId: '999999999999',
                                        sourceId: myUserInfo.userId,
                                        balanceType:  NBT.toUpperCase()
                                    }
                                    let boardFeePartnerCommission = {
                                        typeName: 'SIDE CARD COMMISSION',
                                        isIn: 'IN',
                                        amount: totalPartnerCommission,
                                        txrId: recentTxrId,
                                        userId: myUserInfo.referralCode,
                                        sourceId: myUserInfo.userId,
                                        balanceType:  NBT.toUpperCase()
                                    }
                                    if(boardTransaction.amount > 0){
                                        allUserTransaction.push(boardTransaction);
                                    }
                                    if(boardFeeCommission.amount > 0){
                                        allUserTransaction.push(boardFeeCommission)
                                    }
                                    if(boardFeeAppCommission.amount > 0){
                                        allUserTransaction.push(boardFeeAppCommission)
                                    }   
                                    if(boardFeePartnerCommission.amount > 0){
                                        allUserTransaction.push(boardFeePartnerCommission)
                                    }

                                    try {
                                        let myTransactionCreateResult = await prisma.transaction.createMany({data: allUserTransaction});
                                        if(myTransactionCreateResult && myTransactionCreateResult?.count > 0){
                                            try {
                                                let rootAssetUpdateResult = await prisma.rootasset.update({
                                                    where: {id: 1},
                                                    data: {
                                                        [`${NBT}TotalCommission`]: {increment: currentCommission},
                                                        [`${NBT}TotalAppCommission`]: {increment: totalAppCommission},
                                                        [`${NBT}TotalPartnerCommission`]: {increment: totalPartnerCommission}
                                                    }
                                                })
                                                if(rootAssetUpdateResult && rootAssetUpdateResult.id > 0){
                                                    let newPlaying = [...myRoomResult.playing];
                                                    let myRoomNewRound = myRoomResult.round;
                                                    let myPlayingInfo = newPlaying.filter((info)=> info.userId === myRoomResult.currentId)[0];
                                                    let nextPlayingInfo = newPlaying.filter((info)=> info.userId === myRoomResult.nextId)[0]; 
                                                    let result = cardUtils.sideHandlerWithTwoUserCardCompare(myPlayingInfo.card, nextPlayingInfo.card);
                                                    if(result){
                                                        newPlaying = newPlaying.map((info)=>{
                                                            if(info.userId === nextPlayingInfo.userId){
                                                                let newInfo = {...info};
                                                                    newInfo.isTurn = false;
                                                                    newInfo.packed = true;
                                                                    newInfo.packedReasonMess.push({
                                                                        bengali: `${myPlayingInfo.name} বিজয়ী হয় যখন সে তার কার্ড তোমার সাথে সাইড করে `,
                                                                        english: `${myPlayingInfo.name} wins when he sides his cards with you`
                                                                    })
                                                                    newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                                    return newInfo;
                                                            }else{
                                                                return info;
                                                            }
                                                        })
                                                        let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                                        let presetPlayerIndex = resetPlaying.findIndex((info)=> info.userId === userId);
                                                        let currentPlaying = resetPlaying[presetPlayerIndex+1] ? resetPlaying[presetPlayerIndex+1] : resetPlaying[0];
                                                        let currentPlayingIndex = resetPlaying.findIndex((info)=> info.userId === currentPlaying.userId);
                                                        let nextPlaying = resetPlaying[currentPlayingIndex+1] ? resetPlaying[currentPlayingIndex+1] : resetPlaying[0];
                                                        if(currentPlayingIndex === 0){
                                                            myRoomNewRound = myRoomNewRound + 1;
                                                        }
                                                        newPlaying = newPlaying.map((info)=>{
                                                            if(info.userId === currentPlaying.userId){
                                                                let newInfo = {...info};
                                                                    newInfo.isTurn = true;
                                                                    newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                                    if(myRoomResult.maxChaalHit === newInfo.seenRound){
                                                                        newInfo.side = true;
                                                                    }
                                                                    return newInfo;
                                                            }else{
                                                                return info;
                                                            }
                                                        })
                                                        try {
                                                            let myRoomUpdateResult = await prisma.board.update({
                                                                where: {roomId, id},
                                                                data: {
                                                                    playing: newPlaying,
                                                                    totalBalance: {increment: totalBalance},
                                                                    currentBalance: {increment: currentBalance},
                                                                    currentCommission: {increment: currentCommission},
                                                                    currentId: currentPlaying.userId,
                                                                    nextId: nextPlaying.userId,
                                                                    round: myRoomNewRound
                                                                }
                                                            })
                                                            if(myRoomUpdateResult && myRoomUpdateResult?.id > 0){
                                                                try {
                                                                    let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                                    if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 

                                                                        let newRoomInfo = {...myRoomUpdateResult};
                                                                        newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                            delete playingInfo.card;
                                                                            return playingInfo;
                                                                        })

                                                                        resultGetAllConnectedList.forEach((info)=>{
                                                                            io.sockets.in(info.socketId).emit('anyoneHitSuccess',{roomId: myRoomUpdateResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomUpdateResult.blind)})
                                                                        });
                                                                        res.json({roomId: myRoomUpdateResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomUpdateResult.blind)});
                                                                    }else{
                                                                        next(new Error('Internal server error!'))
                                                                    }
                                                                } catch (error) { 
                                                                    next(new Error(error.message))
                                                                }
                                                            }else{
                                                                next(new Error('Internal server error while updating board info'))
                                                            }
                                                        } catch (error) {
                                                            next(new Error(error.message))
                                                        }
                                                    }else{
                                                        newPlaying = newPlaying.map((info)=>{
                                                            if(info.userId === myPlayingInfo.userId){
                                                                let newInfo = {...info};
                                                                    newInfo.isTurn = false;
                                                                    newInfo.packed = true;
                                                                    newInfo.packedReasonMess.push({
                                                                        bengali: `তুমি যখন তোমার কার্ড ${nextPlayingInfo.name} এর সাথে সাইড করে তখন ${nextPlayingInfo.name} বিজয়ী হয় এবং তুমি পরাজিত হও `,
                                                                        english: `When you side your cards with ${nextPlayingInfo.name}, ${nextPlayingInfo.name} wins and you lose`
                                                                    })
                                                                    newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                                    return newInfo;
                                                            }else{
                                                                return info;
                                                            }
                                                        })
                                                        let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                                        let currentPlayingIndex = resetPlaying.findIndex((info)=> info.userId === myRoomResult.nextId);
                                                        let currentPlaying = resetPlaying[currentPlayingIndex];
                                                        let nextPlaying = resetPlaying[currentPlayingIndex+1] ?  resetPlaying[currentPlayingIndex+1] : resetPlaying[0] 
                                                        if(currentPlayingIndex === 0){
                                                            myRoomNewRound = myRoomNewRound + 1;
                                                        }
                                                        newPlaying = newPlaying.map((info)=>{
                                                            if(info.userId === currentPlaying.userId){
                                                                let newInfo = {...info};
                                                                    newInfo.isTurn = true;
                                                                    newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                                    if(myRoomResult.maxChaalHit === newInfo.seenRound){
                                                                        newInfo.side = true;
                                                                    }
                                                                    return newInfo;
                                                            }else{
                                                                return info;
                                                            }
                                                        })
                
                                                        try {
                                                            let myRoomUpdateResult = await prisma.board.update({
                                                                where: {roomId, id},
                                                                data: {
                                                                    playing: newPlaying,
                                                                    totalBalance: {increment: totalBalance},
                                                                    currentBalance: {increment: currentBalance},
                                                                    currentCommission: {increment: currentCommission},
                                                                    currentId: currentPlaying.userId,
                                                                    nextId: nextPlaying.userId,
                                                                    round: myRoomNewRound
                                                                }
                                                            })
                                                            if(myRoomUpdateResult && myRoomUpdateResult?.id > 0){
                                                                try {
                                                                    let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                                    if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 

                                                                        let newRoomInfo = {...myRoomUpdateResult};
                                                                        newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                            delete playingInfo.card;
                                                                            return playingInfo;
                                                                        })

                                                                        resultGetAllConnectedList.forEach((info)=>{
                                                                            io.sockets.in(info.socketId).emit('anyoneHitSuccess',{roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.blind)})
                                                                        });
                                                                        res.json({roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.blind)});
                                                                    }else{
                                                                        next(new Error('Internal server error!'))
                                                                    }
                                                                } catch (error) { 
                                                                    next(new Error(error.message))
                                                                }
                                                            }else{
                                                                next(new Error('Internal server error while updating board info'))
                                                            }
                                                        } catch (error) {
                                                            next(new Error(error.message))
                                                        }
                                                    }
                                                }else{
                                                    next(new Error('Internal server error while updating root asset commission'))
                                                }
                                            } catch (error) {
                                                next(new Error(error.message))
                                            }
                                        }else{
                                            next(new Error('Internal server error while creating multiple user transaction'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    }
                                }else{
                                    next(new Error('Internal server error while updating user balance'))
                                }
                            } catch (error) {
                                next(new Error(error.message))
                            }

                        }else{ 
                            let currentUser = myRoomResult.playing.filter((info)=> info.userId === userId)[0];
                            let winnerResult = cardUtils.cardCompareHandler(myRoomResult, currentUser);
                            if(myRoomResult.compare === 'true' && winnerResult){
                                let newPlaying = [...myRoomResult.playing];
                                newPlaying = newPlaying.map((info)=>{
                                    if(info.userId === userId){
                                        let newInfo = {...info};
                                            newInfo.isTurn = false;
                                            newInfo.packed = true;
                                            newInfo.packedReasonMess.push({
                                                bengali: `যখন তুমি তোমার কার্ড সাইড করো তখন তোমার একাউন্ট এ পর্যাপ্ত পরিমান টাকা ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি বিজয়ী হন।`,
                                                english: `Your account did not have enough funds when you side your card. As the comparison is on in the game. Your card is compared to everyone else. And you win.`
                                            });
                                            return newInfo;
                                    }else{
                                        return info;
                                    }
                                })
                                let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                if(resetPlaying.length > 1){
                                    // checking passed
                                    let myRoomNewRound = myRoomResult.round;
                                    let currentPlayingIndex = resetPlaying.findIndex((info)=> info.userId === myRoomResult.nextId);
                                    if(currentPlayingIndex === 0){
                                        myRoomNewRound = myRoomNewRound + 1
                                    }
                                    let currentPlaying = resetPlaying[currentPlayingIndex];
                                    let nextPlaying = resetPlaying[currentPlayingIndex+1] ? resetPlaying[currentPlayingIndex+1] : resetPlaying[0];
                                        newPlaying = newPlaying.map((info)=>{
                                            if(info.userId === currentPlaying.userId){
                                                let newInfo = {...info};
                                                    newInfo.isTurn = true;
                                                    newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                    if(myRoomResult.maxChaalHit === newInfo.seenRound){
                                                        newInfo.side = true
                                                    }
                                                    return newInfo;
                                            }else{
                                                return info;
                                            }
                                        })
                                    try {
                                        let boardUpdateResult = await prisma.board.update({
                                            where: {roomId, id},
                                            data: {
                                                playing: newPlaying,
                                                round: myRoomNewRound,
                                                currentId: currentPlaying.userId,
                                                nextId: nextPlaying.userId,
                                                currentBalance: 0,
                                                currentCommission: 0,
                                                totalBalance: 0
                                            }
                                        })
                                        if(boardUpdateResult && boardUpdateResult?.id > 0){
                                            try {
                                                let myUserUpdateResult = await prisma.user.update({
                                                    where: {userId},
                                                    data: {
                                                        [`${myRoomResult.balanceType.toLowerCase()}Balance`]: {increment: Number(myRoomResult.currentBalance)}
                                                    }
                                                })
                                                if(myUserUpdateResult && myUserUpdateResult?.id > 0){
                                                    let recentTxrId = uid(8); 
                                                    let userWinTransaction = {
                                                        typeName: 'GAME WIN BY SIDE CARD',
                                                        isIn: 'IN',
                                                        amount: myRoomResult.currentBalance,
                                                        txrId: recentTxrId,
                                                        userId: currentUser.userId,
                                                        sourceId: currentUser.referralCode,
                                                        balanceType: myRoomResult.balanceType.toUpperCase()
                                                    }
                                                    try {
                                                        let userTransactionUpdate = await prisma.transaction.create({
                                                            data: userWinTransaction
                                                        })
                                                        if(userTransactionUpdate && userTransactionUpdate.id > 0){
                                                            try {
                                                                let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                                if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 

                                                                    let newRoomInfo = {...boardUpdateResult};
                                                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                        delete playingInfo.card;
                                                                        return playingInfo;
                                                                    })

                                                                    resultGetAllConnectedList.forEach((info)=>{
                                                                        io.sockets.in(info.socketId).emit('anyoneHitFailButCompareWin',{roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.currentBalance)})
                                                                    });
                                                                    res.json({roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo, userId, amount: Number(myRoomResult.currentBalance)});
                                                                }else{
                                                                    next(new Error('Internal server error!'))
                                                                }
                                                            } catch (error) { 
                                                                next(new Error(error.message))
                                                            }
                                                        }else{
                                                            next(new Error('Internal server error while creating user win transaction!'))
                                                        }
                                                    } catch (error) {
                                                        next(new Error(error.message))
                                                    }
                                                }else{
                                                    next(new Error('Internal server error while updating my winning account balance!'))
                                                }
                                            } catch (error) {
                                                next(new Error(error.message))
                                            } 
                                        }else{
                                            next(new Error('Internal server error while updating board'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    }
                                }else{
                                    next(new Error('Invalid server request'))
                                }
                            }else{
                                let newPlaying = [...myRoomResult.playing];
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === userId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = false;
                                                newInfo.packed = true;
                                                newInfo.packedReasonMess.push({
                                                    bengali: `যখন তুমি তোমার কার্ড সাইড করো তখন তোমার একাউন্ট এ পর্যাপ্ত পরিমান টাকা ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি পরাজিত হন।`,
                                                    english: `Your account did not have enough funds when you side your card. As the comparison is on in the game. Your card is compared to everyone else. And you lose.`
                                                })
                                                return newInfo;
                                        }else{
                                            return info;
                                        }
                                    })
                                let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                if(resetPlaying.length > 1){
                                    let myRoomNewRound = myRoomResult.round;
                                    let currentPlayingIndex = resetPlaying.findIndex((info)=> info.userId === myRoomResult.nextId);
                                    if(currentPlayingIndex === 0){
                                        myRoomNewRound = myRoomNewRound + 1
                                    }
                                    let currentPlaying = resetPlaying[currentPlayingIndex];
                                    let nextPlaying = resetPlaying[currentPlayingIndex+1] ? resetPlaying[currentPlayingIndex+1] : resetPlaying[0];
                                        newPlaying = newPlaying.map((info)=>{
                                            if(info.userId === currentPlaying.userId){
                                                let newInfo = {...info};
                                                    newInfo.isTurn = true;
                                                    newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                    if(myRoomResult.maxChaalHit === newInfo.seenRound){
                                                        newInfo.side = true
                                                    }
                                                    return newInfo;
                                            }else{
                                                return info;
                                            }
                                        })
                                    try {
                                        let boardUpdateResult = await prisma.board.update({
                                            where: {roomId, id},
                                            data: {
                                                playing: newPlaying,
                                                round: myRoomNewRound,
                                                currentId: currentPlaying.userId,
                                                nextId: nextPlaying.userId
                                            }
                                        })
                                        if(boardUpdateResult && boardUpdateResult?.id > 0){
                                            try {
                                                let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 

                                                    let newRoomInfo = {...boardUpdateResult};
                                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                        delete playingInfo.card;
                                                        return playingInfo;
                                                    })

                                                    resultGetAllConnectedList.forEach((info)=>{
                                                        io.sockets.in(info.socketId).emit('anyoneHitFailButCompareFail',{roomId, roomInfo: newRoomInfo})
                                                    });
                                                    res.json({roomId, roomInfo: newRoomInfo});
                                                }else{
                                                    next(new Error('Internal server error!'))
                                                }
                                            } catch (error) { 
                                                next(new Error(error.message))
                                            }
                                        }else{
                                            next(new Error('Internal server error while updating board'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    }
                                }else{
                                    next(new Error('Invalid server request'))
                                }
                            }
                        }
                    }else{
                        next(new Error('Internal server error while finding my user data'))
                    }
                } catch (error) {
                    next(new Error(error.message))
                }
            }else{
                next(new Error('Internal server error while find my room'))
            }
        } catch (error) {
            next(new Error(error.message))
        }
    }else{
        next(new Error('Internal server error!'))
    }
});
const handleShowMyCard = asyncHandler(async(req, res, next)=>{
    let {roomId, userId, id} = req.body;
    if(roomId && userId && id){
        try {
            let myRoomResult = await prisma.board.findUnique({
                where: {roomId}
            }) 
            if(myRoomResult && myRoomResult?.id > 0 && myRoomResult.isStart === 'true' && myRoomResult.currentId === userId){
                let nowCurrentPlaying = [...myRoomResult.playing].filter((info)=> info.packed === false);
                if(nowCurrentPlaying.length === 2){
                    try {
                        let myUserInfo = await prisma.user.findUnique({
                            where: {userId}
                        })
                        if(myUserInfo && myUserInfo?.id > 0){
                            if(Number(myRoomResult.blind) <= Number(myUserInfo[`${myRoomResult.balanceType.toLowerCase()}Balance`])){
                                try {
                                    let myUserUpdateResult = await prisma.user.update({
                                        where: {userId},
                                        data: {
                                            [`${myRoomResult.balanceType.toLowerCase()}Balance`]: {decrement: Number(myRoomResult.blind)}
                                        }
                                    })
                                    
                                    if(myUserUpdateResult && myUserUpdateResult?.id > 0){
                                        let NBT = myRoomResult.balanceType.toLowerCase();
    
                                        // commission calculating start
                                        let totalBalance = Number(myRoomResult.blind)
                                        let currentCommission = (totalBalance / 100) * Number(process.env[`${NBT}BoardFee`]);
                                        let currentBalance = (totalBalance / 100) * (100 - Number(process.env[`${NBT}BoardFee`]));
                                        let totalAppCommission = currentCommission / 2;
                                        let totalPartnerCommission = currentCommission / 2;
                                        // commission calculating end
    
                                        let allUserTransaction = [];
                                        let recentTxrId = uid(8); 
                                        let boardTransaction = {
                                            typeName: 'CARD SHOW',
                                            isIn: 'OUT',
                                            amount:  currentBalance,
                                            txrId: recentTxrId,
                                            userId: myUserInfo.userId,
                                            sourceId: myUserInfo.referralCode,
                                            balanceType:  NBT.toUpperCase()
                                        }
                                        let boardFeeCommission = {
                                            typeName: 'CARD SHOW COMMISSION',
                                            isIn: 'OUT',
                                            amount: currentCommission,
                                            txrId: recentTxrId,
                                            userId: myUserInfo.userId,
                                            sourceId: myUserInfo.referralCode,
                                            balanceType:  NBT.toUpperCase()
                                        }
                                        let boardFeeAppCommission = {
                                            typeName: 'CARD SHOW COMMISSION',
                                            isIn: 'IN',
                                            amount: totalAppCommission,
                                            txrId: recentTxrId,
                                            userId: '999999999999',
                                            sourceId: myUserInfo.userId,
                                            balanceType:  NBT.toUpperCase()
                                        }
                                        let boardFeePartnerCommission = {
                                            typeName: 'CARD SHOW COMMISSION',
                                            isIn: 'IN',
                                            amount: totalPartnerCommission,
                                            txrId: recentTxrId,
                                            userId: myUserInfo.referralCode,
                                            sourceId: myUserInfo.userId,
                                            balanceType:  NBT.toUpperCase()
                                        }
                                        if(boardTransaction.amount > 0){
                                            allUserTransaction.push(boardTransaction);
                                        }
                                        if(boardFeeCommission.amount > 0){
                                            allUserTransaction.push(boardFeeCommission)
                                        }
                                        if(boardFeeAppCommission.amount > 0){
                                            allUserTransaction.push(boardFeeAppCommission)
                                        }   
                                        if(boardFeePartnerCommission.amount > 0){
                                            allUserTransaction.push(boardFeePartnerCommission)
                                        }
    
                                        try {
                                            let myTransactionCreateResult = await prisma.transaction.createMany({data: allUserTransaction});
                                            if(myTransactionCreateResult && myTransactionCreateResult?.count > 0){
                                                try {
                                                    let rootAssetUpdateResult = await prisma.rootasset.update({
                                                        where: {id: 1},
                                                        data: {
                                                            [`${NBT}TotalCommission`]: {increment: currentCommission},
                                                            [`${NBT}TotalAppCommission`]: {increment: totalAppCommission},
                                                            [`${NBT}TotalPartnerCommission`]: {increment: totalPartnerCommission}
                                                        }
                                                    })
                                                    if(rootAssetUpdateResult && rootAssetUpdateResult.id > 0){
                                                        let newPlaying = [...myRoomResult.playing]; 
                                                        let myPlayingInfo = newPlaying.filter((info)=> info.userId === myRoomResult.currentId)[0];
                                                        let nextPlayingInfo = newPlaying.filter((info)=> info.userId === myRoomResult.nextId)[0]; 
                                                        let result = cardUtils.sideHandlerWithTwoUserCardCompare(myPlayingInfo.card, nextPlayingInfo.card);
                                                        if(result){
                                                            newPlaying = newPlaying.map((info)=>{
                                                                if(info.userId === nextPlayingInfo.userId){
                                                                    let newInfo = {...info};
                                                                        newInfo.isTurn = false;
                                                                        newInfo.packed = true;
                                                                        newInfo.packedReasonMess.push({
                                                                            bengali: `${myPlayingInfo.name} যখন তার কার্ড তোমার সাথে  শো করে তখন সে বিজয়ী হয় `,
                                                                            english: `${myPlayingInfo.name} wins when he shows his card to you`
                                                                        })
                                                                        newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                                        return newInfo;
                                                                }else{
                                                                    return info;
                                                                }
                                                            })
                                                            let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                                            
                                                            let winnerPlaying = resetPlaying[0];
                                                            newPlaying = newPlaying.map((info)=>{
                                                                if(info.userId === winnerPlaying.userId){
                                                                    let newInfo = {...info};
                                                                        newInfo.isTurn = false;
                                                                        newInfo.packed = true; 
                                                                        newInfo.packedReasonMess.push({
                                                                            bengali: `আপনি খেলার প্রধান বিজয়ী `,
                                                                            english: `You are the main winner of the game`
                                                                        });
                                                                        return newInfo;
                                                                }else{
                                                                    return info;
                                                                }
                                                            });
                                                            try {
                                                                let userBalanceUpdateResult = await prisma.user.update({
                                                                    where:{userId: winnerPlaying.userId},
                                                                    data: {
                                                                        [`${myRoomResult.balanceType.toLowerCase()}Balance`]: {increment: Number(myRoomResult.currentBalance)+Number(currentBalance)}
                                                                    }
                                                                })
                                                                if(userBalanceUpdateResult && userBalanceUpdateResult?.id > 0){
                                                                        let recentTxrId = uid(8); 
                                                                        let boardTransaction = {
                                                                            typeName: 'GAME WIN BY CARD SHOW',
                                                                            isIn: 'IN',
                                                                            amount:  Number(myRoomResult.currentBalance)+Number(currentBalance),
                                                                            txrId: recentTxrId,
                                                                            userId: winnerPlaying.userId,
                                                                            sourceId: winnerPlaying.referralCode,
                                                                            balanceType: myRoomResult.balanceType.toUpperCase()
                                                                        }
                                                                        try {
                                                                            let transactionCreateResult = await prisma.transaction.create({
                                                                                data: boardTransaction
                                                                            })
                                                                            if(transactionCreateResult && transactionCreateResult?.id > 0){
                                                                                let myRoomUpdateResult = await prisma.board.update({
                                                                                    where:{roomId, id},
                                                                                    data:{
                                                                                        playing: [],
                                                                                        totalBalance: 0,
                                                                                        currentBalance: 0,
                                                                                        currentCommission: 0,
                                                                                        round: 0,
                                                                                        currentId: 'false',
                                                                                        nextId: 'false',
                                                                                        previousId: 'false',
                                                                                        isStart: 'false',
                                                                                        blind: myRoomResult.rootBlind,
                                                                                        chaal: myRoomResult.rootChaal,
                                                                                        rootBlind: 0,
                                                                                        rootChaal: 0,
                                                                                        cardViewTill: new Date(new Date().setMilliseconds(40000)),
                                                                                    }
                                                                                });
                                                                                if(myRoomUpdateResult && myRoomUpdateResult.id > 0){
                                                                                    try {
                                                                                        let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                                                        if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 

                                                                                            let newRoomInfo = {...myRoomUpdateResult};
                                                                                            newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                                                delete playingInfo.card;
                                                                                                return playingInfo;
                                                                                            })


                                                                                            resultGetAllConnectedList.forEach((info)=>{
                                                                                                io.sockets.in(info.socketId).emit('boardFinishWithIncrementAndDecrement',{roomId: roomId, roomInfo: newRoomInfo, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance)+Number(currentBalance), decrement: myRoomResult.blind, playingInfo: newPlaying})
                                                                                            });
                                                                                            res.json({roomId: roomId, roomInfo: newRoomInfo, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance)+Number(currentBalance), decrement: myRoomResult.blind, playingInfo: newPlaying});
                                                                                        }else{
                                                                                            next(new Error('Internal server error!'))
                                                                                        }
                                                                                    } catch (error) { 
                                                                                        next(new Error(error.message))
                                                                                    }
                                                                                }else{
                                                                                    next(new Error('Internal server error while updating my board'))
                                                                                }
                                                                            }else{
                                                                                next( new Error('Internal server error while create transaction'))
                                                                            }
                                                                        } catch (error) {
                                                                            next(new Error(error.message))
                                                                        }
                                                                }else{
                                                                    next(new Error('Internal server error while user balance update'))
                                                                }
                                                            } catch (error) {
                                                                next(new Error(error.message))
                                                            }
                                                        }else{
                                                            newPlaying = newPlaying.map((info)=>{
                                                                if(info.userId === myPlayingInfo.userId){
                                                                    let newInfo = {...info};
                                                                        newInfo.isTurn = false;
                                                                        newInfo.packed = true;
                                                                        newInfo.packedReasonMess.push({
                                                                            bengali: `${nextPlayingInfo.name} এর সাথে যখন তুমি তোমার কার্ড শো করো তখন ${nextPlayingInfo.name} বিজয়ী হয় এবং তুমি পরাজিত হও। `,
                                                                            english: `When you show your cards with ${nextPlayingInfo.name}, ${nextPlayingInfo.name} wins and you lose`
                                                                        });
                                                                        newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                                                        return newInfo;
                                                                }else{
                                                                    return info;
                                                                }
                                                            })
                                                            let resetPlaying = newPlaying.filter((info)=> info.packed === false);

                                                            let winnerPlaying = resetPlaying[0];
                                                            newPlaying = newPlaying.map((info)=>{
                                                                if(info.userId === winnerPlaying.userId){
                                                                    let newInfo = {...info};
                                                                        newInfo.isTurn = false;
                                                                        newInfo.packed = true; 
                                                                        newInfo.packedReasonMess.push({
                                                                            bengali: `আপনি খেলার প্রধান বিজয়ী `,
                                                                            english: `You are the main winner of the game`
                                                                        });
                                                                        return newInfo;
                                                                }else{
                                                                    return info;
                                                                }
                                                            })
                                                            try {
                                                                let userBalanceUpdateResult = await prisma.user.update({
                                                                    where:{userId: winnerPlaying.userId},
                                                                    data: {
                                                                        [`${myRoomResult.balanceType.toLowerCase()}Balance`]: {increment: Number(myRoomResult.currentBalance)+Number(currentBalance)}
                                                                    }
                                                                })
                                                                if(userBalanceUpdateResult && userBalanceUpdateResult?.id > 0){
                                                                        let recentTxrId = uid(8); 
                                                                        let boardTransaction = {
                                                                            typeName: 'GAME WIN BY CARD SHOW',
                                                                            isIn: 'IN',
                                                                            amount: Number(myRoomResult.currentBalance)+Number(currentBalance),
                                                                            txrId: recentTxrId,
                                                                            userId: winnerPlaying.userId,
                                                                            sourceId: winnerPlaying.referralCode,
                                                                            balanceType: myRoomResult.balanceType.toUpperCase()
                                                                        }
                                                                        try {
                                                                            let transactionCreateResult = await prisma.transaction.create({
                                                                                data: boardTransaction
                                                                            })
                                                                            if(transactionCreateResult && transactionCreateResult?.id > 0){
                                                                                let myRoomUpdateResult = await prisma.board.update({
                                                                                    where:{roomId},
                                                                                    data:{
                                                                                        playing: [],
                                                                                        totalBalance: 0,
                                                                                        currentBalance: 0,
                                                                                        currentCommission: 0,
                                                                                        round: 0,
                                                                                        currentId: 'false',
                                                                                        nextId: 'false',
                                                                                        previousId: 'false',
                                                                                        isStart: 'false',
                                                                                        blind: myRoomResult.rootBlind,
                                                                                        chaal: myRoomResult.rootChaal,
                                                                                        rootBlind: 0,
                                                                                        rootChaal: 0,
                                                                                        cardViewTill: new Date(new Date().setMilliseconds(40000)),
                                                                                    }
                                                                                });
                                                                                if(myRoomUpdateResult && myRoomUpdateResult.id > 0){
                                                                                    try {
                                                                                        let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                                                        if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 

                                                                                            let newRoomInfo = {...myRoomUpdateResult};
                                                                                            newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                                                delete playingInfo.card;
                                                                                                return playingInfo;
                                                                                            })

                                                                                            resultGetAllConnectedList.forEach((info)=>{
                                                                                                io.sockets.in(info.socketId).emit('boardFinish',{roomId, roomInfo: newRoomInfo, playingInfo: newPlaying, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance)+Number(currentBalance)})
                                                                                            });
                                                                                            res.json({roomId, roomInfo: newRoomInfo, playingInfo: newPlaying, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance)+Number(currentBalance)});
                                                                                        }else{
                                                                                            next(new Error('Internal server error!'))
                                                                                        }
                                                                                    } catch (error) { 
                                                                                        next(new Error(error.message))
                                                                                    }
                                                                                }else{
                                                                                    next(new Error('Internal server error while updating my board'))
                                                                                }
                                                                            }else{
                                                                                next( new Error('Internal server error while create transaction'))
                                                                            }
                                                                        } catch (error) {
                                                                            next(new Error(error.message))
                                                                        }
                                                                }else{
                                                                    next(new Error('Internal server error while user balance update'))
                                                                }
                                                            } catch (error) {
                                                                next(new Error(error.message))
                                                            }
                                                        }
                                                    }else{
                                                        next(new Error('Internal server error while updating root asset commission'))
                                                    }
                                                } catch (error) {
                                                    next(new Error(error.message))
                                                }
                                            }else{
                                                next(new Error('Internal server error while creating multiple user transaction'))
                                            }
                                        } catch (error) {
                                            next(new Error(error.message))
                                        }
                                    }else{
                                        next(new Error('Internal server error while updating user balance'))
                                    }
                                } catch (error) {
                                    next(new Error(error.message))
                                }
    
                            }else{ 
                                let currentUser = myRoomResult.playing.filter((info)=> info.userId === userId)[0];
                                let winnerResult = cardUtils.cardCompareHandler(myRoomResult, currentUser);
                                if(myRoomResult.compare === 'true' && winnerResult){
                                    // checking passed
                                    let newPlaying = [...myRoomResult.playing];
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === myRoomResult.nextId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = false;
                                                newInfo.packed = true;
                                                newInfo.packedReasonMess.push({
                                                    bengali: `যখন তুমি তোমার কার্ড শো করো তখন তোমার একাউন্ট এ পর্যাপ্ত পরিমান টাকা ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি বিজয়ী হন।`,
                                                    english: `When you show your card, you don't have enough money in your account. As the comparison is on in the game. Your card is compared to everyone else. And you win.`
                                                })
                                                return newInfo;
                                        }else{
                                            return info;
                                        }
                                    })
                                    let winnerPlaying = currentUser;
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === winnerPlaying.userId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = false;
                                                newInfo.packed = true; 
                                                newInfo.packedReasonMess.push({
                                                    bengali: `আপনি খেলার প্রধান বিজয়ী `,
                                                    english: `You are the main winner of the game`
                                                });
                                                return newInfo;
                                        }else{
                                            return info;
                                        }
                                    })
                                    try {
                                        let userBalanceUpdateResult = await prisma.user.update({
                                            where:{userId: winnerPlaying.userId},
                                            data: {
                                                [`${myRoomResult.balanceType.toLowerCase()}Balance`]: {increment: myRoomResult.currentBalance}
                                            }
                                        })
                                        if(userBalanceUpdateResult && userBalanceUpdateResult?.id > 0){
                                                let recentTxrId = uid(8); 
                                                let boardTransaction = {
                                                    typeName: 'GAME WIN BY CARD SHOW',
                                                    isIn: 'IN',
                                                    amount: myRoomResult.currentBalance,
                                                    txrId: recentTxrId,
                                                    userId: winnerPlaying.userId,
                                                    sourceId: winnerPlaying.referralCode,
                                                    balanceType: myRoomResult.balanceType.toUpperCase()
                                                }
                                                try {
                                                    let transactionCreateResult = await prisma.transaction.create({
                                                        data: boardTransaction
                                                    })
                                                    if(transactionCreateResult && transactionCreateResult?.id > 0){
                                                        let myRoomUpdateResult = await prisma.board.update({
                                                            where:{roomId, id},
                                                            data:{
                                                                playing: [],
                                                                totalBalance: 0,
                                                                currentBalance: 0,
                                                                currentCommission: 0,
                                                                round: 0,
                                                                currentId: 'false',
                                                                nextId: 'false',
                                                                previousId: 'false',
                                                                isStart: 'false',
                                                                blind: myRoomResult.rootBlind,
                                                                chaal: myRoomResult.rootChaal,
                                                                rootBlind: 0,
                                                                rootChaal: 0,
                                                                cardViewTill: new Date(new Date().setMilliseconds(40000)),
                                                            }
                                                        });
                                                        if(myRoomUpdateResult && myRoomUpdateResult.id > 0){
                                                            try {
                                                                let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                                if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 

                                                                    let newRoomInfo = {...myRoomUpdateResult};
                                                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                        delete playingInfo.card;
                                                                        return playingInfo;
                                                                    })

                                                                    resultGetAllConnectedList.forEach((info)=>{
                                                                        io.sockets.in(info.socketId).emit('boardFinish',{roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance), playingInfo: newPlaying})
                                                                    });
                                                                    res.json({roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance), playingInfo: newPlaying});
                                                                }else{
                                                                    next(new Error('Internal server error!'))
                                                                }
                                                            } catch (error) { 
                                                                next(new Error(error.message))
                                                            }
                                                        }else{
                                                            next(new Error('Internal server error while updating my board'))
                                                        }
                                                    }else{
                                                        next( new Error('Internal server error while create transaction'))
                                                    }
                                                } catch (error) {
                                                    next(new Error(error.message))
                                                }
                                        }else{
                                            next(new Error('Internal server error while user balance update'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    }
                                }else{
                                    // checking passed
                                    let newPlaying = [...myRoomResult.playing];
                                        newPlaying = newPlaying.map((info)=>{
                                            if(info.userId === userId){
                                                let newInfo = {...info};
                                                    newInfo.isTurn = false;
                                                    newInfo.packed = true;
                                                    newInfo.packedReasonMess.push({
                                                        bengali: `যখন তুমি তোমার কার্ড শো করো তখন তোমার একাউন্ট এ পর্যাপ্ত পরিমান টাকা ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি পরাজিত হন।`,
                                                        english: `When you show your card, you don't have enough money in your account. As the comparison is on in the game. Your card is compared to everyone else. And you lose.`
                                                    });
                                                    return newInfo;
                                            }else{
                                                return info;
                                            }
                                        })
                                    let resetPlaying = newPlaying.filter((info)=> info.packed === false);
                                    let winnerPlaying = resetPlaying[0];
                                    newPlaying = newPlaying.map((info)=>{
                                        if(info.userId === winnerPlaying.userId){
                                            let newInfo = {...info};
                                                newInfo.isTurn = false;
                                                newInfo.packed = true; 
                                                newInfo.packedReasonMess.push({
                                                    bengali: `আপনি খেলার প্রধান বিজয়ী `,
                                                    english: `You are the main winner of the game`
                                                });
                                                return newInfo;
                                        }else{
                                            return info;
                                        }
                                    })
                                    try {
                                        let userBalanceUpdateResult = await prisma.user.update({
                                            where:{userId: winnerPlaying.userId},
                                            data: {
                                                [`${myRoomResult.balanceType.toLowerCase()}Balance`]: {increment: myRoomResult.currentBalance}
                                            }
                                        })
                                        if(userBalanceUpdateResult && userBalanceUpdateResult?.id > 0){
                                                let recentTxrId = uid(8); 
                                                let boardTransaction = {
                                                    typeName: 'GAME WIN BY CARD SHOW',
                                                    isIn: 'IN',
                                                    amount: myRoomResult.currentBalance,
                                                    txrId: recentTxrId,
                                                    userId: winnerPlaying.userId,
                                                    sourceId: winnerPlaying.referralCode,
                                                    balanceType: myRoomResult.balanceType.toUpperCase()
                                                }
                                                try {
                                                    let transactionCreateResult = await prisma.transaction.create({
                                                        data: boardTransaction
                                                    })
                                                    if(transactionCreateResult && transactionCreateResult?.id > 0){
                                                        let myRoomUpdateResult = await prisma.board.update({
                                                            where:{roomId, id},
                                                            data:{
                                                                playing: [],
                                                                totalBalance: 0,
                                                                currentBalance: 0,
                                                                currentCommission: 0,
                                                                round: 0,
                                                                currentId: 'false',
                                                                nextId: 'false',
                                                                previousId: 'false',
                                                                isStart: 'false',
                                                                blind: myRoomResult.rootBlind,
                                                                chaal: myRoomResult.rootChaal,
                                                                rootBlind: 0,
                                                                rootChaal: 0,
                                                                cardViewTill: new Date(new Date().setMilliseconds(40000)),
                                                            }
                                                        });
                                                        if(myRoomUpdateResult && myRoomUpdateResult.id > 0){
                                                            try {
                                                                let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                                if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 

                                                                    let newRoomInfo = {...myRoomUpdateResult};
                                                                    newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                                        delete playingInfo.card;
                                                                        return playingInfo;
                                                                    })

                                                                    resultGetAllConnectedList.forEach((info)=>{
                                                                        io.sockets.in(info.socketId).emit('boardFinish',{roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance), playingInfo: newPlaying})
                                                                    });
                                                                    res.json({roomId: myRoomResult.roomId, roomInfo: newRoomInfo, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance), playingInfo: newPlaying});
                                                                }else{
                                                                    next(new Error('Internal server error!'))
                                                                }
                                                            } catch (error) { 
                                                                next(new Error(error.message))
                                                            }
                                                        }else{
                                                            next(new Error('Internal server error while updating my board'))
                                                        }
                                                    }else{
                                                        next( new Error('Internal server error while create transaction'))
                                                    }
                                                } catch (error) {
                                                    next(new Error(error.message))
                                                }
                                        }else{
                                            next(new Error('Internal server error while user balance update'))
                                        }
                                    } catch (error) {
                                        next(new Error(error.message))
                                    }
                                }
                            }
                        }else{
                            next(new Error('Internal server error while finding my user data'))
                        }
                    } catch (error) {
                        next(new Error(error.message))
                    }
                }else{
                    next(new Error('Tow user need for show you card'))
                }
            }else{
                next(new Error('Internal server error while find my room'))
            }
        } catch (error) {
            next(new Error(error.message))
        }
    }else{
        next(new Error('Internal server error!'))
    }
});
const handleRefreshMyCard = asyncHandler(async(req, res, next)=>{
    let {roomId, userId, id} = req.body;
    if(roomId && userId && id){ 
        try {
            let myRoomResult = await prisma.board.findUnique({where: {id, roomId}});
            if(myRoomResult && myRoomResult.id > 0 && myRoomResult.accessIdes.indexOf(userId) !== -1 && myRoomResult.isStart === 'true' && myRoomResult.currentId === userId){

                let currentUserInfo = myRoomResult.playing.filter((info)=> info.userId === userId)[0];
                let currentNowTime = new Date().getTime();
                let prevDate = new Date(currentUserInfo.timeUp).getTime();
                if(currentNowTime >= prevDate){
                    let newPlaying = [...myRoomResult.playing];
                    let newPlayer = [...myRoomResult.player];
                        newPlayer = newPlayer.filter((info)=> info.userId !== userId);
                        newPlaying = newPlaying.map((info)=>{
                            if(info.userId === userId){
                                let newInfo = {...info};
                                    newInfo.packed = true;
                                    newInfo.packedReasonMess.push({
                                        bengali: `তোমাকে দেয়া টাইম এর ভিতরে তুমি খেলায় কোনো রেসপন্স করোনি তাই তোমাকে রিফ্রেশ এর মাধ্যমে প্যাক করা হয়েছে `,
                                        english: `You did not respond to the game within the time given to you so you are packed with refresh`
                                    })
                                    newInfo.isTurn = false;
                                    newInfo.timeUp = new Date()
                                    return newInfo;
                            }else{
                                return info;
                            }
                        }) 
                        let resetPlaying = newPlaying.filter((info)=> info.packed === false); 
                        let myRoomNewRound = myRoomResult.round;
                        if(resetPlaying.length > 1){
                            let currentPlayingIndex = resetPlaying.findIndex((info)=> info.userId === myRoomResult.nextId);
                            let currentPlaying = resetPlaying[currentPlayingIndex];
                            let nextPlaying = resetPlaying[currentPlayingIndex+1] ? resetPlaying[currentPlayingIndex+1] : resetPlaying[0]
                            if(currentPlayingIndex === 0){
                                myRoomNewRound = myRoomNewRound + 1
                            }
                            newPlaying = newPlaying.map((info)=>{
                                if(info.userId === currentPlaying.userId){
                                    let newInfo = {...info};
                                        newInfo.isTurn = true;
                                        newInfo.timeUp = new Date(new Date().setMilliseconds(40000));
                                        if(newInfo.seen === false && myRoomResult.maxBlindHit === newInfo.blindRound){
                                            newInfo.seen = true
                                        }
                                        return newInfo
                                }else{
                                    return info;
                                }
                            })
                            try {
                                let boardUpdateResult = await prisma.board.update({
                                    where: {roomId, id},
                                    data: {
                                        playing: newPlaying,
                                        player: newPlayer,
                                        currentId: currentPlaying.userId,
                                        nextId: nextPlaying.userId,
                                        round: myRoomNewRound
                                    }
                                });
                                if(boardUpdateResult && boardUpdateResult.id > 0){
                                    try {
                                        let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                        if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                            let newRoomInfo = {...boardUpdateResult};
                                            newRoomInfo.playing = newRoomInfo.playing.map((playingInfo)=>{
                                                delete playingInfo.card;
                                                return playingInfo;
                                            })
                                            resultGetAllConnectedList.forEach((info)=>{
                                                io.sockets.in(info.socketId).emit('packUpSingleUser',{roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo})
                                            });
                                            res.json({roomId: boardUpdateResult.roomId, roomInfo: newRoomInfo}); 
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
                            let winnerPlaying = resetPlaying[0];
                            newPlaying = newPlaying.map((info)=>{
                                if(info.userId === winnerPlaying.userId){
                                    let newInfo = {...info};
                                        newInfo.isTurn = false;
                                        newInfo.packed = true; 
                                        newInfo.packedReasonMess.push({
                                            bengali: `আপনি খেলার প্রধান বিজয়ী `,
                                            english: `You are the main winner of the game`
                                        });
                                        return newInfo;
                                }else{
                                    return info;
                                }
                            });
                            try {
                                let userBalanceUpdateResult = await prisma.user.update({
                                    where:{userId: winnerPlaying.userId},
                                    data: {
                                        [`${myRoomResult.balanceType.toLowerCase()}Balance`]: {increment: myRoomResult.currentBalance}
                                    }
                                })
                                if(userBalanceUpdateResult && userBalanceUpdateResult?.id > 0){
                                        let recentTxrId = uid(8); 
                                        let boardTransaction = {
                                            typeName: 'GAME WIN',
                                            isIn: 'IN',
                                            amount: myRoomResult.currentBalance,
                                            txrId: recentTxrId,
                                            userId: winnerPlaying.userId,
                                            sourceId: winnerPlaying.referralCode,
                                            balanceType: myRoomResult.balanceType.toUpperCase()
                                        }
                                        try {
                                            let transactionCreateResult = await prisma.transaction.create({
                                                data: boardTransaction
                                            })
                                            if(transactionCreateResult && transactionCreateResult?.id > 0){
                                                let myRoomUpdateResult = await prisma.board.update({
                                                    where:{roomId, id},
                                                    data:{
                                                        playing: [],
                                                        totalBalance: 0,
                                                        currentBalance: 0,
                                                        currentCommission: 0,
                                                        round: 0,
                                                        currentId: 'false',
                                                        nextId: 'false',
                                                        previousId: 'false',
                                                        isStart: 'false',
                                                        blind: myRoomResult.rootBlind,
                                                        chaal: myRoomResult.rootChaal,
                                                        rootBlind: 0,
                                                        rootChaal: 0,
                                                        cardViewTill: new Date(new Date().setMilliseconds(40000)),
                                                    }
                                                });
                                                if(myRoomUpdateResult && myRoomUpdateResult.id > 0){
                                                    try {
                                                        let resultGetAllConnectedList = await prisma.connectedlist.findMany({select:{socketId: true}});
                                                        if(resultGetAllConnectedList && resultGetAllConnectedList?.length > 0){ 
                                                            resultGetAllConnectedList.forEach((info)=>{
                                                                io.sockets.in(info.socketId).emit('boardFinish',{roomId: myRoomUpdateResult.roomId, roomInfo: myRoomUpdateResult, playingInfo: newPlaying, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance)})
                                                            });
                                                            res.json({roomId: myRoomUpdateResult.roomId, roomInfo: myRoomUpdateResult, playingInfo: newPlaying, userId: winnerPlaying.userId, amount: Number(myRoomResult.currentBalance)});
                                                        }else{
                                                            next(new Error('Internal server error!'))
                                                        }
                                                    } catch (error) {  
                                                        next(new Error(error.message))
                                                    }
                                                }else{
                                                    next(new Error('Internal server error while updating my board'))
                                                }
                                            }else{
                                                next( new Error('Internal server error while create transaction'))
                                            }
                                        } catch (error) { 
                                            next(new Error(error.message))
                                        }
                                }else{
                                    next(new Error('Internal server error while user balance update'))
                                }
                            } catch (error) { 
                                next(new Error(error.message))
                            }
                        }
                }else{
                    next(new Error(`Please wait till ${new Date(currentUserInfo.timeUp).toString().split(' ')[4]}`));
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

module.exports = {
    handleSideMyCard,
    handleChaalOneExe,
    handleBlindOneExe,
    handlePackUpMyCard,
    handleStartRoom,
    handleGetMyRoom,
    handleLeaveInRoomInRoom,
    handleJoinInRoom,
    handleDeleteSingleRoom,
    handleGetAllBoard,
    handleCreateNewBoard,
    handleCheckSocket,
    handleEnterPlayerInRoom,
    handleLeavePlayerInRoom,
    handleSeeMyCard,
    handleBlindTwoExe,
    handleChaalTwoExe,
    handleShowMyCard,
    handleRefreshMyCard,
    handleJoinInRoomPrivatePlayer
}