import { Avatar, Box, Button, HStack, Text, useToast } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import Countdown from 'react-countdown';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useLeaveInRoomMutation } from '../../App/features/board/api';
import { useHitBlindOneExeMutation, useHitBlindTwoExeMutation, useHitChaalOneExeMutation, useHitChaalTwoExeMutation, usePackUpMyCardMutation, useSeeMyPlayingCardMutation, useShowMyCardMutation, useSideMyCardMutation, useValidateUserMutation } from '../../App/features/room/api';
import PlayingCardView from './CardView';

const PlayingRoom = () => {
    const {room, boardFinish, nameWithCard} = useSelector((state)=> state.room); 
    let {currentId, isStart, totalBalance, increase, playing, roomId, id} = room;
    const myBalance = useSelector((state)=> state.auth.auth[`${room.balanceType}Balance`]);
    const {userId} = useSelector((state)=> state.auth.auth); 
    let {seen} = room.playing.filter((info)=> info.userId === userId)[0]; 
    // console.log(seen);
    const [provideBlindOneExeInfo, {isLoading: blindOneExeIsLoading}]= useHitBlindOneExeMutation();
    const [provideBlindTwoExeInfo, {isLoading: blindTwoExeIsLoading}]= useHitBlindTwoExeMutation();
    const [provideChaalOneExeInfo, {isLoading: chaalOneExeIsLoading}]= useHitChaalOneExeMutation();
    const [provideChaalTwoExeInfo, {isLoading: chaalTwoExeIsLoading}]= useHitChaalTwoExeMutation();
    const [provideValidateUserInfo,{isLoading: validateUserIsLoading, isError, error}]= useValidateUserMutation();
    const [provideLeaveInRoomInfo,{isLoading: leaveInRoomIsLoading, isError: isErrorLeave, error: errorLeave, isSuccess: isSuccessLeaveInRoom}]= useLeaveInRoomMutation();
    const [providePackUpMyCardInfo,{isLoading: packUpIsLoading}]= usePackUpMyCardMutation();
    const [provideCardSideInfo,{isLoading: sideCardIsLoading}]= useSideMyCardMutation();
    const [provideCardShowInfo, {isLoading: showCardIsLoading}]= useShowMyCardMutation();

    const [provideSeePlayingCardInfo,{isLoading: seeCardIsLoading}]= useSeeMyPlayingCardMutation();

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
        let resetPlaying = playing.filter((info)=> info.packed === false);
        resetPlaying.forEach((info)=>{
            if(info.seen){
                showArray.push(true);
            }else{
                showArray.push(false);
            }
        }) 
        let falseCurrentIndex = showArray.indexOf(false); 
        if(falseCurrentIndex === -1 && resetPlaying.length === 2){
            return true;
        }else{
            return false;
        }
    }
    const handleGetUpPackedUser = () => {
        return room.playing.filter((info)=> info.packed === false);
    } 

    const toast= useToast();

    useEffect(()=>{  
        if(isError && !validateUserIsLoading){
        toast({
            title: error?.data?.error?.message || "Internal server error!",
            duration: 4000,
            isClosable: true,
            status: 'error'
        })
        }
    },[validateUserIsLoading, isError, error])

    const navigate = useNavigate();
    useEffect(()=>{  
        if(isErrorLeave && !leaveInRoomIsLoading){
        toast({
            title: errorLeave?.data?.error?.message || "Internal server error!",
            duration: 4000,
            isClosable: true,
            status: 'error'
        })
        }

        if(isSuccessLeaveInRoom){
            navigate('/boards')
        }
    },[leaveInRoomIsLoading, isErrorLeave, errorLeave])

    useEffect(()=>{
        if(currentId === userId && isStart === 'true' && !boardFinish){
            handleAddStyle();
        }else{
            handleRemoveStyle();
        }
    },[currentId, isStart, totalBalance,boardFinish])

    const handleCheckIsSideRequired = () => {
        let result = false;

        room.playing.forEach((info)=>{
            if(info.userId === room.currentId){
                if(info.side){
                    result = true;
                }
            }
        });

        return result;
    } 
    const handleTimeUp = () => {
        let currentTimeUpTill = new Date();
        
        room.playing.forEach((info)=>{
            if(info.userId === room.currentId){
                currentTimeUpTill = new Date(info.timeUp);
            }
        }) 
        return currentTimeUpTill;
    }
    
    const handleLeaveMyInfo = () => {
        let result = prompt('If you want to leave this room please enter your userId');
        if(userId === result){
            provideLeaveInRoomInfo({roomId, userId, id});
        }
    } 

    const handleCheckSeeCardAvailable = () => {
        let result = true;
        playing.forEach((info)=>{
            if(info.userId === userId){
                if(room.minBlindHit <= info.blindRound){
                    result = false;
                }
            }
        })
        return result;
    }
    
    const handleSideAvailable = () => {
        let result = true;
        playing.forEach((info)=>{
            if(info.userId === userId){
                if(room.minChaalHit <= info.seenRound){
                    result = false;
                }
            }
        })
        return result;
    }


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
                            justifyContent={'space-evenly'}
                            py='3'
                        >
                            {

                                handleGetUpPackedUser().map((info, index)=> {    
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
                                            margin={0}
                                        >   
                                            <Avatar onClick={()=> navigate('/profile')} name='MD SOHIDUL ISLAM' src={'http://localhost:3000'+info?.src} border={'1px solid red'}/>
                                            <Button
                                                width='100%'
                                                size='sm'
                                                mt='2'
                                                colorScheme={info.isTurn ? 'whatsapp' : 'gray'} 
                                            >
                                                {`${info.seen ? 'SEEN' : "UNSEEN"}`}
                                            </Button> 
                                            {info.isTurn ? <Button
                                                size={'sm'}
                                                colorScheme={info.isTurn ? 'whatsapp' : 'grey'}
                                                width={'100%'}
                                                mt='1'
                                            > 
                                                    <Countdown  date={handleTimeUp()}/> 
                                            </Button>
                                            :<Button
                                                    size={'sm'}
                                                    colorScheme={info.isTurn ? 'whatsapp' : 'gray'}
                                                    width={'100%'}
                                                    mt='1'
                                                > 
                                                        00:00:00:00
                                                </Button> 
                                                }
                                            <Button
                                                width={'100%'}
                                                size={'sm'}
                                                mt='1'
                                                colorScheme={info.isTurn ? 'whatsapp' : 'gray'} 
                                            > {info.name}
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
                <Box 
                    className='board__controller__main__container'
                    display={'grid'}
                    gridTemplateColumns={'calc(50% - 10px) calc(50% - 10px)'}
                    gridColumnGap={'20px'}
                > 
                    <Box>
                        <Box
                            display={'grid'}
                            gridTemplateColumns={'auto auto'}
                            gap={'2'}
                            mt='2'
                        >
                        <Button
                            title='Room Balance'
                        >Room B {Number(room.currentBalance).toFixed(2)} $</Button>
                        <Button
                            title='My Balance'
                        >My B {Number(myBalance).toFixed(2)} $</Button>
                            {!seen && !handleCheckIsSideRequired() && 
                                <Button 
                                    onClick={()=> provideBlindOneExeInfo({roomId, id, userId})}
                                    isLoading={blindOneExeIsLoading}
                                >Blind - {Number(room.blind).toFixed(2)} $</Button>
                            }
                            {!seen && increase === 'true' &&  !handleCheckIsSideRequired() &&
                                <Button
                                    onClick={()=> provideBlindTwoExeInfo({roomId, id, userId})}
                                    isLoading={blindTwoExeIsLoading}
                                >Blind 2X  - {Number(room.blind).toFixed(2) * 2} $</Button>
                            }
                            {
                                seen &&  !handleCheckIsSideRequired() &&
                                <Button
                                    onClick={()=> provideChaalOneExeInfo({roomId, id, userId})}
                                    isLoading={chaalOneExeIsLoading}
                                >Chaal  - {Number(room.chaal).toFixed(2)} $</Button>
                            }
                            {
                                seen && increase === 'true' &&  !handleCheckIsSideRequired()&&
                                <Button
                                    onClick={()=> provideChaalTwoExeInfo({roomId, id, userId})}
                                    isLoading={chaalTwoExeIsLoading}
                                >Chaal 2X   - {Number(room.chaal).toFixed(2) * 2} $</Button>
                            }
                            {
                                seen && SideAbleUser() && 
                                <Button
                                    onClick={()=> provideCardSideInfo({roomId, id, userId})}
                                    isLoading={sideCardIsLoading}
                                    isDisabled={handleSideAvailable()}
                                >Side   - {Number(room.blind).toFixed(2) * 1} $</Button>
                            }
                            {
                                seen && showAbleUser() &&
                                <Button
                                    onClick={()=> provideCardShowInfo({roomId, id, userId})}
                                    isLoading={showCardIsLoading}
                                    isDisabled={handleSideAvailable()}
                                >Show   - {Number(room.blind).toFixed(2) * 1} $</Button>
                            }
                            <Button
                                onClick={()=> provideSeePlayingCardInfo({roomId, id, userId})}
                                isLoading={seeCardIsLoading}
                                isDisabled={handleCheckSeeCardAvailable()}
                            >SEE CARD</Button>
                            <Button
                                onClick={()=> providePackUpMyCardInfo({roomId, id, userId})}
                                isLoading={packUpIsLoading}
                            >Pack Up</Button>
                            <Button
                                onClick={handleLeaveMyInfo}
                                isLoading={leaveInRoomIsLoading}
                            >Leave</Button> 
                        </Box>
                    </Box>
                    <Box>
                        <Box
                            display={'grid'}
                            gridTemplateColumns={'auto auto'}
                            gap={'2'}
                            mt='2'
                        >
                            <Button
                                title='Room Balance'
                            >Room B {Number(room.currentBalance).toFixed(2)} $</Button>
                            <Button
                                title='My Balance'
                            >My B {Number(myBalance).toFixed(2)} $</Button> 
                            <Button
                                onClick={()=> provideSeePlayingCardInfo({roomId, id, userId})}
                                isLoading={seeCardIsLoading}
                                isDisabled={handleCheckSeeCardAvailable()}
                            >SEE CARD</Button> 
                            <Button
                                onClick={handleLeaveMyInfo}
                                isLoading={leaveInRoomIsLoading}
                            >Leave</Button>
                            <Button
                                onClick={()=> provideValidateUserInfo({roomId, id, userId:currentId})}
                                isLoading={validateUserIsLoading}
                            >Refresh</Button>
                        </Box>
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