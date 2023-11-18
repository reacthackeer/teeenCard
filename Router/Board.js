
const handleBlindOneExe = require('../Controller/board/BlindOneExe');
const handleBlindTwoExe = require('../Controller/board/BlindTwoExe');
const handleChaalOneExe = require('../Controller/board/ChaalOneExe');
const handleChaalTwoExe = require('../Controller/board/ChaalTwoExe');
const handleCreateNewBoard = require('../Controller/board/CreateNewBoard');
const handleDeleteSingleRoom = require('../Controller/board/DeleteSingle');
const handleGetAllBoard = require('../Controller/board/GetAll');
const handleGetMyRoom = require('../Controller/board/GetMyRoom');
const handleJoinInRoomPrivatePlayer = require('../Controller/board/JoinInRoomPrivatePlayer');
const handleJoinInRoom = require('../Controller/board/JoinRoom');
const handleLeaveInRoomInRoom = require('../Controller/board/LeaveInroomInRoom');
const handleLeavePlayerInRoom = require('../Controller/board/LeavePlayer');
const handlePackUpMyCard = require('../Controller/board/PackUpMyCard');
const handleRefreshMyCard = require('../Controller/board/RefreshCard');
const handleSeeMyCard = require('../Controller/board/SeeMyCard');
const handleShowMyCard = require('../Controller/board/Show');
const handleSideMyCard = require('../Controller/board/Side');
const handleStartRoom = require('../Controller/board/StartRoom');
const handleCheckSocket = require('../Controller/board/checkSocket');
const handleEnterPlayerInRoom = require('../Controller/board/handleEnterPlayerInRoom');
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
boardRouter.delete('/delete',authenticateToken, handleDeleteSingleRoom);
boardRouter.post('/check',authenticateToken, handleCheckSocket);
boardRouter.get('/get-all',authenticateToken, handleGetAllBoard);
boardRouter.put('/validate-user', authenticateToken, handleRefreshMyCard);
boardRouter.put('/leave',authenticateToken, handleLeaveInRoomInRoom);
boardRouter.put('/show-my-card', authenticateToken, handleShowMyCard);
boardRouter.put('/side-my-card', authenticateToken, handleSideMyCard);
boardRouter.put('/blind-one-exe', authenticateToken, handleBlindOneExe); 
boardRouter.put('/blind-two-exe', authenticateToken, handleBlindTwoExe);
boardRouter.put('/chaal-one-exe', authenticateToken, handleChaalOneExe);
boardRouter.put('/chaal-two-exe', authenticateToken, handleChaalTwoExe);

boardRouter.put('/start-room',authenticateToken, handleStartRoom);



module.exports = {
    boardRouter
}