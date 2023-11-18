import { Button } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useCheckSocketMutation } from '../../App/features/board/api';

const CheckSocket = () => {
    const [provideInfo,{data, isLoading, isError, error, isSuccess}] = useCheckSocketMutation();
    const handleCheckSocket = () => { 
        
        provideInfo();
    }

    useEffect(()=>{
        // console.log({data, isLoading, isError, error, isSuccess});
    },[data, isLoading, isError, error, isSuccess])
    return (
        <div>
            <Button isLoading={isLoading} onClick={handleCheckSocket}>Done</Button>
        </div>
    );
};

export default CheckSocket;