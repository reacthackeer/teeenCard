import { Button, useToast } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetAllDepositRequestQuery } from '../App/features/depositRequest/api';
import { addAllDepositRequest } from '../App/features/depositRequest/depositRequest';
import DepositRequestComponent from '../Components/DepositRequest/DepositRequestComponent';
import LoadingComponent from '../Components/Loading/Loading';

const DepositRequest = () => {
    const {data, isLoading, isSuccess, isError, error} = useGetAllDepositRequestQuery();
    const {isFilled, data: stateData, isLoading: stateIsLoading} = useSelector((state)=> state.depositRequest)
    
    const toast = useToast();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    useEffect(()=>{  
        if(!isLoading && isSuccess && !isError){
            if(data && data?.length > 0){ 
                dispatch(addAllDepositRequest(data));
            }else{
                dispatch(addAllDepositRequest([]));
            }
        } 
    },[data, isLoading, isSuccess, isError, error])
    
    // decide what to render

    let content = null;

    if(stateIsLoading){
        content = <LoadingComponent/>
    }
    if(isFilled && stateData?.length === 0){
        content = <div className='loading__container'>
                        <h1>No deposit request founded!</h1>
                        <Button onClick={()=> navigate('/profile')}>Go Back Profile</Button>
                    </div>
    }

    
    if(isFilled && stateData?.length > 0){
        content = <DepositRequestComponent/>
    }
    return content;
};

export default DepositRequest;