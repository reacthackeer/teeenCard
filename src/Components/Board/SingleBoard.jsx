import { Box, Button, Heading, Text, useToast } from '@chakra-ui/react';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import Countdown from 'react-countdown';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useDeleteSingleBoardMutation, useJoinInRoomMutation, useLeaveInRoomMutation } from '../../App/features/board/api';

const SingleBoard = ({info}) => {    
    const [currentShowingIndex, setCurrentShowingIndex] = useState(0);
    const defaultCurrency = useSelector((state)=> state?.home?.currency);
    const [joinDebounceLoading, setJoinDebounceLoading] = useState(false);
    const [leaveDebounceLoading, setLeaveDebounceLoading] = useState(false);
    const [deleteDebounceLoading, setDeleteDebounceLoading] = useState(false);
    
    const toast = useToast();
    let userId = useSelector((state)=> state.auth.auth.userId);
    const navigate = useNavigate();
    let userIdes = useSelector((state)=> state.board.userIdes);
    
    const [provideInfo,{isLoading, isSuccess, data, isError}] = useDeleteSingleBoardMutation();
    const [provideJoinInfo,{isLoading: joinIsLoading, isSuccess: joinIsSuccess, isError: joinIsError, data: joinData}] = useJoinInRoomMutation();
    const [provideLeaveInfo,{isLoading: leaveIsLoading, isSuccess: leaveIsSuccess, isError: leaveIsError, data: leaveData}] = useLeaveInRoomMutation();
    
    useEffect(()=>{
        if(!isLoading && isSuccess && !isError && data && data?.id > 0){
            localStorage.removeItem('room__id'); 
        } 
    },[isLoading, isSuccess, isError, data]);
    

    const [showManual, setShowManual] = useState(false);

    const handleJoinInRoom = () => { 
        setJoinDebounceLoading(()=> false);
        if(info.id && info.roomId && userId){
            provideJoinInfo({id: info.id, roomId: info.roomId, userId})
        }
    }

    const handleJoinDebounce = _.debounce(handleJoinInRoom, 1000);


    const handleJoinInRoomFirst = () => {
        setJoinDebounceLoading(()=> true);
        handleJoinDebounce();
    }
    const handleLeaveInRoom = () => { 
        setLeaveDebounceLoading(()=> false);
        if(info.id && info.roomId && userId){
            provideLeaveInfo({id: info.id, roomId: info.roomId, userId});
        }
    }
    const handleLeaveDebounce = _.debounce(handleLeaveInRoom, 1000);

    const handleLeaveInRoomFirst = () => {
        setLeaveDebounceLoading(()=> true);
        handleLeaveDebounce();

    }

    const handleDelete = () => { 
        setDeleteDebounceLoading(()=> false);
        if(info.id && info.roomId && userId){
            provideInfo({id: info.id, roomId: info.roomId, userId});
        }
    }
    const handleDeleteDebounce = _.debounce(handleDelete, 1000)
    const handleDeleteFirst = () => {
        setDeleteDebounceLoading(()=> true);
        handleDeleteDebounce();
    }

    return (
        <Box boxShadow={'0 0 3px green'} rounded={'md'} mb='3' p='2'>
            <Box textAlign={'center'} mb='3'>
                <Heading fontSize={'xl'}>{info.name}</Heading>
            </Box>
            {/*balance and charge*/}
            <Box 
                width={'100%'}
                mb='2'
            >
                <Button
                    width={'100%'}
                    bg={currentShowingIndex === 1 ? 'telegram.300' : 'gray.100'}
                    onClick={()=> currentShowingIndex === 1 ? setCurrentShowingIndex(()=> 0) : setCurrentShowingIndex(()=> 1)}
                >Balance and charge</Button>

                {                
                    currentShowingIndex ===  1 &&
                    <Box  
                        display={'grid'}
                        gridTemplateColumns={'calc(70% - 12px) 30%'}
                        justifyContent={'space-around'}   
                        gridGap={3}
                        mt='3'
                    >   
                        <Button>BALANCE TYPE</Button>
                        <Button>{info.balanceType.toUpperCase()}</Button> 
                        <Button>JOIN</Button>
                        <Button>{Number(Number(info.join)*(Number(defaultCurrency.currencyRate))).toFixed(1)} {defaultCurrency.name.toUpperCase()}</Button>
                        <Button>BOARD</Button>
                        <Button>{Number(Number(info.board)*(Number(defaultCurrency.currencyRate))).toFixed(1)} {defaultCurrency.name.toUpperCase()}</Button>
                        <Button>BLIND HIT</Button>
                        <Button>{Number(Number(info.blind)*(Number(defaultCurrency.currencyRate))).toFixed(1)} {defaultCurrency.name.toUpperCase()}</Button> 
                        <Button>CHAAL HIT</Button>
                        <Button>{Number(Number(info.chaal)*(Number(defaultCurrency.currencyRate))).toFixed(1)} {defaultCurrency.name.toUpperCase()}</Button> 
                    </Box> 
                }
            </Box>
            {/*hit and hit limit*/}
            <Box 
                width={'100%'}
                mb='2'
            >
                <Button
                    width={'100%'}
                    bg={currentShowingIndex === 2 ? 'telegram.300' : 'gray.100'}
                    onClick={()=> currentShowingIndex === 2 ? setCurrentShowingIndex(()=> 0) : setCurrentShowingIndex(()=> 2)}
                >Hit and hit limit</Button>
                {                
                    currentShowingIndex ===  2 &&
                    <Box  
                        display={'grid'}
                        gridTemplateColumns={'calc(70% - 12px) 30%'}
                        justifyContent={'space-around'}   
                        gridGap={3}
                        mt='3'
                    >
                        <Button width={'100%'}>Maximum Blind Hit</Button>
                        <Button width={'100%'}>{info.maxBlindHit}</Button>
                        <Button width={'100%'}>Minimum Blind Hit</Button>
                        <Button width={'100%'}>{info.minBlindHit}</Button> 
                        <Button width={'100%'}>Maximum Chaal Hit</Button>
                        <Button width={'100%'}>{info.maxChaalHit}</Button>
                        <Button width={'100%'}>Minimum Chaal Hit</Button>
                        <Button width={'100%'}>{info.minChaalHit}</Button>
                    </Box> 
                }
            </Box>
            {/* player and limit*/}
            <Box 
                width={'100%'}
                mb='2'
            >
                <Button
                    width={'100%'}
                    bg={currentShowingIndex === 3 ? 'telegram.300' : 'gray.100'}
                    onClick={()=> currentShowingIndex === 3 ? setCurrentShowingIndex(()=> 0) : setCurrentShowingIndex(()=> 3)}
                >Player and limit</Button>

                {                
                            currentShowingIndex ===  3 &&
                            <Box  
                                display={'grid'}
                                gridTemplateColumns={'calc(70% - 12px) 30%'}
                                justifyContent={'space-around'}   
                                gridGap={3}
                                mt='3'
                            >
                                <Button width={'100%'}>Max Player Allowed</Button>
                                <Button width={'100%'}>{info.maxPlayer}</Button> 
                                <Button>MEMBER</Button>
                                <Button>{info.member.length}</Button>     
                                <Button>PLAYER</Button>
                                <Button>{info.player.length}</Button> 
                            </Box> 
                }
            </Box>
            {/* Board Condition*/}
            <Box 
                width={'100%'}
                mb='2'
            >
                <Button
                    width={'100%'}
                    bg={currentShowingIndex === 4 ? 'telegram.300' : 'gray.100'}
                    onClick={()=> currentShowingIndex === 4 ? setCurrentShowingIndex(()=> 0) : setCurrentShowingIndex(()=> 4)}
                >Board Condition</Button>

                {                
                            currentShowingIndex ===  4 &&
                            <Box  
                                display={'grid'}
                                gridTemplateColumns={'calc(70% - 12px) 30%'}
                                justifyContent={'space-around'}   
                                gridGap={3}
                                mt='3'
                            >
                                <Button>RUNNING</Button>
                                <Button>{info.isStart === 'true' ? "YES" : "NO"}</Button>   
                                <Button width={'100%'}>Board Type</Button>
                                <Button width={'100%'}>{info.type.toUpperCase()}</Button>
                                <Button width={'100%'}>SCHEDULE</Button>
                                <Button width={'100%'}>{info.isSchedule === 'true' ? "YES": "NO"}</Button>
                                <Button width={'100%'}>Hit Increasable</Button>
                                <Button width={'100%'}>{info.increase === 'true'? "YES":"NO"}</Button>
                                <Button width={'100%'}>Comparable</Button>
                                <Button width={'100%'}>{info.compare === 'true'? "YES" : "NO"}</Button> 
                            </Box> 
                }
            </Box>
            {showManual && 
            <Box m='2'>
                <Text textAlign={'justify'}>If you want to participate in this game then you need to have minimum {info.join} dollars in your account. ${info.board} per board fee during play. The blind hit ${info.blind}. chaal hits can be deducted ${info.chaal}. {info.balanceType.toUpperCase()} dollars can be deducted from your account during this game. (If Comparable: Yes) If your account runs out of {info.balanceType.toUpperCase()} dollars while playing, you can compare your cards with everyone else. If your card is first, then all the dollars of that board will be added to your account and the board balance will be 0 dollars and the game will continue as before. (If Increasable: Yes) Any player can increase hits while playing. Then the next player has to give that hit. Otherwise he has to pack. So read the board manual carefully before joining any board.</Text>
            </Box> }
            {
                info && info.isSchedule === 'true' && <Box textAlign={'center'} my='3'>
                <Heading fontSize={'sm'}>Hold On <Countdown date={new Date(info.startTime)}/></Heading>
            </Box>
            }
            <Box 
                display={'grid'}
                gridGap={'2'}
                gridTemplateColumns={'calc(50% - 5px) calc(50% - 5px)'} 
                mb='2'
                mt='4'
            >
                <Button 
                    size='sm' 
                    colorScheme='whatsapp'
                    display={userIdes.indexOf(userId) === -1 && info.member.indexOf(userId) === -1 && info.type !== 'private' ? 'inline' : 'none'}
                    onClick={handleJoinInRoomFirst}
                    isLoading={joinIsLoading || joinDebounceLoading}
                    textAlign={'center'}
                >Join</Button>
                <Button 
                    size='sm' 
                    colorScheme='whatsapp'
                    display={userIdes.indexOf(userId) !== -1 && info.member.indexOf(userId) !== -1 ? 'inline' : 'none'}
                    onClick={handleLeaveInRoomFirst}
                    isLoading={leaveIsLoading || leaveDebounceLoading}
                    textAlign={'center'}
                >Leave</Button>
                <Button 
                    size='sm' 
                    colorScheme='whatsapp' 
                    display={userIdes.indexOf(userId) !== -1 && info.member.indexOf(userId) !== -1 ? 'inline' : 'none'}
                    onClick={()=> navigate(`/boards/${info.id}`)}
                >Enter</Button>
                <Button 
                    size='sm' 
                    colorScheme='whatsapp'
                    onClick={()=> setShowManual(!showManual)} 
                >{showManual?'CLOSE':"Read manual"}</Button>
                {   userId 
                    && info.accessIdes.indexOf(userId) !== -1 
                    && info.accessIdes.length === 1 && 
                    <Button 
                        onClick={handleDeleteFirst}
                        size='sm' 
                        isLoading={isLoading || deleteDebounceLoading}
                        colorScheme='red'
                    >DELETE</Button>
                }  
            </Box>
        </Box>
    );
};

export default SingleBoard;