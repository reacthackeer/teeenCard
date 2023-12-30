import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    room: {},
    roomId: '',
    isFilled: false, 
    boardFinish: false,
    nameWithCard: [],
    historyWithCard: [],
    historyLoaded: false,
}

const roomSlice = createSlice({
    name: 'room',
    initialState,
    reducers: { 
        roomFinish: (state, action) => {
            if(state.roomId === action.payload.roomId){
                state.boardFinish = true;
                state.nameWithCard = action.payload.playingInfo
            }
        },
        historyUpdate: (state, action) => { 
                state.historyLoaded = action.payload.loaded;
                state.historyWithCard = action.payload.playingInfo
        },
        resetRoomFinish: (state, action) => { 
                state.boardFinish = false;
                state.nameWithCard = [] 
        },
        addRoom: (state, action) => { 
            state.room = action.payload.room;
            state.roomId = action.payload.roomId;
            state.isFilled = action.payload.isFilled;
        },
        resetBoard: (state, action) => {
            state.room = {};
            state.roomId = '';
            state.isFilled = '';
        },   
        addNewMemberInRoom: (state, action) => {
            let newBoards = [state.room].map((info)=>{
                if(info.roomId === action.payload.roomId){
                    if(info.accessIdes.indexOf(action.payload.userId) === -1){
                        info.accessIdes.push(action.payload.userId); 
                    }
                    if(info.member.indexOf(action.payload.userId) === -1){ 
                        info.member.push(action.payload.userId);
                    } 
                    return info;
                }else{
                    return info;
                }
            })
            state.room = newBoards[0]; 
        },
        addNewPlayerInRoom: (state, action) => {
            let newBoards = [state.room].map((info)=>{
                if(info.roomId === action.payload.roomId){
                    let currentMember = info.player.filter((info)=> info?.userId === action?.payload?.userId);
                    if(info.accessIdes.indexOf(action?.payload?.userId) !== -1 && info.member.indexOf(action.payload.userId) !== -1 && currentMember.length === 0){
                        info.player.push(action.payload.userInfo); 
                        return info;
                    }else{
                        return info;
                    }
                }else{
                    return info;
                }
            }) 
            state.room = newBoards[0];
        },
        addNewPlayingInRoom: (state, action) => {
            let newBoards = [state.room].map((info)=>{
                if(info.roomId === action.payload.roomId){
                    let currentMember = info.playing.filter((info)=> info.userId === action.payload.userId);
                    let currentPlayer = info.player.filter((info)=> info.userId === action.payload.userId);
                    if(info.accessIdes.indexOf(action.payload.userId) !== -1 && info.member.indexOf(action.payload.userId) !== -1 && currentMember.length === 0){
                        info.playing.push(action.payload.userInfo); 
                        if(currentPlayer.length === 0){
                            info.player.push(action.payload.userInfo);
                        }
                        return info;
                    }else{
                        return info;
                    }
                }else{
                    return info;
                }
            })
            state.room = newBoards[0];
        }, 
        addMultiplePlayingInRoom: (state, action) => {
            let newBoards = [state.room].map((info)=>{
                if(info.roomId === action.payload.roomId){
                    info.playing = [...info.playing, ...action.payload.userInfos];
                    return info;
                }else{
                    return info;
                }
            })
            state.room = newBoards[0]
        },
        removeSingleMemberInRoom: (state, action) => {
            let newBoards = [state.room].map((info)=>{
                if(info.roomId === action.payload.roomId){
                    let newAccessIdes = info.accessIdes.filter((info)=> info !== action.payload.userId);
                    let newMember = info.member.filter((info)=> info !== action.payload.userId);
                    let newPlayer = info.player.filter((info)=> info.userId !== action.payload.userId);
                    let newPlaying = info.playing.filter((info)=> info.userId !== action.payload.userId);
                    info.accessIdes = newAccessIdes;
                    info.member = newMember;
                    info.player = newPlayer;
                    info.playing = newPlaying;
                    return info;
                }else{
                    return info;
                }
            })
            state.room = newBoards[0]
        },
        removeSinglePlayerInRoom: (state, action) => { 
            let newBoards = [state.room].map((info)=>{
                if(info.roomId === action.payload.roomId){  
                    let newPlayer = info.player.filter((info)=> info.userId !== action.payload.userId);  
                    info.player = newPlayer; 
                    return info;
                }else{
                    return info;
                }
            })
            state.room = newBoards[0]
        },
        removeSinglePlayingInRoom: (state, action) => {
            let newBoards = [state.room].map((info)=>{
                if(info.roomId === action.payload.roomId){  
                    let newPlaying = info.playing.filter((info)=> info.userId !== action.payload.userId);  
                    info.playing = newPlaying; 
                    return info;
                }else{
                    return info;
                }
            })
            state.room = newBoards[0]
        },
        updateRunningStatusInRoom: (state, action) => {
            let newBoards = [state.room].map((info)=>{
                if(info.roomId === action.payload.roomId){  
                    info.isStart = action.payload.isStart
                    return info;
                }else{
                    return info;
                }
            })
            state.room = newBoards[0]
        },
        incrementCurrentBalance: (state, action) => {
            let newBoards = [state.room].map((info)=>{
                if(info.roomId === action.payload.roomId){  
                    info.currentBalance = Number(info.currentBalance)+Number(action.payload.currentBalance);
                    return info;
                }else{
                    return info;
                }
            })
            state.room = newBoards[0]
        },
        incrementCurrentCommission: (state, action) => {
            let newBoards = [state.room].map((info)=>{
                if(info.roomId === action.payload.roomId){  
                    info.currentCommission = Number(info.currentCommission)+Number(action.payload.currentCommission);
                    return info;
                }else{
                    return info;
                }
            })
            state.room = newBoards[0]
        },
        incrementTotalBalance: (state, action) => {
            let newBoards = [state.room].map((info)=>{
                if(info.roomId === action.payload.roomId){  
                    info.totalBalance = Number(info.totalBalance)+Number(action.payload.totalBalance);
                    return info;
                }else{
                    return info;
                }
            })
            state.room = newBoards[0]
        },
        decrementCurrentBalance: (state, action) => {
            let newBoards = [state.room].map((info)=>{
                if(info.roomId === action.payload.roomId){  
                    info.currentBalance = Number(info.currentBalance) - Number(action.payload.currentBalance);
                    return info;
                }else{
                    return info;
                }
            })
            state.room = newBoards[0]
        },
        decrementCurrentCommission: (state, action) => {
            let newBoards = [state.room].map((info)=>{
                if(info.roomId === action.payload.roomId){  
                    info.currentCommission = Number(info.currentCommission) - Number(action.payload.currentCommission);
                    return info;
                }else{
                    return info;
                }
            })
            state.room = newBoards[0]
        },
        decrementTotalBalance: (state, action) => {
            let newBoards = [state.room].map((info)=>{
                if(info.roomId === action.payload.roomId){  
                    info.totalBalance = Number(info.totalBalance) - Number(action.payload.totalBalance);
                    return info;
                }else{
                    return info;
                }
            })
            state.room = newBoards[0]
        },
        updateCurrentBalance: (state, action) => {
            let newBoards = [state.room].map((info)=>{
                if(info.roomId === action.payload.roomId){  
                    info.currentBalance = Number(action.payload.currentBalance);
                    return info;
                }else{
                    return info;
                }
            })
            state.room = newBoards[0]
        },
        updateCurrentCommission: (state, action) => {
            let newBoards = [state.room].map((info)=>{
                if(info.roomId === action.payload.roomId){  
                    info.currentCommission = Number(action.payload.currentCommission);
                    return info;
                }else{
                    return info;
                }
            })
            state.room = newBoards[0]
        },
        updateSingleWholeRoom: (state, action) => {
            let newBoards = [state.room].map((info)=>{
                if(info.roomId === action.payload.roomId){  
                    return {...action.payload.roomInfo}
                }else{
                    return info;
                }
            })
            state.room = newBoards[0]
        },
        updateTotalBalance: (state, action) => {
            let newBoards = [state.room].map((info)=>{
                if(info.roomId === action.payload.roomId){  
                    info.totalBalance = Number(action.payload.totalBalance);
                    return info;
                }else{
                    return info;
                }
            })
            state.room = newBoards[0]
        },
    }
});

