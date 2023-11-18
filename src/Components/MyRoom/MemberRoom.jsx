import { Box, Button, HStack, Text, useToast } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useJoinInRoomPrivateMutation } from '../../App/features/board/api';
import { useEnterPlayerInRoomMutation } from '../../App/features/room/api';
const MemberRoom = () => {

    const {accessIdes, member, player, playing, roomId, id, adminId} = useSelector((state)=> state?.room?.room);
    const toast = useToast();
    
    const userId = useSelector((state)=> state?.auth?.auth?.userId);


    const [provideInfo,{isLoading: enterIsLoading}] =  useEnterPlayerInRoomMutation();
    const [provideInfoPrivate,{data, isLoading, isError, isSuccess, error}] =  useJoinInRoomPrivateMutation();
    const navigate = useNavigate();


    useEffect(()=>{  
        if(!isLoading && isSuccess && !isError){
        if(data && data?.id > 0){  
            toast({
            title: "Successfully player invited!",
            duration: 4000,
            isClosable: true,
            status: 'success'
            })
        }else{
            toast({
            title: error?.data?.error?.message || "Internal server error!",
            duration: 4000,
            isClosable: true,
            status: 'error'
            })
        }
        }
        if(!isLoading && isError && !isSuccess){
        toast({
            title: error?.data?.error?.message || "Internal server error!",
            duration: 4000,
            isClosable: true,
            status: 'error'
        })
        }
    },[data, isLoading, isSuccess, isError, error])

    const handleInviteMember = () => {
        if(adminId === userId){ 
            let result = prompt('Enter your invited player user id...');
            if(result){
                provideInfoPrivate({userId: result, roomId, id});
            }else{
                toast({
                    title: "User id must be required!"
                })
            }
        }
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
                            isLoading={enterIsLoading}
                            onClick={()=> provideInfo({roomId, userId, id})}
                        >ENTER PLAYER ROOM</Button> 
                    </HStack>
                    <HStack 
                        justifyContent={'space-between'}
                        mt='2'
                    >
                        <Button 
                            width={'100%'}          
                            isDisabled={adminId !== userId}
                            isLoading={isLoading}
                            onClick={handleInviteMember}
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