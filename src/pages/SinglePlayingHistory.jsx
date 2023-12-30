import { Button, Heading } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetSinglePlayingHistoryQuery } from '../App/features/playingHistory/copyApi';
import { historyUpdate } from '../App/features/room/roomSlice';
import LoadingComponent from '../Components/Loading/Loading';
import HistoryCardView from '../Components/MyRoom/HistoryCardView';

const SinglePlayingHistory = () => {
    const {historyLoaded, historyWithCard} = useSelector((state)=> state.room)
    const userId = useSelector((state)=> state.auth.auth.userId);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {playingId} = useParams(); 
    let {data, isLoading, isError, error, isSuccess} = useGetSinglePlayingHistoryQuery({userId, id: playingId});
    useEffect(()=>{
        if(!isError && !isLoading && isSuccess && data?.id){
            dispatch(historyUpdate({playingInfo: data.playingInfo, loaded: true}));
        }else{
            dispatch(historyUpdate({playingInfo: [], loaded: false}));
        }
    },[data, isLoading, isError, error, isSuccess])
    // decide what to render
    let content = null;
    if(!isError && isLoading && !isSuccess){
        content = <LoadingComponent/>
    };
    if(isError && !isLoading && error && !isSuccess){
        content = <div className='loading__container'>
                        <Heading fontSize={'large'}>Unauthenticated get request!</Heading>
                        <Button size={'sm'} mt='3' onClick={()=> navigate('/profile')}>Go Back Profile</Button>
                    </div>
    };

    if(!isError && !isLoading && isSuccess && !data?.id){
        content = <div className='loading__container'>
                        <Heading fontSize={'large'}>Internal server  error!</Heading>
                        <Button size={'sm'} mt='3' onClick={()=> navigate('/profile')}>Go Back Profile</Button>
                    </div>
    };
    
    if(!isError && !isLoading && isSuccess && data?.id && historyLoaded && historyWithCard?.length > 0){
        content = <div className='loading__container'>
                        <HistoryCardView/>
                    </div>
    };

    return content;
};

export default SinglePlayingHistory;