export const {  
    historyUpdate,
    roomFinish,
    resetRoomFinish,
    updateSingleWholeRoom,
    incrementCurrentBalance,
    incrementCurrentCommission,
    incrementTotalBalance,
    decrementCurrentBalance,
    decrementCurrentCommission,
    decrementTotalBalance,
    updateCurrentBalance,
    updateCurrentCommission,
    updateTotalBalance,
    addRoom,
    resetBoard,
    addNewMemberInRoom,
    addNewPlayerInRoom,
    addNewPlayingInRoom,
    addMultiplePlayingInRoom,
    removeSingleMemberInRoom,
    removeSinglePlayerInRoom,
    removeSinglePlayingInRoom,
    updateRunningStatusInRoom
} = roomSlice.actions;
export default roomSlice.reducer;


// boardFinish: true,
// nameWithCard: [
//     {
//         "index": 0,
//         "src": "/4374734231.png",
//         "name": "Jumol Ali",
//         "email": "dearvayu3@gmail.com",
//         "phone": "+8801303501463",
//         "userId": "4374734231",
//         "referralCode": "999999999999",
//         "id": 5,
//         "card": [
//             {
//                 "name": "Spades",
//                 "img__src": "/cards/p6.png",
//                 "card__index": 31,
//                 "card__symble": "6",
//                 "card__point": 6,
//                 "card__symble__point": 60
//             },
//             {
//                 "name": "Hearts",
//                 "img__src": "/cards/sj.png",
//                 "card__index": 49,
//                 "card__symble": "J",
//                 "card__point": 10,
//                 "card__symble__point": 110
//             },
//             {
//                 "name": "Hearts",
//                 "img__src": "/cards/sa.png",
//                 "card__index": 52,
//                 "card__symble": "A",
//                 "card__point": 1,
//                 "card__symble__point": 140
//             }
//         ],
//         "seen": true,
//         "packed": true,
//         "packedReasonMess": [
//             {
//                 "bengali": "Md Sohidul Islam এর সাথে যখন তুমি তোমার কার্ড শো করো তখন Md Sohidul Islam বিজয়ী হয় এবং তুমি পরাজিত হও। ",
//                 "english": "When you show your cards with Md Sohidul Islam, Md Sohidul Islam wins and you lose"
//             }
//         ],
//         "seenRound": 2,
//         "blindRound": 4,
//         "side": false,
//         "isTurn": false,
//         "timeUp": "2023-09-14T11:36:01.000Z"
//     },
//     {
//         "index": 1,
//         "src": "/999999999999.png",
//         "name": "Md Sohidul Islam",
//         "email": "dearvayu1@gmail.com",
//         "phone": "+8801303501461",
//         "userId": "999999999999",
//         "referralCode": "999999999999",
//         "id": 3,
//         "card": [
//             {
//                 "name": "Hearts",
//                 "img__src": "/cards/s8.png",
//                 "card__index": 46,
//                 "card__symble": "8",
//                 "card__point": 8,
//                 "card__symble__point": 80
//             },
//             {
//                 "name": "Diamonds",
//                 "img__src": "/cards/l10.png",
//                 "card__index": 22,
//                 "card__symble": "10",
//                 "card__point": 10,
//                 "card__symble__point": 100
//             },
//             {
//                 "name": "Clubs",
//                 "img__src": "/cards/k10.png",
//                 "card__index": 9,
//                 "card__symble": "10",
//                 "card__point": 10,
//                 "card__symble__point": 100
//             }
//         ],
//         "seen": true,
//         "packed": true,
//         "packedReasonMess": [
//             {
//                 "bengali": "আপনি খেলার প্রধান বিজয়ী ",
//                 "english": "You are the main winner of the game"
//             }
//         ],
//         "seenRound": 2,
//         "blindRound": 4,
//         "side": false,
//         "isTurn": false,
//         "timeUp": "2023-09-14T11:35:23.000Z"
//     },
//     {
//         "index": 2,
//         "src": "/6792457664.png",
//         "name": "Saniul Islam",
//         "email": "dearvayu2@gmail.com",
//         "phone": "+8801303501462",
//         "userId": "6792457664",
//         "referralCode": "999999999999",
//         "id": 4,
//         "card": [
//             {
//                 "name": "Diamonds",
//                 "img__src": "/cards/l7.png",
//                 "card__index": 19,
//                 "card__symble": "7",
//                 "card__point": 7,
//                 "card__symble__point": 70
//             },
//             {
//                 "name": "Spades",
//                 "img__src": "/cards/p9.png",
//                 "card__index": 34,
//                 "card__symble": "9",
//                 "card__point": 9,
//                 "card__symble__point": 90
//             },
//             {
//                 "name": "Diamonds",
//                 "img__src": "/cards/la.png",
//                 "card__index": 26,
//                 "card__symble": "A",
//                 "card__point": 1,
//                 "card__symble__point": 140
//             }
//         ],
//         "seen": true,
//         "packed": true,
//         "packedReasonMess": [
//             {
//                 "bengali": "তুমি যখন তোমার কার্ড Jumol Ali এর সাথে সাইড করে তখন Jumol Ali বিজয়ী হয় এবং তুমি পরাজিত হও ",
//                 "english": "When you side your cards with Jumol Ali, Jumol Ali wins and you lose"
//             }
//         ],
//         "seenRound": 2,
//         "blindRound": 3,
//         "side": false,
//         "isTurn": false,
//         "timeUp": "2023-09-14T11:35:25.000Z"
//     }
// ]