import { Button } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetMyRoomQuery } from '../App/features/room/api';
import { addRoom } from '../App/features/room/roomSlice';
import LoadingComponent from '../Components/Loading/Loading';
import MyRoomMainComponents from '../Components/MyRoom/MyRoomMainComponents';

const MyRoom = () => {
    const navigate = useNavigate();
    const {roomId} = useParams(); 
    const {userId} = useSelector((state)=> state?.auth?.auth); 
    const {data, isLoading, isError, isSuccess, error} = useGetMyRoomQuery({roomId, userId});
    const {isFilled} = useSelector((state)=> state.room);
    const dispatch = useDispatch();

    useEffect(()=>{
        if(!isLoading && !isError && isSuccess && data && data?.id > 0 && !isFilled){
            dispatch(addRoom({room: data, roomId: data?.roomId, isFilled: true}))
        }
    },[data, isLoading, isError, isSuccess])
    // decide what to render
    let content = null;

    if(!isSuccess && !isError && isLoading){
        content = <LoadingComponent/>
    }
    if(!isSuccess && !isLoading && isError){
        content = <div className='loading__container'>
                    <h1>{error?.data?.error?.message || 'Internal server error'}</h1>
                    <Button onClick={()=> navigate('/boards')}>Go Back Board Page</Button>
                </div>
    };

    if(!isLoading && !isError && isSuccess){
        if(data && data?.id > 0 && isFilled){
            content = <MyRoomMainComponents/>
        }else{
            content = <div className='loading__container'>
                        <h1>Internal server error</h1>
                        <Button onClick={()=> navigate('/boards')}>Go Back Board Page</Button>
                    </div>
        }
    }

    return content;
};

export default MyRoom;