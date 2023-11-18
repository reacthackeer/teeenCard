const { 
    handleCreateNewBoard, 
    handleGetAllBoard, 
    handleCheckSocket, 
    handleDeleteSingleRoom, 
    handleJoinInRoom,  
    handleGetMyRoom,  
    handleEnterPlayerInRoom, 
    handleLeavePlayerInRoom, 
    handleStartRoom, 
    handleSeeMyCard,       
    handlePackUpMyCard, 
    handleBlindOneExe, 
    handleBlindTwoExe, 
    handleChaalOneExe, 
    handleChaalTwoExe, 
    handleSideMyCard, 
    handleShowMyCard, 
    handleRefreshMyCard,
    handleLeaveInRoomInRoom,
    handleJoinInRoomPrivatePlayer
} = require('../Controller/boardController');
const { 
    authenticateToken 
} = require('../utils/jsonwebtoken');

const boardRouter = require('express').Router();

boardRouter.post('/create',authenticateToken, handleCreateNewBoard);
boardRouter.get('/room/:roomId/:userId', authenticateToken, handleGetMyRoom);
boardRouter.put('/join',authenticateToken, handleJoinInRoom);
boardRouter.put('/join-private',authenticateToken, handleJoinInRoomPrivatePlayer);
boardRouter.put('/enter-player-in-room',authenticateToken, handleEnterPlayerInRoom);
boardRouter.put('/leave-player-in-room',authenticateToken, handleLeavePlayerInRoom);
boardRouter.put('/see-my-card', authenticateToken, handleSeeMyCard);
boardRouter.put('/pack-up-my-card', authenticateToken, handlePackUpMyCard);
boardRouter.put('/blind-one-exe', authenticateToken, handleBlindOneExe);
boardRouter.put('/blind-two-exe', authenticateToken, handleBlindTwoExe);
boardRouter.put('/chaal-one-exe', authenticateToken, handleChaalOneExe);
boardRouter.put('/chaal-two-exe', authenticateToken, handleChaalTwoExe);
boardRouter.put('/side-my-card', authenticateToken, handleSideMyCard);
boardRouter.put('/show-my-card', authenticateToken, handleShowMyCard);
boardRouter.put('/validate-user', authenticateToken, handleRefreshMyCard);
boardRouter.put('/start-room',authenticateToken, handleStartRoom);
boardRouter.put('/leave',authenticateToken, handleLeaveInRoomInRoom);
boardRouter.get('/get-all',authenticateToken, handleGetAllBoard);
boardRouter.post('/check',authenticateToken, handleCheckSocket);
boardRouter.delete('/delete',authenticateToken, handleDeleteSingleRoom);

module.exports = {
    boardRouter
}