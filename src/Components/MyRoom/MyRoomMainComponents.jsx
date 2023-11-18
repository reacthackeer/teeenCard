import { Box } from '@chakra-ui/react';
import React from 'react';
import { useSelector } from 'react-redux';
import MemberRoom from './MemberRoom';
import PlayerRoom from './PlayerRoom';
import PlayingRoom from './PlayingRoom';

const MyRoomMainComponents = () => {

    const {member, player, playing} = useSelector((state)=> state?.room?.room);
    const userId = useSelector((state)=> state?.auth?.auth?.userId);

    const myCurrentPosition = () => {
        let position = 0;
        if(member.indexOf(userId) !== -1){
            position = 1;
        }

        let playerArray = player.filter((info)=> info?.userId === userId);
        let playingArray = playing.filter((info)=> info?.userId === userId);
        if(playerArray?.length > 0){
            position = 2;
        }

        if(playingArray?.length > 0){
            position = 3;
        }

        return position;
    }

    
    return (
        <Box className='my__room__component'>
            {
                myCurrentPosition() === 1 && <MemberRoom/>
            }
            {
                myCurrentPosition() === 2 && <PlayerRoom/>
            }
            {
                myCurrentPosition() === 3 && <PlayingRoom/>
            }
        </Box>
    );
};

export default MyRoomMainComponents;