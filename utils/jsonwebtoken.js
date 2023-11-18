 
const jwt = require('jsonwebtoken');
const User = require('../models/User');
let tokenSecret = process.env.JWT_SECRET; 

function generateToken(userInfo) {
    return new Promise((resolve, reject) => {
        // Generate the token with the user payload
        jwt.sign({ userInfo }, tokenSecret, { expiresIn: '7d'}, (error, token) => {
            if (error) {
                reject(error);
            } else {
                resolve(token);
            }
        });
    });
};

function verifyToken(token) {
    let tokenSecret = process.env.JWT_SECRET;
    return new Promise((resolve, reject) => {
    jwt.verify(token, tokenSecret, (error, decoded) => {
        if (error) {
        reject(error);
        } else { 
            if(decoded && decoded?.userInfo && Number(decoded?.userInfo?.role) <= 6 && decoded?.userInfo?.isJail === 'false' && decoded?.userInfo?.isDisabled === 'false'){
                resolve(decoded);
            }else{
                reject('Unauthenticated')
            }
        }
    });
    });
}

async function authenticateToken(req, res, next) {
    let authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided', status__code: 401 });
    }

    try {
        const decoded = await verifyToken(token);
        req.user = decoded;
        if(Number(decoded.userInfo.role) <= 6){
            try {
                let getCurrentUser = await User.findOne({where: {id: decoded.userInfo.id, email: decoded.userInfo.email}}); 
                if(getCurrentUser && getCurrentUser.isJail === 'false' && getCurrentUser.isDisabled === 'false' && Number(getCurrentUser.role) <= 6){
                    next();
                }else{
                    let newError = new Error('Unauthenticated');
                    newError.status = 401;
                    next(newError)
                }
            } catch (error) {
                next(new Error(error.message))
            }
        }else{
            let newError = new Error('Unauthenticated');
                newError.status = 401;
                next(newError)
        }
    } catch (err) { 
        return res.status(401).json({ message: 'Invalid token', status__code: 401 });
    }
}

async function authenticateTokenAdmin(req, res, next) {
    let authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided', status__code: 401 });
    }

    try {
        const decoded = await verifyToken(token);
        req.user = decoded;
        if(Number(decoded.userInfo.role) <= 1 && decoded.userInfo.designation === 'admin'){
            try {
                let getCurrentUser = await User.findOne({where: {id: decoded.userInfo.id, email: decoded.userInfo.email}}); 
                if(getCurrentUser && getCurrentUser.isJail === 'false' && getCurrentUser.isDisabled === 'false' && Number(getCurrentUser.role) <= 1 && getCurrentUser.designation === 'admin'){
                    next();
                }else{
                    let newError = new Error('Unauthenticated');
                    newError.status = 401;
                    next(newError)
                }
            } catch (error) {
                next(new Error(error.message))
            }
        }else{
            let newError = new Error('Unauthenticated');
                newError.status = 401;
                next(newError)
        }
    } catch (err) { 
        return res.status(401).json({ message: 'Invalid token', status__code: 401 });
    }
}

module.exports = {
    generateToken,
    verifyToken,
    authenticateToken,
    authenticateTokenAdmin
}