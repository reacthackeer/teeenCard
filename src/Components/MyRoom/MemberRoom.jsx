import { Box, Button, HStack, Text, useToast } from '@chakra-ui/react';
import _ from 'lodash';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useJoinInRoomPrivateMutation } from '../../App/features/board/api';
import { useEnterPlayerInRoomMutation } from '../../App/features/room/api';
const MemberRoom = () => {
    const [enterDebounceLoading, setEnterDebounceLoading] = useState(false);
    const [inviteDebounceLoading, setInviteDebounceLoading] = useState(false);

    const {accessIdes, member, player, playing, roomId, id, adminId} = useSelector((state)=> state?.room?.room);
    const toast = useToast();
    
    const userId = useSelector((state)=> state?.auth?.auth?.userId);


    const [provideInfo,{isLoading: enterIsLoading}] =  useEnterPlayerInRoomMutation();
    const [provideInfoPrivate,{data, isLoading, isError, isSuccess, error}] =  useJoinInRoomPrivateMutation();
    const navigate = useNavigate();

    const confirmInvite = (postInfo) => {
        setInviteDebounceLoading(()=> false);
        provideInfoPrivate(postInfo);
    }

    const confirmDebounce = _.debounce(confirmInvite, 1000);
    const handleInviteMember = () => {
        if(adminId === userId){ 
            let result = prompt('Enter your invited player user id...');
            if(result && roomId && id){
                confirmDebounce({userId: result, roomId, id})
            }else{
                toast({
                    title: "User id must be required!"
                })
            }
        }
    }
    const inviteDebounce = _.debounce(handleInviteMember, 1000);
    const handleInviteMemberFirst = () => {
        setInviteDebounceLoading(()=> true);
        inviteDebounce();
    }

    const handleEnter = () => {
        setEnterDebounceLoading(()=> false);
        if(roomId && userId && id){
            provideInfo({roomId, userId, id})
        }
    }
    const enterDebounce = _.debounce(handleEnter, 1000)
    const handleEnterFirst = () => {
        setEnterDebounceLoading(()=> true);
        enterDebounce();
    }
    return (
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
                        <Button width={'calc(50% - 5px)'}>MEMBER ROOM</Button>
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
                            isLoading={enterIsLoading || enterDebounceLoading}
                            onClick={handleEnterFirst}
                        >ENTER PLAYER ROOM</Button> 
                    </HStack>
                    <HStack 
                        justifyContent={'space-between'}
                        mt='2'
                    >
                        <Button 
                            width={'100%'}          
                            isDisabled={adminId !== userId}
                            isLoading={isLoading || inviteDebounceLoading}
                            onClick={handleInviteMemberFirst}
                        >INVITE MEMBER</Button> 
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
    );
};

export default MemberRoom;