import { Avatar, Box, Button, HStack, Text } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import Countdown from 'react-countdown';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useHitBlindOneExeMutation, useHitBlindTwoExeMutation, useHitChaalOneExeMutation, useHitChaalTwoExeMutation, usePackUpMyCardMutation, useSeeMyPlayingCardMutation, useShowMyCardMutation, useSideMyCardMutation } from '../../App/features/room/api';
import PlayingCardView from './CardView';

const PlayingRoom = () => {
    const {room, boardFinish, nameWithCard} = useSelector((state)=> state.room); 
    let {currentId, isStart, totalBalance, increase, playing, roomId, id} = room;
    const myBalance = useSelector((state)=> state.auth.auth[`${room.balanceType}Balance`]);
    const {userId, name} = useSelector((state)=> state.auth.auth); 
    let {seen} = room.playing.filter((info)=> info.userId === userId)[0]; 
    const [provideBlindOneExeInfo]= useHitBlindOneExeMutation();
    const [provideBlindTwoExeInfo]= useHitBlindTwoExeMutation();
    const [provideChaalOneExeInfo]= useHitChaalOneExeMutation();
    const [provideChaalTwoExeInfo]= useHitChaalTwoExeMutation();
    const [providePackUpMyCardInfo]= usePackUpMyCardMutation();
    const [provideCardSideInfo]= useSideMyCardMutation();
    const [provideCardShowInfo]= useShowMyCardMutation();

    const [provideSeePlayingCardInfo,{data, isLoading, isError, isSuccess, error}]= useSeeMyPlayingCardMutation();

    const handleAddStyle = () => {
        let myRoomElement = document.querySelector('.my__room__main__container');
        let boardController = document.querySelector('.board__controller__main__container');
        let myBalanceBodyView = document.querySelector('.body__my__balanceView');
        if(myBalanceBodyView){
            myBalanceBodyView.classList.add('active')
        }
        if(myRoomElement){
            myRoomElement.classList.add('active');
            
        }
        if(boardController){
            boardController.classList.add('active');
        }
    }
    const handleRemoveStyle = () => {
        let myRoomElement = document.querySelector('.my__room__main__container');
        let boardController = document.querySelector('.board__controller__main__container');
        let myBalanceBodyView = document.querySelector('.body__my__balanceView');
        if(myBalanceBodyView && myBalanceBodyView.classList.contains('active')){
            myBalanceBodyView.classList.remove('active')
        }
        if(myRoomElement && myRoomElement.classList.contains('active')){
            myRoomElement.classList.remove('active');
            
        }
        if(boardController && boardController.classList.contains('active')){
            boardController.classList.remove('active');
        }
    }

    const SideAbleUser = () => {
        let showArray = [];
        playing.forEach((info)=>{
            if(info.seen){
                showArray.push(true);
            }else{
                showArray.push(false);
            }
        })
        let falseCurrentIndex = showArray.indexOf(false);
        let resetPlaying = playing.filter((info)=> info.packed === false);
        if(falseCurrentIndex === -1 && resetPlaying.length > 2){
            return true;
        }else{
            return false;
        }
    }

    const showAbleUser = () => {
        let showArray = [];
        playing.forEach((info)=>{
            if(info.seen){
                showArray.push(true);
            }else{
                showArray.push(false);
            }
        })
        let falseCurrentIndex = showArray.indexOf(false); 
        let resetPlaying = playing.filter((info)=> info.packed === false);
        if(falseCurrentIndex === -1 && resetPlaying.length === 2){
            return true;
        }else{
            return false;
        }
    }
    const handleGetUpPackedUser = () => {
        return room.playing.filter((info)=> info.packed === false);
    }
    useEffect(()=>{
        // console.log({data, isLoading, isError, isSuccess, error});
    },[data, isLoading, isError, isSuccess, error])
    useEffect(()=>{
        if(currentId === userId && isStart === 'true' && !boardFinish){
            handleAddStyle();
        }else{
            handleRemoveStyle();
        }
    },[currentId, isStart, totalBalance,boardFinish])
    return (
        <React.Fragment>
            {
                !boardFinish && <Box className='my__room__main__container'>  
                <Box className='my__playing__room__man__container'> 
                    <div className='my__room__element__container'>
                        {
                        room && room.isStart === 'true' && handleGetUpPackedUser().length > 0  &&
                        <Box 
                            className='player__main__container'
                            display={'flex'}
                            flexWrap={'wrap'}
                            rowGap={'5'} 
                            justifyContent={'space-between'}
                            py='3'
                        >
                            {

                                handleGetUpPackedUser().map((info, index)=> {  
                                    console.log({info});
                                    return(
                                        <Box
                                            display={'flex'}
                                            flexWrap={'wrap'}
                                            flexDirection={'column'}  
                                            justifyContent={'center'}
                                            alignItems={'center'}
                                            key={index}
                                            width={'calc(33.33% - 5px)'} 
                                            overflow={'hidden'} 
                                            bg='yellow.100'
                                            margin={0}
                                        >   
                                            <Avatar name='MD SOHIDUL ISLAM' src={'http://localhost:3000'+info?.src} border={'1px solid red'}/>
                                            <Button
                                                width='100%'
                                                size='sm'
                                                colorScheme={info.isTurn ? 'whatsapp' : 'gray'} 
                                            >
                                                <marquee>{`${info.seen ? 'SEEN' : "UNSEEN"}`}</marquee>
                                            </Button>
                                            <Button
                                                width='100%'
                                                size={'sm'}
                                                colorScheme={info.isTurn ? 'whatsapp' : 'gray'}
                                            >
                                                <marquee>
                                                    {`${info.seen ? 'SEEN' : "UNSEEN"}`}
                                                </marquee>
                                            </Button>
                                            {info.isTurn && <Button
                                                size={'sm'}
                                                colorScheme={info.isTurn && 'whatsapp'}
                                                width={'100%'}
                                            >
                                                <marquee>
                                                    <Countdown date={new Date(room.playing[0].timeUp)}/>
                                                </marquee>
                                            </Button>}
                                            <Button
                                                size={'sm'}
                                                colorScheme={info.isTurn ? 'whatsapp' : 'gray'} 
                                            >
                                                <marquee>{info.name}</marquee>
                                            </Button>
                                        </Box>
                                    )
                                })
                            }
                        </Box> 
                    }
                        <HStack
                            padding={'1'}
                            display={'flex'}
                            justify={'space-between'}
                            className='body__my__balanceView'
                        >
                            <Text>Room B: {Number(room.currentBalance).toFixed(3)} $</Text>
                            <Link to='/profile'>{room.balanceType.toUpperCase()}</Link>
                            <Text>My B: {Number(myBalance).toFixed(3)} $</Text>
                        </HStack>
                    </div>
                </Box>
                <Box className='board__controller__main__container'>
                    <HStack justify={'space-between'}>
                        <Text>Room B: {Number(room.currentBalance).toFixed(3)} $</Text>
                        <Link to='/profile'>{room.balanceType.toUpperCase()}</Link>
                        <Text>My B: {Number(myBalance).toFixed(3)} $</Text>
                    </HStack> 
                    <Box
                        display={'grid'}
                        gridTemplateColumns={'auto auto'}
                        gap={'2'}
                        mt='2'
                    >
                        {!seen && 
                            <Button 
                                onClick={()=> provideBlindOneExeInfo({roomId, id, userId})}
                            >Blind</Button>
                        }
                        {!seen && increase === 'true' && 
                            <Button
                                onClick={()=> provideBlindTwoExeInfo({roomId, id, userId})}
                            >Blind 2X</Button>
                        }
                        {
                            seen && 
                            <Button
                                onClick={()=> provideChaalOneExeInfo({roomId, id, userId})}
                            >Chaal</Button>
                        }
                        {
                            seen && increase === 'true' &&
                            <Button
                                onClick={()=> provideChaalTwoExeInfo({roomId, id, userId})}
                            >Chaal 2X</Button>
                        }
                        {
                            seen && SideAbleUser() &&
                            <Button
                                onClick={()=> provideCardSideInfo({roomId, id, userId})}
                            >Side</Button>
                        }
                        {
                            seen && showAbleUser() &&
                            <Button
                                onClick={()=> provideCardShowInfo({roomId, id, userId})}
                            >Show</Button>
                        }
                        <Button
                            onClick={()=> provideSeePlayingCardInfo({roomId, id, userId})}
                        >SEE CARD</Button>
                        <Button
                            onClick={()=> providePackUpMyCardInfo({roomId, id, userId})}
                        >Pack Up</Button>
                        <Button>Leave</Button>
                        <Button>Refresh</Button>
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

export default PlayingRoom;