const { getAllSingleUserPlayingHistory, getSinglePlayingHistory } = require('../Controller/playingHistory');
const { authenticateToken } = require('../utils/jsonwebtoken');

const playingHistory = require('express').Router();

playingHistory.get('/get-all/:playerId', authenticateToken, getAllSingleUserPlayingHistory);
playingHistory.get('/get-single/:playerId/:id', authenticateToken, getSinglePlayingHistory);

module.exports = {
    playingHistory
}