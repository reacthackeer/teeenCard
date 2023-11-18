const jsonConverterUtils = {};

    jsonConverterUtils.singleWalletConverter = (wallet) => {
        let newWallet = {...wallet.dataValues};
            newWallet.idesType = JSON.parse(newWallet.idesType);
            newWallet.ides = JSON.parse(newWallet.ides);
        return newWallet;
    }

    jsonConverterUtils.multipleWalletConverter = (wallets) => {
        let multipleWallets = [];
        wallets.forEach((wallet)=>{
            let newWallet = {...wallet.dataValues};
            newWallet.idesType = JSON.parse(newWallet.idesType);
            newWallet.ides = JSON.parse(newWallet.ides); 
            multipleWallets.push(newWallet);
        });
        return multipleWallets;
    }
    jsonConverterUtils.singleInRoomConverter = (inRoom) => {
        let newInRoomInfo = {...inRoom.dataValues};
            newInRoomInfo.userIdes = JSON.parse(newInRoomInfo.userIdes);
            newInRoomInfo.roomWithId = JSON.parse(newInRoomInfo.roomWithId);
            return newInRoomInfo;
    }
    
    jsonConverterUtils.multipleInRoomConverter = (inRooms) => {
        let multipleRooms = [];
        inRooms.forEach((inRoom)=>{
            let newInRoomInfo = {...inRoom.dataValues};
            newInRoomInfo.userIdes = JSON.parse(newInRoomInfo.userIdes);
            newInRoomInfo.roomWithId = JSON.parse(newInRoomInfo.roomWithId);
            multipleRooms.push(newInRoomInfo);
        })
        return multipleRooms;
    }
    jsonConverterUtils.singleBoard = (board) => {
        let newBoardInfo = {...board.dataValues};
            newBoardInfo.member = JSON.parse(newBoardInfo.member);
            newBoardInfo.player = JSON.parse(newBoardInfo.player);
            newBoardInfo.playing = JSON.parse(newBoardInfo.playing);
            newBoardInfo.accessIdes = JSON.parse(newBoardInfo.accessIdes);
            return newBoardInfo;
    }
    
    jsonConverterUtils.multipleBoard = (boards) => {
        let multipleBoard = [];
        boards.forEach((board)=>{  
            let newBoardInfo = {...board.dataValues}; 
            newBoardInfo.member = JSON.parse(newBoardInfo.member); 
            newBoardInfo.player = JSON.parse(newBoardInfo.player);
            newBoardInfo.playing = JSON.parse(newBoardInfo.playing);
            newBoardInfo.accessIdes = JSON.parse(newBoardInfo.accessIdes);
            multipleBoard.push(newBoardInfo);
        })
        return multipleBoard;
    }

module.exports = jsonConverterUtils;