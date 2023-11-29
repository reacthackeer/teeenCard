import { Box, Button, HStack, Text, useToast } from '@chakra-ui/react';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLeavePlayerInRoomMutation, useStartRoomMutation } from '../../App/features/room/api';
import PlayingCardView from './CardView';
const PlayerRoom = () => {
    const [leaveDebounceLoading, setLeaveDebounceLoading] = useState(false);
    const [startDebounceLoading, setStartDebounceLoading] = useState(false);
    const userId = useSelector((state)=> state?.auth?.auth?.userId);
    const {accessIdes, member, player, playing, roomId, id} = useSelector((state)=> state?.room?.room);

    let {boardFinish,nameWithCard} = useSelector((state)=> state.room); 
    console.log({boardFinish, nameWithCard});
    const toast = useToast();
    const [provideLeaveInfo, {data: leaveData, isLoading: leaveIsLoading, isError: leaveIsError, isSuccess: leaveIsSuccess, error: leaveError}] = useLeavePlayerInRoomMutation();
    const [provideStartInfo, {data: startData, isLoading: startIsLoading, isError: startIsError, isSuccess: startIsSuccess, error: startError}] = useStartRoomMutation();
    useEffect(()=>{  
        if(!startIsLoading && startIsError && !startIsSuccess && startError && startError?.data?.error?.message){
            toast({
                title: startError?.data?.error?.message,
                status: 'warning',
                isClosable: true
            })
        }
    },[startData, startIsError, startIsSuccess, startError]);
    useEffect(()=>{  
        if(!leaveIsLoading && leaveIsError && !leaveIsSuccess && leaveError && leaveError?.data?.error?.message){
            toast({
                title: leaveError?.data?.error?.message,
                status: 'warning',
                isClosable: true
            })
        }
    },[leaveData, leaveIsError, leaveIsSuccess, leaveError]);
    const navigate = useNavigate();

    const handleLeave = () => {
        setLeaveDebounceLoading(()=> false);
        if(roomId && userId && id){
            provideLeaveInfo({roomId, userId, id});
        }
    }
    const leaveDebounce = _.debounce(handleLeave, 1000)
    const handleLeaveFirst = () => {
        setLeaveDebounceLoading(()=> true);
        leaveDebounce();
    }

    const handleStart = () => {
        setStartDebounceLoading(()=> false);
        if(roomId && userId && id){
            provideStartInfo({roomId, userId, id})
        }
    }
    const startDebounce = _.debounce(handleStart, 1000);
    const handleStartFirst = () => {
        setStartDebounceLoading(()=> true);
        startDebounce();
    }
    return (
        <React.Fragment>
            {
                !boardFinish &&  
                <Box  className='my__room__main__container' p={2}>
            <Box
                display={'flex'}
                flexDir={'column'} 
                height={'100%'} 
                justifyContent={'space-between'}
                alignItems={'baseline'}
            >
                <Box width={'100%'}>
                    <HStack justifyContent={'space-between'}>
                        <Button width={'calc(70% - 5px)'}>INVITED</Button>
                        <Button width={'calc(30% - 5px)'}>{accessIdes?.length}</Button>
                    </HStack>
                    <HStack justifyContent={'space-between'} mt='2'>
                        <Button width={'calc(70% - 5px)'}>MEMBER</Button>
                        <Button width={'calc(30% - 5px)'}>{member?.length}</Button>
                    </HStack>
                    <HStack justifyContent={'space-between'} mt='2'>
                        <Button width={'calc(70% - 5px)'}>PLAYER</Button>
                        <Button width={'calc(30% - 5px)'}>{player?.length}</Button>
                    </HStack>
                    <HStack justifyContent={'space-between'} mt='2'>
                        <Button width={'calc(70% - 5px)'}>PLAYING</Button>
                        <Button width={'calc(30% - 5px)'}>{playing?.length}</Button>
                    </HStack>
                    <HStack justifyContent={'space-between'} mt='2'>
                        <Button width={'calc(50% - 5px)'}>POSITION</Button>
                        <Button width={'calc(50% - 5px)'}>PLAYER ROOM</Button>
                    </HStack>
                </Box>    
                
                <Text textAlign={'justify'} fontWeight='bold' mt='4' color={'tomato'}>If you want to play then please Enter Player room And If you do not play Please Leave Player room as soon as possible</Text>

                <Box width={'100%'} mt='3'>
                    <HStack 
                        justifyContent={'space-between'}
                        mt='2'
                    >
                        <Button 
                            width={'100%'}                
                            isLoading={leaveIsLoading || leaveDebounceLoading}
                            onClick={handleLeaveFirst}
                        >LEAVE PLAYER ROOM</Button> 
                    </HStack>
                    <HStack 
                        justifyContent={'space-between'}
                        mt='2'
                    >
                        <Button 
                            width={'100%'}                
                            isLoading={leaveIsLoading || startDebounceLoading || startIsLoading}
                            isDisabled={player?.length < 2}
                            onClick={handleStartFirst}
                        >START BOARD</Button> 
                    </HStack>
                    <HStack 
                        justifyContent={'space-between'}
                        mt='2'
                        onClick={()=> navigate('/boards')}
                    >
                        <Button 
                            width={'100%'}
                        >BOARD PAGE</Button> 
                    </HStack>
                    <HStack 
                        justifyContent={'space-between'}
                        mt='2'
                    >
                        <Button 
                            width={'100%'}
                            onClick={()=> navigate('/profile')}
                        >PROFILE</Button> 
                    </HStack>
                </Box>  
            </Box>
        </Box>
            }
            {
                boardFinish && <Box className='my__room__main__container'>  
                                    <Box className='my__playing__room__man__container'> 
                                        <Box className='loading__container'> 
                                            <PlayingCardView/>
                                        </Box>
                                    </Box>
                                </Box>
            }
        </React.Fragment>
    );
};

export default PlayerRoom;