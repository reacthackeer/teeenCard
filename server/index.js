
// index.js
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();
const app = express();
const server = http.createServer(app);
let origin = process.env.ORIGIN; 
const io = socketIO(server,{cors: {origin}}); 
const PORT = process.env.PORT || 3000;  

global.io = io;
global.realDepositFee = Number(process.env.realDepositFee) || 10;
global.offlineDepositFee = Number(process.env.offlineDepositFee) || 10;
global.demoDepositFee = Number(process.env.demoDepositFee) || 10;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
// application configuration start
app.use(express.json());
app.use(cors({origin}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true, limit: '200mb'}));
app.use(fileUpload({limits: '200mb'}));
app.use(express.static('uploads'));
// application configuration end

let allEnv = {
  dr: process.env.DATABASE_URL,
  sc: process.env.JWT_SECRET,
  origin: process.env.origin,
  rdf: process.env.realDepositFee,
  ddf: process.env.demoDepositFee,
  odf: process.env.offlineDepositFee,
  rbf: process.env.realBoardFee,
  dbf: process.env.demoBoardFee,
  obf: process.env.offlineBoardFee,
}

console.log(allEnv);

const { socketConnectedRouter } = require('./Router/SocketConnectedRouter');
const { socketDisconnectedRouter } = require('./Router/SocketDisconnectedRouter'); 
const { authRouter } = require('./Router/auth'); 
const { couponRouter } = require('./Router/Coupon');
const { transactionRouter } = require('./Router/Transaction');
const { boardRouter } = require('./Router/Board');
const { uid } = require('uid'); 
const { walletRouter } = require('./Router/Wallet');
const { currencyRouter } = require('./Router/currency');
const { depositRequestRouter } = require('./Router/depositRequest');
const { backupPassword } = require('./Router/backupPassword');

app.use('/api/v1/connected', socketConnectedRouter);
app.use('/api/v1/disconnected', socketDisconnectedRouter); 
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/coupon', couponRouter);
app.use('/api/v1/transaction', transactionRouter);
app.use('/api/v1/board', boardRouter);
app.use('/api/v1/wallet', walletRouter);
app.use('/api/v1/currency', currencyRouter);
app.use('/api/v1/deposit-request', depositRequestRouter);
app.use('/api/v1/backup-password', backupPassword);

app.get('/',async(req, res, next)=> {
  let result = await User
})

app.get('/:userId',async(req, res, next)=> {
  
  try {
    let result = await prisma.rootasset.findUnique({where: {id: 1}});
    res.json(result);
  } catch (error) {
    next(new Error('Internal server error!'))
  }
})

app.post('/api/upload',async(req, res, next)=>{
  let file = req.files.file;
  let body = req.body;
  let userId = body.userId;
  if(file && userId){
    let fileExtension = file.name.split('.');
        fileExtension = '.'+fileExtension[fileExtension.length -1];
    let fileName = userId+'.png';
    try {
        let result = await file.mv(__dirname+'/uploads'+`/${fileName}`);
        try {
          let userUpdateResult = await prisma.user.update({where: {userId}, data: {src: `/${fileName}`}});
          if(userUpdateResult && userUpdateResult.id){
              res.json(userUpdateResult)
          }else{
            next(new Error('Internal server error!'))
          }
        } catch (error) {
          next(new Error(error.message))
        }
    } catch (error) {
      next(new Error('Internal server error while uploading your profile image'))
    }
  }else{
    next(new Error('Invalid post request!'))
  }
})

// Error handling middleware
app.use((err, req, res, next) => { 
  // Send an appropriate response to the client
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error'
    }
  });
});


server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:3000`);
});  
