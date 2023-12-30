const asyncHandler = require('express-async-handler');   
const PlayingHistory = require('../models/PlayingHistory');
const { Op } = require('sequelize');

const getSinglePlayingHistory = asyncHandler(async(req, res, next)=>{
    let {playerId, id} = req.params;
    if(playerId && id){
        try {
            let result = await PlayingHistory.findOne({
                where: {
                    id,
                    members: {
                        [Op.like]: `%${playerId}%`
                    }
                }
            })
            let newPlayingInfo = JSON.parse(result.playingInfo);
            
            res.json({...result.dataValues, playingInfo: newPlayingInfo});
        } catch (error) {
            next(new Error(error.message))
        }
    }else{
        next(new Error('Invalid server request!'))
    }
})

const getAllSingleUserPlayingHistory = asyncHandler(async(req, res, next)=>{
    const page = Number(req.query?.page) || 1; 
    let limit = 20;
    let skip = (limit*page) - limit;  

    let {playerId} = req.params;
    if(playerId){
        try {
            let result = await PlayingHistory.findAll({
                where: {
                    members: {
                        [Op.like]: `%${playerId}%`
                    }
                }, 
                offset: skip,
                limit: limit,
            })  
            if(result && result.length){
                try {
                    let historyCount = await PlayingHistory.count({
                        where: {
                            members: {
                                [Op.like]: `%${playerId}%`
                            }
                        }, 
                    });
                    if(historyCount){
                        res.json({transactions: result, pages: Math.ceil(historyCount/limit), currentPage: page})
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
        next(new Error('Invalid server request!'))
    }
})

module.exports = {
    getAllSingleUserPlayingHistory,
    getSinglePlayingHistory
}