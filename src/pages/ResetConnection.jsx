import { Box, Button, Text, useToast } from '@chakra-ui/react';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useResetConnectionMutation } from '../App/features/auth/api';

const ResetConnection = () => {

    const [provideUserId,{data, isLoading, isError,isSuccess ,error}] = useResetConnectionMutation();
    const {userId} = useSelector((state)=> state.auth.auth);
    const [debounceLoading, setDebounceLoading] = useState('');
    const toast = useToast();
    useEffect(()=>{ 
        if(!isLoading && isSuccess && !isError){
        if(data && data?.status__code == 200){    
            toast({
            title: 'Successfully all connection reset!',
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
    
    const handleResetAllConnection = () => {
        setDebounceLoading(()=> false);
        if(userId){
            provideUserId(userId)
        }
    }

    const deleteDebounceFunction = _.debounce(handleResetAllConnection, 1000)

    const handleReset = () => {
        setDebounceLoading(()=> true);
        deleteDebounceFunction();
    }

    return (
        <Box p='2'>
            <Text textAlign={'justify'}>If you click the reset connection button you will be kicked out of all boards you have joined. Or if you can't join any board then you can reset your connection by clicking here</Text>
            <Button 
                isLoading={isLoading || debounceLoading} 
                onClick={handleReset}

            >Reset Your Connection</Button>
        </Box>
    );
};

export default ResetConnection;