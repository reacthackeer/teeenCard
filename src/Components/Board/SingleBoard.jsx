import { Box, Button, Heading, Text, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import Countdown from 'react-countdown';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useDeleteSingleBoardMutation, useJoinInRoomMutation, useLeaveInRoomMutation } from '../../App/features/board/api';

const SingleBoard = ({info}) => {   
    const toast = useToast();
    let userId = useSelector((state)=> state.auth.auth.userId);
    const navigate = useNavigate();
    let userIdes = useSelector((state)=> state.board.userIdes);
    
    const [provideInfo,{isLoading, isSuccess, data, isError}] = useDeleteSingleBoardMutation();
    const [provideJoinInfo,{isLoading: joinIsLoading, isSuccess: joinIsSuccess, isError: joinIsError, data: joinData}] = useJoinInRoomMutation();
    const [provideLeaveInfo,{isLoading: leaveIsLoading, isSuccess: leaveIsSuccess, isError: leaveIsError, data: leaveData}] = useLeaveInRoomMutation();

    useEffect(()=>{
        if(!joinIsLoading && joinIsSuccess && !joinIsError && joinData && joinData?.id > 0){
            toast({title: 'Successfully joined', status: 'success'})
        }
        if(!joinIsLoading && !joinIsSuccess && joinIsError){
            toast({title: 'Internal server error!', status: 'warning'})
        }
    },[joinIsLoading, joinIsSuccess, joinIsError, joinData]);
    
    useEffect(()=>{
        if(!leaveIsLoading && leaveIsSuccess && !leaveIsError && leaveData && leaveData?.id > 0){
            toast({title: 'Successfully leaved', status: 'success'})
        }
        if(!leaveIsLoading && !leaveIsSuccess && leaveIsError){
            toast({title: 'Internal server error!', status: 'warning'})
        }
    },[leaveIsLoading, leaveIsSuccess, leaveIsError, leaveData]);
    useEffect(()=>{
        if(!isLoading && isSuccess && !isError && data && data?.id > 0){
            localStorage.removeItem('room__id');
            toast({title: 'Successfully deleted your board.', status: 'success'})
        }
        if(!isLoading && !isSuccess && isError){
            toast({title: 'Internal server error!', status: 'warning'})
        }
    },[isLoading, isSuccess, isError, data]);
    

    const [showManual, setShowManual] = useState(false);
    const handleJoinInRoom = () => { 
        let getUserId = prompt('Enter your user ID for join this board :)')
        if(getUserId && getUserId === userId){ 
            provideJoinInfo({id: info.id, roomId: info.roomId, userId})
        }
    }
    const handleLeaveInRoom = () => { 
        let getUserId = prompt('Enter your user ID for leave this board :)')
        if(getUserId && getUserId === userId){ 
            provideLeaveInfo({id: info.id, roomId: info.roomId, userId})
        }
    }
    return (
        <Box boxShadow={'0 0 3px green'} rounded={'md'} mb='3' p='2'>
            <Box textAlign={'center'} mb='3'>
                <Heading fontSize={'xl'}>{info.name}</Heading>
            </Box>
            <Box display={'grid'}  gridTemplateColumns={'auto auto'} gridGap={'3'}>
                <Box  
                    display={'grid'}
                    gridTemplateColumns={'auto auto'}
                    justifyContent={'space-around'}  
                    gridGap={'3'}
                >
                    <Button>JOIN</Button>
                    <Button>{info.join} $</Button>
                    <Button>BOARD</Button>
                    <Button>{info.board} $</Button>
                    <Button>BLIND</Button>
                    <Button>{info.blind} $</Button> 
                    <Button>CHAAL</Button>
                    <Button>{info.chaal} $</Button>     
                </Box>
                <Box  
                    display={'grid'}
                    gridTemplateColumns={'auto auto'}
                    justifyContent={'space-around'}
                    gridGap={'3'}
                >
                    <Button>BALANCE</Button>
                    <Button>{info.balanceType.toUpperCase()}</Button>   
                    <Button>RUNNING</Button>
                    <Button>{info.isStart === 'true' ? "YES" : "NO"}</Button>   
                    <Button>MEMBER</Button>
                    <Button>{info.member.length}</Button>     
                    <Button>PLAYER</Button>
                    <Button>{info.player.length}</Button>     
                </Box> 
            </Box> 
            <Box display={'grid'}  gridTemplateColumns={'100%'} gridGap={'3'}>
            <Box  
                display={'grid'}
                gridTemplateColumns={'calc(80% - 12px) 20%'}
                justifyContent={'space-around'}   
                gridGap={3}
                mt='3'
            >
                <Button width={'100%'}>Board Type</Button>
                <Button width={'100%'}>{info.type}</Button>
                <Button width={'100%'}>SCHEDULE</Button>
                <Button width={'100%'}>{info.isSchedule === 'true' ? "YES": "NO"}</Button>
                <Button width={'100%'}>Hit Increasable</Button>
                <Button width={'100%'}>{info.increase === 'true'? "YES":"NO"}</Button>
                <Button width={'100%'}>Comparable</Button>
                <Button width={'100%'}>{info.compare === 'true'? "YES" : "NO"}</Button> 
                <Button width={'100%'}>Max Player Allowed</Button>
                <Button width={'100%'}>{info.maxPlayer}</Button>
                <Button width={'100%'}>Maximum Blind Hit</Button>
                <Button width={'100%'}>{info.maxBlindHit}</Button>
                <Button width={'100%'}>Minimum Blind Hit</Button>
                <Button width={'100%'}>{info.minBlindHit}</Button> 
                <Button width={'100%'}>Maximum Chaal Hit</Button>
                <Button width={'100%'}>{info.maxChaalHit}</Button>
                <Button width={'100%'}>Minimum Chaal Hit</Button>
                <Button width={'100%'}>{info.minChaalHit}</Button> 
            </Box> 
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
                    onClick={handleJoinInRoom}
                    isLoading={joinIsLoading}
                >Join</Button>
                <Button 
                    size='sm' 
                    colorScheme='whatsapp'
                    display={userIdes.indexOf(userId) !== -1 && info.member.indexOf(userId) !== -1 ? 'inline' : 'none'}
                    onClick={handleLeaveInRoom}
                    isLoading={leaveIsLoading}
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
                        onClick={()=> provideInfo({userId, id: info.id, roomId: info.roomId})}
                        size='sm' 
                        isLoading={isLoading}
                        colorScheme='red'
                    >DELETE</Button>
                } 
                <CopyToClipboard text={userId}>
                    <Button 
                        size='sm' 
                        colorScheme='whatsapp'
                        onClick={()=> toast({
                            title: 'Successfully user id copied!',
                            status: 'success'
                        })}
                    >Copy User ID</Button> 
                </CopyToClipboard>
            </Box>
        </Box>
    );
};

export default SingleBoard;