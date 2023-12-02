import { Box } from '@chakra-ui/react';
import nuid from 'number-uid';
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from 'socket.io-client';
import { updateSystemCurrency, updateSystemLanguage } from './App/features/Home/homeSlice';
import { userBalanceDecrement, userBalanceIncrement } from './App/features/auth/authSlice';
import { addMultiplePlayingInBoard, addNewBoard, addNewMemberInBoard, addNewPlayerInBoard, addNewPlayingInBoard, removeBoard, removeSingleMember, removeSinglePlayer, removeSinglePlaying, updateIdesAndRoomWithId, updateRunningStatus, updateSingleWholeBoard } from './App/features/board/boardSlice';
import { addMultiplePlayingInRoom, addNewMemberInRoom, addNewPlayerInRoom, addNewPlayingInRoom, removeSingleMemberInRoom, removeSinglePlayerInRoom, removeSinglePlayingInRoom, resetRoomFinish, roomFinish, updateRunningStatusInRoom, updateSingleWholeRoom } from './App/features/room/roomSlice';
import { serverPort } from "./App/store";
import ErrorBoundary from './ErrorBoundary';
import UserCover from "./UserCover";
const Cover = ({children}) => {    
    const [socket, setSocket] = useState(null);
    const [socketConnected, setSocketConnected] = useState(false);
    const userId = useSelector((state)=> state?.auth?.auth?.userId);
    const myRoomId = useSelector((state)=> state.room.roomId);
    
    const dispatch = useDispatch();
    
    useEffect(()=>{   
        if(!socket?.connected){
            let newUid;
            let socketConnectInfos = {
                userId: '',
                roomId: 'false',
                inRoom: 'false',
            }
            let localRoomId = localStorage.getItem('room__id') || '';
            if(localRoomId){
                socketConnectInfos.roomId = localRoomId;
                socketConnectInfos.inRoom = 'true';
            }
            let localUid = localStorage.getItem('user__id') || '';
                if(localUid){
                    socketConnectInfos.userId = localUid
                }else{
                    let generatedUid = nuid(10);
                    newUid = generatedUid;
                    socketConnectInfos.userId = generatedUid
                    localStorage.setItem('user__id', generatedUid);
                } 
            var newSocket = io(serverPort,{
                pingInterval: 30000,
                pingTimeout: 40000
            }); 
                newSocket.emit('connected', socketConnectInfos);
                newSocket.on('connectedFromServer',()=>{ 
                    setSocket(()=> newSocket);
                    setSocketConnected(()=> true);
                })
        }
        let systemLanguage = 'english';
        let newSystemLanguage = localStorage.getItem('system__language') || '';
        if(newSystemLanguage){
            systemLanguage = newSystemLanguage;
        }
        dispatch(updateSystemLanguage(systemLanguage));
        let defaultCurrency = {name: 'Usd', dollar: 1, currencyRate: 1};
        let newDefaultCurrency = JSON.parse(localStorage.getItem('default__currency')) || '';
        if(!newDefaultCurrency){
            localStorage.setItem('default__currency', JSON.stringify(defaultCurrency))
            dispatch(updateSystemCurrency(defaultCurrency));
        }else{
            dispatch(updateSystemCurrency(newDefaultCurrency));
        }
    },[]);  
    
    useEffect(()=>{
        if(socket && socketConnected && socket?.connected){
            let goodAudio = document.querySelector('.audio__good');
            socket.on('addNewMemberInRoom',({roomId, userId: adminId})=>{

                let newInfo = {roomId, userId: adminId}; 
                dispatch(addNewMemberInBoard(newInfo));
                dispatch(addNewMemberInRoom(newInfo));

                if(userId === adminId && roomId === myRoomId){ 
                    if(goodAudio){
                        goodAudio.play();
                    }
                }
            });
            socket.on('addNewPlayerInRoom',({roomId, userId:adminId, userInfo})=>{
                let newInfo = {roomId, userId: adminId, userInfo}; 
                dispatch(addNewPlayerInBoard(newInfo)) 
                dispatch(addNewPlayerInRoom(newInfo))

                if(userId === adminId && roomId === myRoomId){ 
                    if(goodAudio){
                        goodAudio.play();
                    }
                }
            });
            socket.on('addNewPlayingInRoom',({roomId, userId:adminId, userInfo}) => {
                let newInfo = {roomId, userId: adminId, userInfo};
                dispatch(addNewPlayingInBoard(newInfo));
                dispatch(addNewPlayingInRoom(newInfo));

                if(userId === adminId && roomId === myRoomId){
                    if(goodAudio){
                        goodAudio.play();
                    }
                }
            });
            socket.on('addMultiplePlayingInRoom',({roomId,  userInfos})=>{
                let newInfo = {roomId,  userInfos};
                dispatch(addMultiplePlayingInBoard(newInfo));
                dispatch(addMultiplePlayingInRoom(newInfo));
                if(roomId === myRoomId){
                    if(goodAudio){
                        goodAudio.play();
                    }
                }

            });
            socket.on('leaveSingleMemberInRoom',({roomId, userId: adminId})=>{
                let newInfo = {roomId, userId: adminId};
                dispatch(removeSingleMember(newInfo));
                dispatch(removeSingleMemberInRoom(newInfo));
                if(userId === adminId && roomId === myRoomId){
                    if(goodAudio){
                        goodAudio.play();
                    }
                }
            });
            socket.on('leaveSinglePlayerInRoom',({userId: adminId, roomId})=>{
                let newInfo = {userId: adminId, roomId};
                dispatch(removeSinglePlayer(newInfo))
                dispatch(removeSinglePlayerInRoom(newInfo))
                if(userId === adminId && roomId === myRoomId){
                    if(goodAudio){
                        goodAudio.play();
                    }
                }
            });
            socket.on('leaveSinglePlayingInRoom',({roomId, userId: adminId})=>{
                let newInfo = {roomId, userId: adminId};
                dispatch(removeSinglePlaying(newInfo)); 
                dispatch(removeSinglePlayingInRoom(newInfo)); 
                if(userId === adminId && roomId === myRoomId){
                    if(goodAudio){
                        goodAudio.play();
                    }
                }
            });
            socket.on('updateSingleRoomRunningStatus',({roomId, isStart}) => {
                let newInfo = {roomId, isStart};
                dispatch(updateRunningStatus(newInfo));
                dispatch(updateRunningStatusInRoom(newInfo));
            });
            socket.on('addNewRoom',({boardInfo, roomId})=>{ 
                let newInfo = {boardInfo, roomId};
                dispatch(addNewBoard(newInfo));
            });
            socket.on('removeSingleRoom',({roomId, userId})=>{  
                let newInfo = {roomId, userId};
                dispatch(removeBoard(newInfo));
            });
            socket.on('startMyRoom',({roomId, roomInfo})=>{ 
                dispatch(resetRoomFinish({roomId}));
                dispatch(updateSingleWholeBoard({roomId, roomInfo}));
                dispatch(updateSingleWholeRoom({roomId,roomInfo}));
                if(roomInfo?.accessIdes?.indexOf(userId) !== -1){ 
                    let balanceType = `${roomInfo.balanceType.toLowerCase()}Balance`; 
                    dispatch(userBalanceDecrement({balanceType, amount: Number(roomInfo.board)}))
                }
                if(roomId === myRoomId){
                    if(goodAudio){
                        goodAudio.play();
                    }
                }
            });
            socket.on('seeSomeOneCard',({roomId, roomInfo})=>{
                dispatch(updateSingleWholeBoard({roomId, roomInfo}));
                dispatch(updateSingleWholeRoom({roomId,roomInfo}));
                if(roomId === myRoomId){
                    if(goodAudio){
                        goodAudio.play();
                    }
                }
            });
            socket.on('seeMyCard',({roomId, roomInfo, userId:currentUserId, playingInfo})=>{
                dispatch(updateSingleWholeBoard({roomId, roomInfo}));
                dispatch(updateSingleWholeRoom({roomId,roomInfo}));
                if(userId === currentUserId){
                    dispatch(roomFinish({playingInfo, roomId}))
                }
                if(userId === currentUserId && roomId === myRoomId){
                    if(goodAudio){
                        goodAudio.play();
                    }
                }
            });
            socket.on('packUpSingleUser',({roomId, roomInfo, connectedInfo})=>{ 
                dispatch(updateSingleWholeBoard({roomId, roomInfo}));
                dispatch(updateSingleWholeRoom({roomId,roomInfo}));
                dispatch(updateIdesAndRoomWithId(connectedInfo));
                if(roomId === myRoomId){
                    if(goodAudio){
                        goodAudio.play();
                    }
                }
            });
            socket.on('boardFinish',({roomId, roomInfo, playingInfo, userId: socketUserId, amount})=>{
                dispatch(updateSingleWholeBoard({roomId, roomInfo}));
                dispatch(updateSingleWholeRoom({roomId,roomInfo}));
                dispatch(roomFinish({playingInfo, roomId}));
                if(userId === socketUserId){ 
                    let balanceType = `${roomInfo.balanceType.toLowerCase()}Balance`;
                    dispatch(userBalanceIncrement({balanceType, amount: Number(amount)}))
                }
                if(roomId === myRoomId){
                    if(goodAudio){
                        goodAudio.play();
                    }
                }
            });
            socket.on('boardFinishWithIncrementAndDecrement',({roomId, roomInfo, playingInfo, userId: socketUserId, amount, decrement})=>{
                dispatch(updateSingleWholeBoard({roomId, roomInfo}));
                dispatch(updateSingleWholeRoom({roomId,roomInfo}));
                dispatch(roomFinish({playingInfo, roomId}));
                if(userId === socketUserId){ 
                    let balanceType = `${roomInfo.balanceType.toLowerCase()}Balance`;
                    dispatch(userBalanceDecrement({balanceType, amount: Number(decrement)}));
                    dispatch(userBalanceIncrement({balanceType, amount: Number(amount)}));
                }
                if(roomId === myRoomId){
                    if(goodAudio){
                        goodAudio.play();
                    }
                }
            });
            socket.on('anyoneHitSuccess',({roomId, roomInfo, userId: socketUserId, amount})=>{
                dispatch(updateSingleWholeBoard({roomId, roomInfo}));
                dispatch(updateSingleWholeRoom({roomId,roomInfo}));
                if(userId === socketUserId){ 
                    let balanceType = `${roomInfo.balanceType.toLowerCase()}Balance`;
                    dispatch(userBalanceDecrement({balanceType, amount: Number(amount)}))
                }
                if(roomId === myRoomId){
                    let goodAudio = document.querySelector('.audio__good');
                    if(goodAudio){
                        goodAudio.play();
                    }
                }
            });
            socket.on('anyoneHitFailButCompareWin',({roomId, roomInfo, userId: socketUserId, amount})=>{
                dispatch(updateSingleWholeBoard({roomId, roomInfo}));
                dispatch(updateSingleWholeRoom({roomId,roomInfo}));
                if(userId === socketUserId){ 
                    let balanceType = `${roomInfo.balanceType.toLowerCase()}Balance`;
                    dispatch(userBalanceIncrement({balanceType, amount: Number(amount)}))
                }
                if(roomId === myRoomId){
                    if(goodAudio){
                        goodAudio.play();
                    }
                }
            });
            socket.on('anyoneHitFailButCompareFail',({roomId, roomInfo})=>{
                dispatch(updateSingleWholeBoard({roomId, roomInfo}));
                dispatch(updateSingleWholeRoom({roomId,roomInfo}));
                if(roomId === myRoomId){
                    if(goodAudio){
                        goodAudio.play();
                    }
                }
            }); 
        }
    },[socket, socketConnected]);

    return (

            <Box className="body__view__upper__main__cover__container">
                <Box
                    width={'0'}
                    height={'0'}
                    opacity={'0'}
                    overflow={'hidden'}
                >
                    <audio controls className='audio__good'> 
                        <source src="/mp3/goodnews.mp3" type="audio/mp3"/>  
                    </audio>   
                </Box>
                <Box boxShadow={`${socketConnected ? '0 0 5px green inset !important' : "0 0 5px red inset !important"}`} className="body__view__main__container" maxW={'500px'}>
                    <UserCover>
                        <ErrorBoundary> 
                            {
                                children
                            } 
                        </ErrorBoundary>
                    </UserCover>
                </Box>
            </Box>

    );
};

export default Cover;
