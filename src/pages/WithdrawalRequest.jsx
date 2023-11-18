import { Button, useToast } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetAllWithdrawalRequestQuery } from '../App/features/withdrawalRequest/api';
import { addAllWithdrawalRequest } from '../App/features/withdrawalRequest/withdrawalRequest';
import WithdrawalRequestComponent from '../Components/DepositRequest/WithdrawalRequestComponent';
import LoadingComponent from '../Components/Loading/Loading';

const WithdrawalRequest = () => {
    const {data, isLoading, isSuccess, isError, error} = useGetAllWithdrawalRequestQuery();
    const {isFilled, data: stateData, isLoading: stateIsLoading} = useSelector((state)=> state.withdrawalRequest)
    
    const toast = useToast();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    useEffect(()=>{  
        if(!isLoading && isSuccess && !isError){
            if(data && data?.length > 0){ 
                dispatch(addAllWithdrawalRequest(data));
            }else{
                dispatch(addAllWithdrawalRequest([]));
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
                        <h1>No withdrawal request founded!</h1>
                        <Button onClick={()=> navigate('/profile')}>Go Back Profile</Button>
                    </div>
    }
    if(isFilled && stateData?.length > 0){
        content = <WithdrawalRequestComponent/>
    }
    return content;
};

export default WithdrawalRequest;