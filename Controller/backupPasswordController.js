const asyncHandler = require('express-async-handler');  
const { comparePasswords, hashPassword } = require('../utils/Password'); 
const User = require('../models/User');
const BackupPassword = require('../models/BackupPassword');

const handleAddSingleBackupPassword = asyncHandler(async(req ,res, next)=>{  
    let {email, password, mainPassword} = req.body;
    if(email && password && mainPassword){
        try {
            let getSingleUserResult = await User.findOne({where: {email}});
            if(getSingleUserResult && getSingleUserResult.id){
                try {
                    let comparePasswordResult = await comparePasswords(password, getSingleUserResult.password);
                    if(comparePasswordResult.status__code === 204){
                        try {
                            let hashPasswordResult = await hashPassword(password);
                            if(hashPasswordResult.status__code === 200){
                                let postData = {
                                    email,
                                    password: hashPasswordResult.password
                                } 
                                try {
                                    let userPasswordCheckResult = await comparePasswords(mainPassword, getSingleUserResult.password);
                                    if(userPasswordCheckResult && userPasswordCheckResult.status__code === 200){
                                        try {
                                            let createResult = await BackupPassword.create(postData);
                                            if(createResult && createResult?.id > 0){
                                                res.json(createResult);
                                            }else{
                                                next(new Error('Backup password already created'));
                                            }
                                        } catch (error) {
                                            next(new Error('Backup password already created'));
                                        }
                                    }else{
                                        next(new error('Incorrect password provided!'))
                                    }
                                } catch (error) {
                                    next(new Error('Incorrect password provided!'))
                                }
                            }else{
                                next(new Error('Internal server error'))
                            }
                        } catch (error) {
                            next(new Error(error.message))
                        }
                    }else{
                        next(new Error('Please use different password'));
                    }
                } catch (error) {
                    next(new Error('Please use different password'));
                }
            }else{
                next(new Error('Internal server  error!'))
            }
        } catch (error) { 
            next(new Error('Wallet already existed!'))
        }
    }else{
        next(new Error(`Invalid post request!`));
    }
});

const handleChangeUserPassword = asyncHandler(async(req ,res, next)=>{
    let {email, password, oldPassword, backupPassword} = req.body;
    if(email && password && oldPassword && backupPassword){
        try {
            let getSingleUserResult = await User.findOne({where: {email}});
            if(getSingleUserResult && getSingleUserResult.id){
                try {
                    let comparePasswordResult = await comparePasswords(backupPassword, getSingleUserResult.password);
                    if(comparePasswordResult.status__code === 204){
                        try {
                            let comparePasswordResult = await comparePasswords(oldPassword, getSingleUserResult.password);
                            if(comparePasswordResult.status__code === 200){
                                try {
                                    let hashPasswordResult = await hashPassword(password);
                                    if(hashPasswordResult.status__code === 200){
                                        try {
                                            let userUpdateResult = await User.update({password: hashPasswordResult.password},{where: {email}});
                                            if(userUpdateResult && userUpdateResult[0]){ 
                                                try {
                                                    let result = await User.findOne({where: {email: email}});
                                                    if(result && result.id){
                                                        res.json(result);
                                                    }else{
                                                        next(new Error('Internal server error!'))
                                                    }
                                                } catch (error) {
                                                    next(new Error(error.message))
                                                }
                                            }else{
                                                next('Internal server error!');
                                            }
                                        } catch (error) {
                                            next(new Error('Backup password already created'));
                                        }
                                    }else{
                                        next(new Error('Internal server error'))
                                    }
                                } catch (error) {
                                    next(new Error(error.message))
                                }
                            }else{
                                next(new Error('Incorrect old password provided!'));
                            }
                        } catch (error) {
                            next(new Error('Incorrect old password provided1'));
                        }
                    }else{
                        next(new Error('Please use different password'));
                    }
                } catch (error) {
                    next(new Error('Please use different password'));
                }
            }else{
                next(new Error('Internal server  error!'))
            }
        } catch (error) { 
            next(new Error('Wallet already existed!'))
        }
    }else{
        next(new Error(`Invalid post request!`));
    }
});

module.exports = {
    handleAddSingleBackupPassword,
    handleChangeUserPassword
}