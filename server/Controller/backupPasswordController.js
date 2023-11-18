
const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('express-async-handler');  
const { comparePasswords, hashPassword } = require('../utils/Password');
const prisma = new PrismaClient();

const handleAddSingleBackupPassword = asyncHandler(async(req ,res, next)=>{
    let {email, password, mainPassword} = req.body;
    if(email && password && mainPassword){
        try {
            let getSingleUserResult = await prisma.user.findUnique({where: {email}});
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
                                            let createResult = await prisma.backuppassword.create({data: postData});
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
            let getSingleUserResult = await prisma.user.findUnique({where: {email}});
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
                                            let userUpdateResult = await prisma.user.update({where: {email}, data: {password: hashPasswordResult.password}});
                                            if(userUpdateResult && userUpdateResult?.id){
                                                res.json(userUpdateResult);
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